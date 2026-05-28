import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendInvoiceEmail } from "@/lib/mail";
import { SITE } from "@/lib/constants";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true },
  });

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!invoice.customer.email) {
    return NextResponse.json({ error: "Customer has no email address" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url;
  const invoiceUrl = `${siteUrl}/invoice/${invoice.id}`;

  await sendInvoiceEmail({
    to: invoice.customer.email,
    customerName: invoice.customer.name,
    invoiceId: invoice.id,
    amount: Number(invoice.totalAmount),
    description: invoice.description,
    invoiceUrl,
  });

  await prisma.auditLog
    .create({
      data: {
        action: "INVOICE_EMAIL_SENT",
        entityType: "Invoice",
        entityId: invoice.id,
        invoiceId: invoice.id,
        hashedIp: "admin",
        userAgentHash: "admin",
      } as never,
    })
    .catch(() => {});

  // Mark as SENT if still PENDING
  if (invoice.status === "PENDING") {
    await prisma.invoice.update({ where: { id }, data: { status: "SENT" } });
  }

  return NextResponse.json({ ok: true });
}
