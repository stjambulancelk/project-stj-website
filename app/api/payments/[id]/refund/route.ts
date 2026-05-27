import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";
import { getPayHerePaymentByOrderId, refundPayHerePayment } from "@/lib/payhere-api";
import { sendRefundEmail } from "@/lib/mail";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: paymentId } = await params;
  const body = await request.json().catch(() => ({}));
  const reason: string = body.reason?.trim() || "Refund requested by admin";

  // Load payment + invoice + customer
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { invoice: { include: { customer: true } } },
  });

  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  if (payment.status !== "SUCCESS") {
    return NextResponse.json({ error: "Only successful payments can be refunded" }, { status: 400 });
  }
  if (payment.invoice.status === "REFUNDED") {
    return NextResponse.json({ error: "Invoice already refunded" }, { status: 400 });
  }

  // Resolve PayHere payment_id — saved from webhook, or fall back to Retrieval API
  let payherePaymentId = payment.payherePaymentId;
  if (!payherePaymentId) {
    const found = await getPayHerePaymentByOrderId(payment.invoice.id).catch(() => null);
    payherePaymentId = found?.id ?? null;
  }

  if (!payherePaymentId) {
    return NextResponse.json(
      { error: "Cannot find PayHere payment ID. Log into PayHere portal to refund manually." },
      { status: 422 }
    );
  }

  // Call PayHere Refund API
  const result = await refundPayHerePayment(payherePaymentId, reason);
  if (!result.ok) {
    return NextResponse.json({ error: result.message ?? "PayHere refund failed" }, { status: 502 });
  }

  // Update DB
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: "REFUNDED" },
    }),
    prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: "REFUNDED" },
    }),
    prisma.auditLog.create({
      data: {
        action: "PAYMENT_REFUNDED",
        entityType: "Invoice",
        entityId: payment.invoiceId,
        invoiceId: payment.invoiceId,
        actorId: session.id,
        hashedIp: request.headers.get("x-hashed-ip") ?? "admin",
        userAgentHash: "admin",
        metadata: { paymentId, payherePaymentId, reason },
      } as never,
    }),
  ]);

  // Email customer
  const customer = payment.invoice.customer;
  if (customer.email) {
    await sendRefundEmail({
      to: customer.email,
      customerName: customer.name,
      invoiceId: payment.invoiceId,
      amount: Number(payment.amount),
      reason,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
