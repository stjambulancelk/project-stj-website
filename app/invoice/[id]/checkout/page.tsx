import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { SITE, PAYHERE } from "@/lib/constants";
import { buildPayHerePayload } from "@/lib/payhere";
import { computeTotals, PAYABLE_STATUSES, isProcessingAtPayHere } from "@/lib/billing";
import { formatLKR } from "@/lib/utils";
import PayHereForm from "./PayHereForm";

export const dynamic = "force-dynamic";

async function getPayableInvoice(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, payments: true },
  });
  if (!invoice) return null;
  const expired = invoice.expiresAt && new Date() > invoice.expiresAt;
  if (!PAYABLE_STATUSES.includes(invoice.status) || expired) return null;
  // PayHere still processing a previous payment — don't allow a second charge
  if (isProcessingAtPayHere(invoice.payments)) return null;
  return invoice;
}

/**
 * One Payment row per PayHere attempt, order_id = "<invoiceId>-<n>".
 * Reuse the latest PENDING attempt for the same amount (page refresh / back button)
 * so we don't litter rows; the PayHere hash is deterministic for (order_id, amount).
 */
async function getCheckoutAttempt(invoiceId: string, amount: number) {
  const pending = await prisma.payment.findFirst({
    where: { invoiceId, status: "PENDING", source: "PAYHERE", payhereOrderId: { startsWith: `${invoiceId}-` } },
    orderBy: { initiatedAt: "desc" },
  });
  if (pending && Number(pending.amount) === amount) return pending;

  const attempts = await prisma.payment.count({ where: { invoiceId } });
  for (let n = attempts + 1; n < attempts + 5; n++) {
    try {
      return await prisma.payment.create({
        data: { invoiceId, payhereOrderId: `${invoiceId}-${n}`, amount, status: "PENDING", source: "PAYHERE" },
      });
    } catch {
      // order id taken by a concurrent request — try next number
    }
  }
  throw new Error("Could not allocate checkout attempt");
}

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getPayableInvoice(id);
  if (!invoice) redirect(`/invoice/${id}`);

  // Charge the outstanding balance (supports part-paid invoices, e.g. cash deposit + online remainder)
  const total = computeTotals(invoice.totalAmount, invoice.payments).balance;
  if (total <= 0) redirect(`/invoice/${id}`);

  const attempt = await getCheckoutAttempt(invoice.id, total);
  const payload = buildPayHerePayload({
    invoiceId: invoice.id,
    orderId: attempt.payhereOrderId!,
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
          <PayHereForm payload={payload} action={PAYHERE.baseUrl} />
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
