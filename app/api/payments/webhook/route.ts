import { NextRequest, NextResponse } from "next/server";
import type { PaymentStatus } from "@prisma/client";
import prisma, { TX_OPTIONS } from "@/lib/db";
import { verifyPayHereWebhook } from "@/lib/payhere";
import { sendPaymentConfirmationEmail } from "@/lib/mail";
import { PAYHERE } from "@/lib/constants";
import { syncInvoiceStatus } from "@/lib/billing";

/**
 * PayHere notify_url.
 * order_id is "<invoiceId>-<attempt>" (a Payment row created at checkout).
 * Legacy links used the bare invoice ID — handled by creating/updating a row keyed on it.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const get = (key: string) => formData.get(key)?.toString() ?? "";

    const merchantId       = get("merchant_id");
    const orderId          = get("order_id");
    const payherePaymentId = get("payment_id") || null;
    const payHereAmount    = get("payhere_amount");
    const payHereCurrency  = get("payhere_currency");
    const statusCode       = get("status_code");
    const md5sig           = get("md5sig");

    const valid = verifyPayHereWebhook({ merchantId, orderId, payHereAmount, payHereCurrency, statusCode, md5sig });
    if (!valid || merchantId !== PAYHERE.merchantId) {
      console.warn("PayHere webhook: invalid signature");
      return new NextResponse("Forbidden", { status: 403 });
    }

    const isSuccess = statusCode === "2";
    const isFailed  = statusCode === "-1" || statusCode === "-2" || statusCode === "-3";
    const status: PaymentStatus = isSuccess ? "SUCCESS" : isFailed ? "FAILED" : "PENDING";
    const amount    = parseFloat(payHereAmount);

    // Resolve the attempt row (new style) or invoice (legacy bare invoice ID)
    let payment = await prisma.payment.findUnique({ where: { payhereOrderId: orderId } });
    const invoiceId = payment?.invoiceId ?? orderId;
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { customer: true } });
    if (!invoice) return new NextResponse("Not found", { status: 404 });

    // Idempotency: a settled success is final — PayHere may retry notifications.
    if (payment?.status === "SUCCESS" || payment?.status === "REFUNDED") {
      return new NextResponse("OK", { status: 200 });
    }
    if (payment && Number(payment.amount) !== amount) {
      // Real money moved, so record what PayHere reports — but flag it.
      console.warn(`PayHere webhook: amount mismatch for ${orderId}: expected ${payment.amount}, got ${amount}`);
    }

    const fields = {
      payherePaymentId: payherePaymentId || undefined,
      amount,
      currency: payHereCurrency,
      method: get("method") || null,
      statusCode,
      statusMessage: get("status_message") || null,
      status,
      source: "PAYHERE" as const,
      completedAt: isSuccess ? new Date() : null,
    };

    const result = await prisma.$transaction(async (tx) => {
      payment = payment
        ? await tx.payment.update({ where: { id: payment.id }, data: fields })
        : await tx.payment.create({ data: { invoiceId, payhereOrderId: orderId, ...fields } });

      if (isSuccess) return syncInvoiceStatus(tx, invoiceId);
      if (isFailed && ["PENDING", "SENT"].includes(invoice.status)) {
        await tx.invoice.update({ where: { id: invoiceId }, data: { status: "FAILED" } });
      }
      return null;
    }, TX_OPTIONS);

    if (isSuccess && invoice.customer.email) {
      await sendPaymentConfirmationEmail({
        to: invoice.customer.email,
        customerName: invoice.customer.name,
        invoiceId,
        amount,
      }).catch(() => {});
    }

    await prisma.auditLog.create({
      data: {
        action: isSuccess ? "PAYMENT_SUCCESS" : isFailed ? "PAYMENT_FAILED" : "PAYMENT_WEBHOOK",
        entityType: "Invoice",
        entityId: invoiceId,
        invoiceId,
        hashedIp: "webhook",
        userAgentHash: "payhere",
        metadata: { statusCode, amount: payHereAmount, orderId, payherePaymentId, invoiceStatus: result?.status ?? null },
      } as never,
    }).catch(() => {});

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("PayHere webhook error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
