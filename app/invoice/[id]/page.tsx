import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HiPhone, HiMail, HiCheckCircle, HiXCircle, HiClock } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import prisma from "@/lib/db";
import { SITE } from "@/lib/constants";
import { formatLKR, formatDate, formatDateTime, getWhatsAppUrl } from "@/lib/utils";
import {
  computeTotals, PAYABLE_STATUSES, isProcessingAtPayHere, hasRecentUnconfirmedAttempt, lastAttemptFailed,
  type InvoiceTotals,
} from "@/lib/billing";
import { LOCATION_TYPE_LABEL } from "@/lib/registry";
import { qrPngDataUrl } from "@/lib/qr";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoice | STJ Southern Ambulance",
  robots: { index: false, follow: false },
};

async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      charges: true,
      payments: true,
    },
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
    PAID:      { label: "Paid", classes: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", icon: <HiCheckCircle /> },
    PENDING:   { label: "Awaiting Payment", classes: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", icon: <HiClock /> },
    SENT:      { label: "Awaiting Payment", classes: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", icon: <HiClock /> },
    FAILED:    { label: "Payment Not Completed", classes: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800", icon: <HiXCircle /> },
    CANCELLED: { label: "Cancelled", classes: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700", icon: <HiXCircle /> },
    PARTIALLY_PAID:     { label: "Part Paid", classes: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800", icon: <HiClock /> },
    REFUNDED:           { label: "Refunded", classes: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800", icon: <HiCheckCircle /> },
    PARTIALLY_REFUNDED: { label: "Partly Refunded", classes: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800", icon: <HiCheckCircle /> },
    ON_HOLD:   { label: "On Hold", classes: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", icon: <HiClock /> },
  };
  const s = map[status] ?? map["PENDING"];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${s.classes}`}>
      {s.icon} {s.label}
    </span>
  );
}

const CONTACT = `call ${SITE.phoneDisplay} or WhatsApp us`;

const NOTICE_TONE = {
  success: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
  info:    "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
  warn:    "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
  error:   "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
  neutral: "bg-slate-50 dark:bg-navy-900 border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300",
} as const;

/** One clear message per invoice state, so a revisited link always explains itself. */
function invoiceNotice(s: {
  status: string; totals: InvoiceTotals; isExpired: boolean; isPayable: boolean;
  processing: boolean; recentAttempt: boolean; failedBefore: boolean; paidAt: Date | null;
}): { tone: keyof typeof NOTICE_TONE; title: string; body: string } | null {
  const lkr = formatLKR;
  switch (s.status) {
    case "PAID":
      return { tone: "success", title: "Payment received — thank you",
        body: `${lkr(s.totals.net)} paid${s.paidAt ? ` on ${formatDateTime(s.paidAt)}` : ""}. No further action needed.` };
    case "REFUNDED":
      return { tone: "neutral", title: "Payment refunded",
        body: `${lkr(s.totals.refunded)} has been refunded. Card refunds can take 5–7 business days to appear.` };
    case "PARTIALLY_REFUNDED":
      return { tone: "neutral", title: "Partially refunded",
        body: `${lkr(s.totals.refunded)} of ${lkr(s.totals.paid)} has been refunded. Questions? ${CONTACT}.` };
    case "CANCELLED":
      return { tone: "neutral", title: "This invoice has been cancelled",
        body: `No payment is due. If you think this is a mistake, ${CONTACT}.` };
    case "ON_HOLD":
      return { tone: "info", title: "Invoice on hold",
        body: `Payment is paused while we review this invoice. We’ll be in touch — or ${CONTACT}.` };
  }
  if (!s.isPayable) return null;
  if (s.processing) {
    return { tone: "info", title: "Your payment is being processed",
      body: `Your payment is being confirmed. Please don’t pay again — this page will update once it’s done. Questions? ${CONTACT}.` };
  }
  if (s.isExpired) {
    return { tone: "error", title: "This payment link has expired",
      body: `${s.totals.balance < s.totals.total ? `Balance of ${lkr(s.totals.balance)} is still due. ` : ""}Please ${CONTACT} for a new link.` };
  }
  if (s.recentAttempt) {
    return { tone: "warn", title: "Just paid?",
      body: "If you completed a payment in the last few minutes, confirmation can take a moment. Refresh shortly before paying again." };
  }
  if (s.failedBefore) {
    // Customer never sees the gateway/bank reason — admins see it on the invoice's payment history
    return { tone: "warn", title: "Payment not completed",
      body: `We couldn’t complete your payment. Please try again, or ${CONTACT} and the STJ team will help you.` };
  }
  if (s.status === "PARTIALLY_PAID") {
    return { tone: "info", title: "Part payment received",
      body: `${lkr(s.totals.net)} paid. Remaining balance: ${lkr(s.totals.balance)}.` };
  }
  return null;
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  const totals = computeTotals(invoice.totalAmount, invoice.payments);
  const total = totals.total;
  const isPayable = PAYABLE_STATUSES.includes(invoice.status) && totals.balance > 0;
  const isExpired = invoice.expiresAt && new Date() > invoice.expiresAt;
  // Snapshot only — registry edits after issue must not change what the invoice shows
  const billingAddress = invoice.billingAddress;
  const hasTrip = invoice.pickupName || invoice.pickupAddress || invoice.dropName || invoice.dropAddress;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url;
  const processing = isProcessingAtPayHere(invoice.payments);
  const recentAttempt = hasRecentUnconfirmedAttempt(invoice.payments);
  const failedBefore = isPayable && !processing && lastAttemptFailed(invoice.payments);
  // Block paying again while PayHere says the last payment is still pending — avoids double charge
  const canPayNow = isPayable && !isExpired && !processing;
  const qrPng = canPayNow ? await qrPngDataUrl(`${siteUrl}/invoice/${invoice.id}`, 320) : null;
  const notice = invoiceNotice({
    status: invoice.status, totals, isExpired: !!isExpired, isPayable, processing, recentAttempt, failedBefore,
    paidAt: invoice.paidAt,
  });

  return (
    <div className="bg-surface dark:bg-navy-950 min-h-screen py-12">
      <div className="container-main max-w-2xl">

        {/* Header */}
        <div className="glass-card rounded-3xl p-8 mb-5">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-label-sm uppercase text-emerald-600 dark:text-emerald-400 mb-1">Invoice</p>
              <h1 className="text-headline-md text-navy-950 dark:text-white font-bold">{invoice.id}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                Issued: {formatDate(invoice.createdAt)}
                {invoice.expiresAt && ` · Expires: ${formatDate(invoice.expiresAt)}`}
              </p>
            </div>
            <StatusBadge status={invoice.status} />
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-200 dark:border-navy-700">
            <div>
              <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">From</p>
              <p className="text-sm font-semibold text-navy-950 dark:text-white">{SITE.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{SITE.addressShort}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{SITE.phoneDisplay}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Bill To</p>
              <p className="text-sm font-semibold text-navy-950 dark:text-white">{invoice.customer.name}</p>
              {invoice.customer.phone && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{invoice.customer.phone}</p>
              )}
              {invoice.customer.email && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{invoice.customer.email}</p>
              )}
              {billingAddress && (
                <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-line mt-1">{billingAddress}</p>
              )}
            </div>
          </div>

          {/* Patient Details */}
          {(invoice.patientName || invoice.patientNic || invoice.ward || invoice.bedNumber) && (
            <div className="mb-6 pb-6 border-b border-slate-200 dark:border-navy-700">
              <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Patient Details</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                {invoice.patientName && (
                  <div>
                    <p className="text-[0.65rem] text-slate-400 uppercase tracking-wide">Patient Name</p>
                    <p className="text-xs text-navy-950 dark:text-slate-200 font-medium">{invoice.patientName}</p>
                  </div>
                )}
                {invoice.patientNic && (
                  <div>
                    <p className="text-[0.65rem] text-slate-400 uppercase tracking-wide">NIC</p>
                    <p className="text-xs text-navy-950 dark:text-slate-200 font-medium">{invoice.patientNic}</p>
                  </div>
                )}
                {invoice.ward && (
                  <div className="mt-1">
                    <p className="text-[0.65rem] text-slate-400 uppercase tracking-wide">Ward</p>
                    <p className="text-xs text-navy-950 dark:text-slate-200 font-medium">{invoice.ward}</p>
                  </div>
                )}
                {invoice.bedNumber && (
                  <div className="mt-1">
                    <p className="text-[0.65rem] text-slate-400 uppercase tracking-wide">Bed No.</p>
                    <p className="text-xs text-navy-950 dark:text-slate-200 font-medium">{invoice.bedNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trip */}
          {hasTrip && (
            <div className="mb-6 pb-6 border-b border-slate-200 dark:border-navy-700 grid grid-cols-2 gap-6">
              {([
                ["Pickup", invoice.pickupType, invoice.pickupName, invoice.pickupAddress],
                ["Drop", invoice.dropType, invoice.dropName, invoice.dropAddress],
              ] as const).map(([label, type, name, address]) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">{label}</p>
                  {name || address ? (
                    <>
                      <p className="text-xs text-navy-950 dark:text-slate-200 font-medium">{name}</p>
                      {address && <p className="text-xs text-slate-500 dark:text-slate-400">{address}</p>}
                      {type && <p className="text-[0.65rem] text-slate-400 uppercase tracking-wide mt-0.5">{LOCATION_TYPE_LABEL[type]}</p>}
                    </>
                  ) : (
                    <p className="text-xs text-slate-400">—</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Service info */}
          <div className="mb-6 pb-6 border-b border-slate-200 dark:border-navy-700">
            <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Service</p>
            <p className="text-sm text-navy-950 dark:text-white">{invoice.description}</p>
            {invoice.serviceDate && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Date: {formatDate(invoice.serviceDate)}</p>
            )}
          </div>

          {/* Charges */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-700">
                <th className="text-left text-xs text-slate-400 uppercase tracking-wide pb-2 font-medium">Description</th>
                <th className="text-center text-xs text-slate-400 uppercase tracking-wide pb-2 font-medium">Qty</th>
                <th className="text-right text-xs text-slate-400 uppercase tracking-wide pb-2 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.charges.map((charge) => (
                <tr key={charge.id} className="border-b border-slate-100 dark:border-navy-800">
                  <td className="py-2.5 text-navy-950 dark:text-slate-200 text-xs">{charge.description}</td>
                  <td className="py-2.5 text-center text-slate-500 dark:text-slate-400 text-xs">{charge.quantity}</td>
                  <td className="py-2.5 text-right text-navy-950 dark:text-slate-200 text-xs font-medium">
                    {formatLKR(Number(charge.amount) * charge.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="pt-4 text-right text-sm font-semibold text-navy-950 dark:text-white">Total (LKR)</td>
                <td className="pt-4 text-right text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatLKR(total)}
                </td>
              </tr>
              {totals.paid > 0 && (
                <>
                  <tr>
                    <td colSpan={2} className="pt-2 text-right text-xs text-slate-500 dark:text-slate-400">Paid</td>
                    <td className="pt-2 text-right text-xs text-slate-600 dark:text-slate-300">− {formatLKR(totals.paid)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="pt-2 text-right text-sm font-semibold text-navy-950 dark:text-white">Balance Due</td>
                    <td className="pt-2 text-right text-base font-bold text-navy-950 dark:text-white">{formatLKR(totals.balance)}</td>
                  </tr>
                  {totals.refunded > 0 && (
                    <tr>
                      <td colSpan={2} className="pt-1 text-right text-xs text-slate-500 dark:text-slate-400">Refunded to you</td>
                      <td className="pt-1 text-right text-xs text-slate-600 dark:text-slate-300">{formatLKR(totals.refunded)}</td>
                    </tr>
                  )}
                </>
              )}
            </tfoot>
          </table>

          {/* Payment state — what the customer sees when they revisit the link */}
          {notice && (
            <div className={`rounded-2xl border p-4 text-center mb-4 ${NOTICE_TONE[notice.tone]}`}>
              <p className="text-sm font-semibold">{notice.title}</p>
              <p className="text-xs mt-1 opacity-90">{notice.body}</p>
            </div>
          )}

          {canPayNow && (
            <Link
              href={`/invoice/${invoice.id}/checkout`}
              className="btn-primary w-full justify-center text-base"
            >
              {failedBefore ? "Try Again — " : "Pay "}{formatLKR(totals.balance)}{failedBefore ? "" : " Now"}
            </Link>
          )}

          {/* QR — lets a customer viewing on a desktop/printout continue on their phone */}
          {qrPng && (
            <div className="hidden sm:flex items-center gap-4 mt-5 p-4 rounded-2xl border border-slate-200 dark:border-navy-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrPng} alt="Scan to pay on your phone" width={96} height={96} className="rounded-lg bg-white p-1" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="block font-semibold text-navy-950 dark:text-white mb-0.5">Pay on your phone</span>
                Scan this code with your phone camera to open this invoice and pay securely.
              </p>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="text-center space-y-3">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Payments are processed securely via PayHere. We do not store your card details.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`tel:${SITE.phone}`} className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
              <HiPhone /> {SITE.phoneDisplay}
            </a>
            <a href={getWhatsAppUrl(SITE.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
              <FaWhatsapp /> WhatsApp
            </a>
            <a href={`mailto:${SITE.email}`} className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
              <HiMail /> {SITE.email}
            </a>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Questions? <Link href="/terms" className="underline hover:text-emerald-600">Terms</Link> ·{" "}
            <Link href="/privacy" className="underline hover:text-emerald-600">Privacy Policy</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
