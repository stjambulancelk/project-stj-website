import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyPayHereWebhook } from "@/lib/payhere";
import { sendPaymentConfirmationEmail } from "@/lib/mail";
import { PAYHERE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const get = (key: string) => formData.get(key)?.toString() ?? "";

    const merchantId      = get("merchant_id");
    const orderId         = get("order_id");
    const payherePaymentId = get("payment_id") || null;
    const payHereAmount   = get("payhere_amount");
    const payHereCurrency = get("payhere_currency");
    const statusCode      = get("status_code");
    const md5sig          = get("md5sig");

    // Verify signature
    const valid = verifyPayHereWebhook({ merchantId, orderId, payHereAmount, payHereCurrency, statusCode, md5sig });
    if (!valid || merchantId !== PAYHERE.merchantId) {
      console.warn("PayHere webhook: invalid signature");
      return new NextResponse("Forbidden", { status: 403 });
    }

    const isSuccess = statusCode === "2";
    const isFailed  = statusCode === "-1" || statusCode === "-2" || statusCode === "-3";

    const invoice = await prisma.invoice.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });
    if (!invoice) return new NextResponse("Not found", { status: 404 });

    // Idempotency: check if this payment_id was already processed
    const idempotencyKey = payherePaymentId ?? orderId;
    const existing = await prisma.payment.findFirst({
      where: payherePaymentId
        ? { payherePaymentId }
        : { payhereOrderId: orderId, status: { in: ["SUCCESS", "FAILED"] } },
    });

    if (existing) {
      // Already processed — return 200 so PayHere stops retrying
      return new NextResponse("OK", { status: 200 });
    }

    const paymentStatus = isSuccess ? "SUCCESS" : isFailed ? "FAILED" : "PENDING";

    // Persist payment + invoice status atomically
    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          invoiceId: orderId,
          payhereOrderId: orderId,
          payherePaymentId: payherePaymentId || undefined,
          amount: parseFloat(payHereAmount),
          currency: payHereCurrency,
          method: get("method"),
          statusCode,
          statusMessage: get("status_message"),
          status: paymentStatus,
          completedAt: isSuccess ? new Date() : null,
        },
      });

      if (isSuccess) {
        await tx.invoice.update({
          where: { id: orderId },
          data: { status: "PAID", paidAt: new Date() },
        });
      } else if (isFailed) {
        await tx.invoice.update({ where: { id: orderId }, data: { status: "FAILED" } });
      }
    });

    // Send confirmation email (outside transaction — non-critical)
    if (isSuccess && invoice.customer.email) {
      await sendPaymentConfirmationEmail({
        to: invoice.customer.email,
        customerName: invoice.customer.name,
        invoiceId: orderId,
        amount: parseFloat(payHereAmount),
      }).catch(() => {});
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: isSuccess ? "PAYMENT_SUCCESS" : "PAYMENT_FAILED",
        entityType: "Invoice",
        entityId: orderId,
        invoiceId: orderId,
        hashedIp: "webhook",
        userAgentHash: "payhere",
        metadata: { statusCode, amount: payHereAmount, idempotencyKey },
      } as never,
    }).catch(() => {});

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("PayHere webhook error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
