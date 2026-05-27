import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyPayHereWebhook } from "@/lib/payhere";
import { sendPaymentConfirmationEmail } from "@/lib/mail";
import { PAYHERE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const get = (key: string) => formData.get(key)?.toString() ?? "";

    const merchantId   = get("merchant_id");
    const orderId      = get("order_id");
    const payHereAmount = get("payhere_amount");
    const payHereCurrency = get("payhere_currency");
    const statusCode   = get("status_code");
    const md5sig       = get("md5sig");

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

    // Create payment record
    await prisma.payment.create({
      data: {
        invoiceId: orderId,
        payhereOrderId: orderId,
        amount: parseFloat(payHereAmount),
        currency: payHereCurrency,
        method: get("method"),
        statusCode,
        statusMessage: get("status_message"),
        status: isSuccess ? "SUCCESS" : isFailed ? "FAILED" : "PENDING",
        completedAt: isSuccess ? new Date() : null,
      },
    }).catch(() => {}); // ignore duplicate on retry

    // Update invoice status
    if (isSuccess) {
      await prisma.invoice.update({
        where: { id: orderId },
        data: { status: "PAID", paidAt: new Date() },
      });

      // Send confirmation email
      if (invoice.customer.email) {
        await sendPaymentConfirmationEmail({
          to: invoice.customer.email,
          customerName: invoice.customer.name,
          invoiceId: orderId,
          amount: parseFloat(payHereAmount),
        }).catch(() => {});
      }
    } else if (isFailed) {
      await prisma.invoice.update({ where: { id: orderId }, data: { status: "FAILED" } });
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
        metadata: { statusCode, amount: payHereAmount },
      } as never,
    }).catch(() => {});

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("PayHere webhook error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
