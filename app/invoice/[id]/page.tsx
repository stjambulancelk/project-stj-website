import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HiPhone, HiMail, HiCheckCircle, HiXCircle, HiClock } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import prisma from "@/lib/db";
import { SITE } from "@/lib/constants";
import { formatLKR, formatDate, formatDateTime, getWhatsAppUrl } from "@/lib/utils";

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
      payments: { orderBy: { initiatedAt: "desc" }, take: 1 },
    },
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
    PAID:      { label: "Paid", classes: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", icon: <HiCheckCircle /> },
    PENDING:   { label: "Awaiting Payment", classes: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", icon: <HiClock /> },
    SENT:      { label: "Awaiting Payment", classes: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", icon: <HiClock /> },
    FAILED:    { label: "Payment Failed", classes: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800", icon: <HiXCircle /> },
    CANCELLED: { label: "Cancelled", classes: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700", icon: <HiXCircle /> },
    ON_HOLD:   { label: "On Hold", classes: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", icon: <HiClock /> },
  };
  const s = map[status] ?? map["PENDING"];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${s.classes}`}>
      {s.icon} {s.label}
    </span>
  );
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  const total = Number(invoice.totalAmount);
  const isPayable = invoice.status === "PENDING" || invoice.status === "SENT" || invoice.status === "FAILED";
  const isExpired = invoice.expiresAt && new Date() > invoice.expiresAt;

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
            </tfoot>
          </table>

          {/* Pay button */}
          {invoice.status === "PAID" && (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
              <HiCheckCircle className="text-3xl text-emerald-500 mx-auto mb-2" />
              <p className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm">Payment received</p>
              {invoice.paidAt && (
                <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-1">{formatDateTime(invoice.paidAt)}</p>
              )}
            </div>
          )}

          {isExpired && isPayable && (
            <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-center">
              <p className="text-red-700 dark:text-red-300 text-sm font-semibold">Invoice expired</p>
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                Contact us to generate a new invoice.
              </p>
            </div>
          )}

          {!isExpired && isPayable && (
            <Link
              href={`/invoice/${invoice.id}/checkout`}
              className="btn-primary w-full justify-center text-base"
            >
              Pay {formatLKR(total)} Now
            </Link>
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
