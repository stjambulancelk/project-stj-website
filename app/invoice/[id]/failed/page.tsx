import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/db";
import { computeTotals, PAYABLE_STATUSES, isProcessingAtPayHere } from "@/lib/billing";
import { HiExclamationCircle, HiPhone, HiMail } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { SITE } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment Not Completed | STJ Southern Ambulance",
  robots: { index: false, follow: false },
};

export default async function PaymentFailedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { payments: true } });
  if (!invoice) notFound();

  // Revisited after the invoice was paid / is being processed / closed → the invoice page explains the real state
  const totals = computeTotals(invoice.totalAmount, invoice.payments);
  if (totals.balance <= 0 || isProcessingAtPayHere(invoice.payments) || !PAYABLE_STATUSES.includes(invoice.status)) {
    redirect(`/invoice/${id}`);
  }
  const expired = !!invoice.expiresAt && new Date() > invoice.expiresAt;

  return (
    <div className="bg-surface dark:bg-navy-950 min-h-screen flex items-center justify-center py-16">
      <div className="container-main max-w-md text-center">

        <div className="glass-card rounded-3xl p-10">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
            <HiExclamationCircle className="text-4xl text-amber-500" />
          </div>

          <h1 className="text-headline-md text-navy-950 dark:text-white mb-2">Payment Not Completed</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Invoice {id}</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed">
            {/* Deliberately generic — the gateway/bank reason is shown to admins only */}
            We couldn’t complete your payment.
            {expired
              ? " This payment link has now expired — please contact STJ Southern Ambulance and our team will help you."
              : " Please try again, or contact STJ Southern Ambulance and our team will help you."}
          </p>

          <div className="space-y-3 mb-8">
            {!expired && (
              <Link href={`/invoice/${id}/checkout`} className="btn-emergency w-full justify-center">
                Try Again
              </Link>
            )}
            <Link href={`/invoice/${id}`} className="btn-ghost w-full justify-center">
              Back to Invoice
            </Link>
          </div>

          <div className="border-t border-slate-200 dark:border-navy-700 pt-6 space-y-2">
            <p className="text-xs text-slate-400">Need help with payment?</p>
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
