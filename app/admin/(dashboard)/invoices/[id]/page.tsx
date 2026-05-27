import { notFound } from "next/navigation";
import Link from "next/link";
import { HiArrowLeft, HiExternalLink, HiClipboardCopy } from "react-icons/hi";
import prisma from "@/lib/db";
import { formatLKR, formatDate, formatDateTime } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import InvoiceStatusUpdater from "./InvoiceStatusUpdater";
import CopyLinkButton from "./CopyLinkButton";

const STATUS_BADGE: Record<string, string> = {
  PAID:      "bg-emerald-900/30 text-emerald-400 border-emerald-800",
  PENDING:   "bg-amber-900/30 text-amber-400 border-amber-800",
  SENT:      "bg-blue-900/30 text-blue-400 border-blue-800",
  FAILED:    "bg-red-900/30 text-red-400 border-red-800",
  CANCELLED: "bg-slate-800 text-slate-400 border-slate-700",
  ON_HOLD:   "bg-purple-900/30 text-purple-400 border-purple-800",
};

async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      charges: true,
      payments: { orderBy: { initiatedAt: "desc" } },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

export default async function AdminInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  const total = Number(invoice.totalAmount);
  const invoiceUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url}/invoice/${invoice.id}`;

  return (
    <div className="p-6 max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/invoices" className="text-slate-400 hover:text-slate-200 transition-colors">
          <HiArrowLeft className="text-xl" />
        </Link>
        <div className="flex-1">
          <h1 className="text-headline-sm text-white font-bold font-mono">{invoice.id}</h1>
          <p className="text-slate-400 text-xs">Created {formatDateTime(invoice.createdAt)}</p>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${STATUS_BADGE[invoice.status] ?? STATUS_BADGE.PENDING}`}>
          {invoice.status}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <CopyLinkButton url={invoiceUrl} />
        <Link
          href={`/invoice/${invoice.id}`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
        >
          <HiExternalLink /> Preview
        </Link>
        <InvoiceStatusUpdater invoiceId={invoice.id} currentStatus={invoice.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer */}
        <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5">
          <h2 className="text-xs text-slate-400 uppercase tracking-wide mb-3">Customer</h2>
          <p className="text-white font-semibold text-sm">{invoice.customer.name}</p>
          <p className="text-slate-400 text-xs">{invoice.customer.phone}</p>
          {invoice.customer.email && <p className="text-slate-400 text-xs">{invoice.customer.email}</p>}
          {invoice.customer.address && <p className="text-slate-500 text-xs mt-1">{invoice.customer.address}</p>}
        </div>

        {/* Service */}
        <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5">
          <h2 className="text-xs text-slate-400 uppercase tracking-wide mb-3">Service</h2>
          <p className="text-white text-sm">{invoice.description}</p>
          {invoice.serviceDate && <p className="text-slate-400 text-xs mt-1">Date: {formatDate(invoice.serviceDate)}</p>}
          {invoice.vehicle && <p className="text-slate-400 text-xs">Vehicle: {invoice.vehicle}</p>}
          {invoice.crewNotes && <p className="text-slate-500 text-xs mt-2 italic">{invoice.crewNotes}</p>}
        </div>
      </div>

      {/* Charges */}
      <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden">
        <h2 className="text-xs text-slate-400 uppercase tracking-wide px-5 py-3 border-b border-navy-800">Charges</h2>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-navy-800">
            {invoice.charges.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3 text-slate-200 text-xs">{c.description}</td>
                <td className="px-5 py-3 text-center text-slate-400 text-xs">×{c.quantity}</td>
                <td className="px-5 py-3 text-right text-slate-200 text-xs font-medium">
                  {formatLKR(Number(c.amount) * c.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-navy-700">
              <td colSpan={2} className="px-5 py-3 text-right text-sm font-semibold text-white">Total</td>
              <td className="px-5 py-3 text-right text-emerald-400 font-bold text-base">{formatLKR(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payments */}
      {invoice.payments.length > 0 && (
        <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden">
          <h2 className="text-xs text-slate-400 uppercase tracking-wide px-5 py-3 border-b border-navy-800">Payment History</h2>
          <div className="divide-y divide-navy-800">
            {invoice.payments.map((pmt) => (
              <div key={pmt.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-200">{pmt.statusMessage ?? pmt.status}</p>
                  <p className="text-xs text-slate-500">{pmt.method ?? "—"} · {formatDateTime(pmt.initiatedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{formatLKR(Number(pmt.amount))}</p>
                  <span className={`text-xs ${pmt.status === "SUCCESS" ? "text-emerald-400" : "text-red-400"}`}>
                    {pmt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit log */}
      {invoice.auditLogs.length > 0 && (
        <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden">
          <h2 className="text-xs text-slate-400 uppercase tracking-wide px-5 py-3 border-b border-navy-800">Audit Trail</h2>
          <div className="divide-y divide-navy-800 max-h-64 overflow-y-auto">
            {invoice.auditLogs.map((log) => (
              <div key={log.id} className="px-5 py-2.5 flex items-center justify-between">
                <p className="text-xs text-slate-300">{log.action}</p>
                <p className="text-xs text-slate-500">{formatDateTime(log.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
