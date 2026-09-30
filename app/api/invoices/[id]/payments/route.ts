import { NextRequest, NextResponse } from "next/server";
import type { PaymentSource } from "@prisma/client";
import prisma, { TX_OPTIONS } from "@/lib/db";
import { requireAdmin, WRITE_ROLES } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { computeTotals, syncInvoiceStatus } from "@/lib/billing";
import { str, date } from "@/lib/registry";

const MANUAL_SOURCES: PaymentSource[] = ["CASH", "BANK_TRANSFER", "CHEQUE", "OTHER"];

// POST /api/invoices/:id/payments — record an offline payment (cash, bank transfer, cheque).
// Replaces the old "set status to PAID by hand" so every rupee has a record.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const amount = Math.round(parseFloat(String(body.amount)) * 100) / 100;
  const source = body.source as PaymentSource;

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Enter a valid amount" }, { status: 400 });
  }
  if (!MANUAL_SOURCES.includes(source)) {
    return NextResponse.json({ error: "Choose a payment method" }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { payments: true } });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invoice.status === "CANCELLED") {
    return NextResponse.json({ error: "Invoice is cancelled" }, { status: 409 });
  }

  const { balance } = computeTotals(invoice.totalAmount, invoice.payments);
  if (amount > balance) {
    return NextResponse.json({ error: `Amount exceeds balance due (${balance.toFixed(2)})` }, { status: 400 });
  }

  const receivedAt = date(body.receivedAt) ?? new Date();
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        invoiceId: id,
        amount,
        source,
        status: "SUCCESS",
        reference: str(body.reference, 100) ?? null,
        note: str(body.note, 500) ?? null,
        recordedBy: auth.userId,
        statusMessage: "Recorded by admin",
        initiatedAt: receivedAt,
        completedAt: receivedAt,
      },
    });
    const sync = await syncInvoiceStatus(tx, id);
    return { payment, sync };
  }, TX_OPTIONS);

  await logAudit(request, "PAYMENT_RECORDED", {
    actorId: auth.userId, entityType: "Invoice", entityId: id, invoiceId: id,
    metadata: { paymentId: result.payment.id, amount, source, reference: result.payment.reference },
  });
  return NextResponse.json({ ok: true, status: result.sync?.status, totals: result.sync?.totals }, { status: 201 });
}
