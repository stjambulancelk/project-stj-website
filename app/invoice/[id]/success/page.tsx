import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { HiCheckCircle, HiClock, HiPhone, HiMail } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { SITE } from "@/lib/constants";
import { getWhatsAppUrl, formatLKR } from "@/lib/utils";
import prisma from "@/lib/db";
import { computeTotals, lastAttemptFailed, isProcessingAtPayHere, hasRecentUnconfirmedAttempt } from "@/lib/billing";
import AutoRefresh from "../AutoRefresh";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment Successful | STJ Southern Ambulance",
  robots: { index: false, follow: false },
};

export default async function PaymentSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { payments: true } });
  if (!invoice) notFound();

  // PayHere's browser redirect (return_url) can arrive before its server notification,
  // and anyone can open this URL — so trust the DB, not the URL.
  const totals = computeTotals(invoice.totalAmount, invoice.payments);
  const confirmed = totals.paid > 0 && ["PAID", "PARTIALLY_PAID"].includes(invoice.status);
  // A newer attempt still in flight (PayHere pending, or checkout opened in the last 30 min) wins over an older failure
  const inFlight = isProcessingAtPayHere(invoice.payments) || hasRecentUnconfirmedAttempt(invoice.payments, 30);
  if (!confirmed && !inFlight) {
    redirect(lastAttemptFailed(invoice.payments) ? `/invoice/${id}/failed` : `/invoice/${id}`);
  }

  return (
    <div className="bg-surface dark:bg-navy-950 min-h-screen flex items-center justify-center py-16">
      <div className="container-main max-w-md text-center">

        <div className="glass-card rounded-3xl p-10">
          {confirmed ? (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
                <HiCheckCircle className="text-4xl text-emerald-500" />
              </div>
              <h1 className="text-headline-md text-navy-950 dark:text-white mb-2">Payment Successful</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Invoice {id}</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                Thank you — {formatLKR(totals.net)} received.
                {totals.balance > 0 && <> Remaining balance: <strong>{formatLKR(totals.balance)}</strong>.</>}
                {" "}A confirmation email will be sent shortly. Our team will be in touch to confirm your booking details.
              </p>
            </>
          ) : (
            <>
              <AutoRefresh />
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
                <HiClock className="text-4xl text-amber-500 animate-pulse" />
              </div>
              <h1 className="text-headline-md text-navy-950 dark:text-white mb-2">Confirming your payment…</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Invoice {id}</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                We’re waiting for PayHere to confirm. This usually takes a few seconds and this page updates by itself.
                <strong> Please don’t pay again.</strong> If it doesn’t update within a few minutes, contact us.
              </p>
            </>
          )}

          <div className="space-y-3 mb-8">
            <Link href={`/invoice/${id}`} className="btn-primary w-full justify-center">
              View Invoice
            </Link>
            <Link href="/" className="btn-ghost w-full justify-center">
              Back to Home
            </Link>
          </div>

          <div className="border-t border-slate-200 dark:border-navy-700 pt-6 space-y-2">
            <p className="text-xs text-slate-400">Need help? Contact us:</p>
            <div className="flex justify-center gap-4">
              <a href={`tel:${SITE.phone}`} className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                <HiPhone /> {SITE.phoneDisplay}
              </a>
              <a href={getWhatsAppUrl(SITE.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                <FaWhatsapp /> WhatsApp
              </a>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                <HiMail /> Email
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
