import { NextRequest, NextResponse } from "next/server";
import type { PaymentSource } from "@prisma/client";
import prisma, { TX_OPTIONS } from "@/lib/db";
import { requireAdmin, WRITE_ROLES } from "@/lib/session";
import { getPayHerePaymentByOrderId, refundPayHerePayment } from "@/lib/payhere-api";
import { sendRefundEmail } from "@/lib/mail";
import { logAudit } from "@/lib/audit";
import { syncInvoiceStatus } from "@/lib/billing";
import { str } from "@/lib/registry";

const MANUAL_METHODS: PaymentSource[] = ["CASH", "BANK_TRANSFER", "CHEQUE", "OTHER"];

/**
 * POST /api/payments/:id/refund  { amount?, reason, method? }
 *
 * - PayHere payment, full remaining amount, no method → PayHere Refund API
 *   (PayHere's API refunds the whole payment only).
 * - Anything else (partial, or cash/bank payment) → recorded as a manual refund;
 *   `method` says how the money was returned.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { id: paymentId } = await params;
  const body = await request.json().catch(() => ({}));
  const reason = str(body.reason, 500) || "Refund requested by admin";

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { invoice: { include: { customer: true } } },
  });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  if (payment.status !== "SUCCESS") {
    return NextResponse.json({ error: "Only successful payments can be refunded" }, { status: 400 });
  }

  const remaining = Math.round((Number(payment.amount) - Number(payment.refundedAmount)) * 100) / 100;
  const amount = body.amount === undefined || body.amount === ""
    ? remaining
    : Math.round(parseFloat(String(body.amount)) * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0 || amount > remaining) {
    return NextResponse.json({ error: `Refund amount must be between 0 and ${remaining.toFixed(2)}` }, { status: 400 });
  }

  const manualMethod = MANUAL_METHODS.includes(body.method) ? (body.method as PaymentSource) : null;
  const viaPayHere = payment.source === "PAYHERE" && !manualMethod;

  let reference: string | null = str(body.reference, 100) ?? null;

  if (viaPayHere) {
    if (amount !== remaining || Number(payment.refundedAmount) > 0) {
      return NextResponse.json(
        { error: "PayHere refunds the full payment only. For a partial refund choose Cash / Bank transfer and return the money manually." },
        { status: 400 }
      );
    }
    let payherePaymentId = payment.payherePaymentId;
    if (!payherePaymentId) {
      const found = await getPayHerePaymentByOrderId(payment.payhereOrderId ?? payment.invoiceId).catch(() => null);
      payherePaymentId = found?.id ?? null;
    }
    if (!payherePaymentId) {
      return NextResponse.json(
        { error: "Cannot find PayHere payment ID. Refund in the PayHere portal, then record it here as a manual refund." },
        { status: 422 }
      );
    }
    const result = await refundPayHerePayment(payherePaymentId, reason);
    if (!result.ok) {
      return NextResponse.json({ error: result.message ?? "PayHere refund failed" }, { status: 502 });
    }
    reference = payherePaymentId;
  } else if (!manualMethod) {
    return NextResponse.json({ error: "Choose how the money was returned" }, { status: 400 });
  }

  const newRefunded = Math.round((Number(payment.refundedAmount) + amount) * 100) / 100;
  const sync = await prisma.$transaction(async (tx) => {
    await tx.refund.create({
      data: {
        paymentId,
        invoiceId: payment.invoiceId,
        amount,
        reason,
        method: viaPayHere ? "PAYHERE" : manualMethod!,
        reference,
        createdBy: auth.userId,
      },
    });
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        refundedAmount: newRefunded,
        ...(newRefunded >= Number(payment.amount) ? { status: "REFUNDED" } : {}),
      },
    });
    return syncInvoiceStatus(tx, payment.invoiceId);
  }, TX_OPTIONS);

  await logAudit(request, "PAYMENT_REFUNDED", {
    actorId: auth.userId, entityType: "Invoice", entityId: payment.invoiceId, invoiceId: payment.invoiceId,
    metadata: { paymentId, amount, reason, method: viaPayHere ? "PAYHERE" : manualMethod, reference },
  });

  const customer = payment.invoice.customer;
  if (customer.email) {
    await sendRefundEmail({
      to: customer.email,
      customerName: customer.name,
      invoiceId: payment.invoiceId,
      amount,
      reason,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, status: sync?.status });
}
