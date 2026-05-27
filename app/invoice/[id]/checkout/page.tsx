import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/db";
import { SITE } from "@/lib/constants";
import { buildPayHerePayload } from "@/lib/payhere";
import { formatLKR } from "@/lib/utils";
import PayHereForm from "./PayHereForm";

async function getPayableInvoice(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true },
  });
  if (!invoice) return null;
  const payable = invoice.status === "PENDING" || invoice.status === "SENT" || invoice.status === "FAILED";
  const expired = invoice.expiresAt && new Date() > invoice.expiresAt;
  if (!payable || expired) return null;
  return invoice;
}

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getPayableInvoice(id);
  if (!invoice) redirect(`/invoice/${id}`);

  const total = Number(invoice.totalAmount);
  const payload = buildPayHerePayload({
    invoiceId: invoice.id,
    amount: total,
    description: invoice.description,
    customerName: invoice.customer.name,
    customerEmail: invoice.customer.email ?? SITE.email,
    customerPhone: invoice.customer.phone,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url,
  });

  return (
    <div className="bg-surface dark:bg-navy-950 min-h-screen flex items-center justify-center py-12">
      <div className="container-main max-w-md text-center">

        <div className="glass-card rounded-3xl p-8 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="text-emerald-600 dark:text-emerald-400 w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-headline-sm text-navy-950 dark:text-white mb-2">Secure Payment</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Invoice {invoice.id}</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-5">{formatLKR(total)}</p>

          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
            Redirecting to PayHere secure checkout…<br />
            If you are not redirected,{" "}
            <button form="payhere-form" type="submit" className="text-emerald-600 dark:text-emerald-400 underline">
              click here
            </button>.
          </p>

          {/* Auto-submit client component */}
          <PayHereForm payload={payload} />
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500">
          Payments processed by{" "}
          <span className="font-semibold text-slate-500 dark:text-slate-400">PayHere</span>{" "}
          — PCI-DSS compliant. We do not store card details.
        </p>
      </div>
    </div>
  );
}
