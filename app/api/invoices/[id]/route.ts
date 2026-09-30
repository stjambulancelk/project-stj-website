import { NextRequest, NextResponse } from "next/server";
import type { InvoiceStatus } from "@prisma/client";
import prisma, { TX_OPTIONS } from "@/lib/db";
import { requireAdmin, WRITE_ROLES } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { isEditable, MANUAL_STATUSES } from "@/lib/billing";
import { parseInvoiceInput, resolveRegistries, InputError } from "@/lib/invoice-input";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: {
      id: true,
      description: true,
      serviceDate: true,
      totalAmount: true,
      status: true,
      expiresAt: true,
      createdAt: true,
      customer: { select: { name: true } },
      charges: { select: { description: true, amount: true, quantity: true } },
    },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

// PUT — full edit. Only while no money has been taken against the invoice.
export async function PUT(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin(WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const before = await prisma.invoice.findUnique({ where: { id }, include: { charges: true, payments: true } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isEditable(before.status, before.payments)) {
    return NextResponse.json(
      { error: "Invoice has payments or is closed — refund or cancel instead of editing" },
      { status: 409 }
    );
  }

  const parsed = parseInvoiceInput(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const input = parsed.value;

  try {
    await prisma.$transaction(async (tx) => {
      const fields = await resolveRegistries(tx, input);
      await tx.invoiceCharge.deleteMany({ where: { invoiceId: id } });
      await tx.invoice.update({
        where: { id },
        data: {
          ...fields,
          ...(input.expiresInDays !== null
            ? { expiresAt: input.expiresInDays > 0 ? new Date(Date.now() + input.expiresInDays * 86_400_000) : null }
            : {}),
          charges: { create: input.charges },
        },
      });
      // Pending checkout attempts were signed for the old amount — retire them.
      await tx.payment.updateMany({
        where: { invoiceId: id, status: "PENDING" },
        data: { status: "FAILED", statusMessage: "Superseded by invoice edit" },
      });
    }, TX_OPTIONS);

    await logAudit(request, "INVOICE_UPDATED", {
      actorId: auth.userId, entityType: "Invoice", entityId: id, invoiceId: id,
      metadata: {
        edit: true,
        totalBefore: Number(before.totalAmount),
        totalAfter: input.totalAmount,
        chargesBefore: before.charges.map((c) => `${c.description} ×${c.quantity} @ ${Number(c.amount)}`),
        chargesAfter: input.charges.map((c) => `${c.description} ×${c.quantity} @ ${c.amount}`),
      },
    });
    return NextResponse.json({ id });
  } catch (err) {
    if (err instanceof InputError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH — quick status / crew fields. Money-driven statuses (PAID, REFUNDED, PARTIALLY_*)
// are set only by payments & refunds.
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin(WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const data: { status?: InvoiceStatus; vehicle?: string | null; crewNotes?: string | null } = {};

  if ("status" in body) {
    if (!MANUAL_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: "Use Record Payment / Refund to change payment status" },
        { status: 400 }
      );
    }
    data.status = body.status;
  }
  if ("vehicle" in body) data.vehicle = body.vehicle || null;
  if ("crewNotes" in body) data.crewNotes = body.crewNotes || null;

  const exists = await prisma.invoice.findUnique({ where: { id }, select: { status: true } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const invoice = await prisma.invoice.update({ where: { id }, data });

  await logAudit(request, "INVOICE_UPDATED", {
    actorId: auth.userId, entityType: "Invoice", entityId: id, invoiceId: id,
    metadata: { ...(data.status ? { statusFrom: exists.status, statusTo: data.status } : {}) },
  });
  return NextResponse.json(invoice);
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin(["SUPER_ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { _count: { select: { payments: true } } } });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invoice._count.payments > 0) {
    return NextResponse.json({ error: "Invoice has payment records — cancel it instead" }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.auditLog.updateMany({ where: { invoiceId: id }, data: { invoiceId: null } }),
    prisma.invoice.delete({ where: { id } }),
  ]);

  await logAudit(request, "INVOICE_DELETED", { actorId: auth.userId, entityType: "Invoice", entityId: id });
  return NextResponse.json({ ok: true });
}
