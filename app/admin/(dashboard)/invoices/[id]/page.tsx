import { notFound } from "next/navigation";
import Link from "next/link";
import { HiArrowLeft, HiExternalLink, HiPencil, HiLocationMarker } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import prisma from "@/lib/db";
import { formatLKR, formatDate, formatDateTime } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { computeTotals, isEditable, PAYMENT_SOURCE_LABEL, PAYHERE_STATUS_LABEL } from "@/lib/billing";
import { LOCATION_TYPE_LABEL } from "@/lib/registry";
import { qrPngDataUrl } from "@/lib/qr";
import { getAdminSession } from "@/lib/session";
import InvoiceStatusUpdater from "./InvoiceStatusUpdater";
import CopyLinkButton from "./CopyLinkButton";
import RefundButton from "./RefundButton";
import SendEmailButton from "./SendEmailButton";
import QrShareButton from "./QrShareButton";
import RecordPaymentButton from "./RecordPaymentButton";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  PAID:               "bg-emerald-900/30 text-emerald-400 border-emerald-800",
  PARTIALLY_PAID:     "bg-teal-900/30 text-teal-300 border-teal-800",
  PENDING:            "bg-amber-900/30 text-amber-400 border-amber-800",
  SENT:               "bg-blue-900/30 text-blue-400 border-blue-800",
  FAILED:             "bg-red-900/30 text-red-400 border-red-800",
  CANCELLED:          "bg-slate-800 text-slate-400 border-slate-700",
  ON_HOLD:            "bg-purple-900/30 text-purple-400 border-purple-800",
  REFUNDED:           "bg-orange-900/30 text-orange-400 border-orange-800",
  PARTIALLY_REFUNDED: "bg-orange-900/30 text-orange-300 border-orange-800",
};

async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      charges: true,
      payments: { orderBy: { initiatedAt: "desc" } },
      refunds: { orderBy: { createdAt: "desc" } },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 30 },
    },
  });
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[0.65rem] text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-white text-xs font-medium">{value}</p>
    </div>
  );
}

function LocationCard({ title, type, name, address, mapsUrl }: {
  title: string; type: keyof typeof LOCATION_TYPE_LABEL | null; name: string | null; address: string | null; mapsUrl: string | null;
}) {
  return (
    <div>
      <p className="text-[0.65rem] text-slate-500 uppercase tracking-wide mb-1">{title}</p>
      {name || address ? (
        <>
          <p className="text-white text-xs font-medium">
            {name}
            {type && <span className="ml-2 text-[0.6rem] uppercase px-1.5 py-0.5 rounded bg-navy-800 text-slate-300">{LOCATION_TYPE_LABEL[type]}</span>}
          </p>
          {address && <p className="text-slate-400 text-xs">{address}</p>}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-400 text-xs hover:underline mt-0.5">
              <HiLocationMarker /> Open in Maps
            </a>
          )}
        </>
      ) : (
        <p className="text-slate-600 text-xs">—</p>
      )}
    </div>
  );
}

export default async function AdminInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [invoice, session] = await Promise.all([getInvoice(id), getAdminSession()]);
  if (!invoice) notFound();

  const canWrite = session?.role !== "VIEWER";
  const totals = computeTotals(invoice.totalAmount, invoice.payments);
  const invoiceUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url}/invoice/${invoice.id}`;
  const editable = isEditable(invoice.status, invoice.payments);
  const canTakePayment = totals.balance > 0 && invoice.status !== "CANCELLED";
  const qrPng = await qrPngDataUrl(invoiceUrl);

  // WhatsApp send link
  const rawPhone = invoice.customer.phone.replace(/\D/g, "");
  const waPhone = rawPhone.startsWith("0") ? "94" + rawPhone.slice(1) : rawPhone;
  const waText = `Hello ${invoice.customer.name}, your invoice ${invoice.id} for ${formatLKR(totals.balance || totals.total)} from STJ Southern Ambulance is ready. Pay securely here: ${invoiceUrl}`;
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}`;

  // Snapshot only — registry edits after issue must not change what the invoice shows
  const billingAddress = invoice.billingAddress;
  const hasTrip = invoice.pickupName || invoice.pickupAddress || invoice.dropName || invoice.dropAddress;

  return (
    <div className="p-4 sm:p-6 max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-wrap">
        <Link href="/admin/invoices" className="text-slate-400 hover:text-slate-200 transition-colors p-1 -m-1" aria-label="Back to invoices">
          <HiArrowLeft className="text-xl" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-headline-sm text-white font-bold font-mono break-all">{invoice.id}</h1>
          <p className="text-slate-400 text-xs">
            Created {formatDateTime(invoice.createdAt)}
            {invoice.expiresAt && ` · Link expires ${formatDate(invoice.expiresAt)}`}
          </p>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${STATUS_BADGE[invoice.status] ?? STATUS_BADGE.PENDING}`}>
          {invoice.status.replace("_", " ")}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <CopyLinkButton url={invoiceUrl} />
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-medium transition-colors"
        >
          <FaWhatsapp /> Send via WhatsApp
        </a>
        <QrShareButton
          invoiceId={invoice.id}
          url={invoiceUrl}
          amount={formatLKR(totals.balance || totals.total)}
          customer={invoice.customer.name}
          pngDataUrl={qrPng}
        />
        {invoice.customer.email && (
          <SendEmailButton invoiceId={invoice.id} />
        )}
        <Link
          href={`/invoice/${invoice.id}`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-navy-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
        >
          <HiExternalLink /> Preview
        </Link>
        {canWrite && editable && (
          <Link
            href={`/admin/invoices/${invoice.id}/edit`}
            className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-navy-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <HiPencil /> Edit
          </Link>
        )}
        {canWrite && canTakePayment && <RecordPaymentButton invoiceId={invoice.id} balance={totals.balance} />}
        {canWrite && <InvoiceStatusUpdater invoiceId={invoice.id} currentStatus={invoice.status} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer */}
        <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5">
          <h2 className="text-xs text-slate-400 uppercase tracking-wide mb-3">Customer</h2>
          <p className="text-white font-semibold text-sm">{invoice.customer.name}</p>
          <p className="text-slate-400 text-xs">{invoice.customer.phone}</p>
          {invoice.customer.email && <p className="text-slate-400 text-xs">{invoice.customer.email}</p>}
          {billingAddress && (
            <div className="mt-2">
              <p className="text-[0.65rem] text-slate-500 uppercase tracking-wide">Billing Address</p>
              <p className="text-slate-300 text-xs whitespace-pre-line">{billingAddress}</p>
            </div>
          )}
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

      {/* Patient Details */}
      {(invoice.patientName || invoice.patientNic || invoice.ward || invoice.bedNumber) && (
        <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5">
          <h2 className="text-xs text-slate-400 uppercase tracking-wide mb-3">Patient Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Name" value={invoice.patientName} />
            <Field label="NIC" value={invoice.patientNic} />
            <Field label="Ward" value={invoice.ward} />
            <Field label="Bed No." value={invoice.bedNumber} />
          </div>
        </div>
      )}

      {/* Trip */}
      {hasTrip && (
        <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5">
          <h2 className="text-xs text-slate-400 uppercase tracking-wide mb-3">Trip</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LocationCard title="Pickup" type={invoice.pickupType} name={invoice.pickupName} address={invoice.pickupAddress} mapsUrl={invoice.pickupMapsUrl} />
            <LocationCard title="Drop" type={invoice.dropType} name={invoice.dropName} address={invoice.dropAddress} mapsUrl={invoice.dropMapsUrl} />
          </div>
        </div>
      )}

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
              <td className="px-5 py-3 text-right text-emerald-400 font-bold text-base">{formatLKR(totals.total)}</td>
            </tr>
            {totals.paid > 0 && (
              <>
                <tr>
                  <td colSpan={2} className="px-5 py-1.5 text-right text-xs text-slate-400">Paid</td>
                  <td className="px-5 py-1.5 text-right text-xs text-slate-200">− {formatLKR(totals.paid)}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="px-5 py-3 text-right text-sm font-semibold text-white">Balance Due</td>
                  <td className="px-5 py-3 text-right text-white font-bold text-base">{formatLKR(totals.balance)}</td>
                </tr>
                {totals.refunded > 0 && (
                  <>
                    <tr>
                      <td colSpan={2} className="px-5 py-1.5 text-right text-xs text-slate-400">Refunded to customer</td>
                      <td className="px-5 py-1.5 text-right text-xs text-orange-300">{formatLKR(totals.refunded)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-5 pb-3 pt-1.5 text-right text-xs text-slate-400">Net received</td>
                      <td className="px-5 pb-3 pt-1.5 text-right text-xs text-slate-200 font-semibold">{formatLKR(totals.net)}</td>
                    </tr>
                  </>
                )}
              </>
            )}
          </tfoot>
        </table>
      </div>

      {/* Payments */}
      {invoice.payments.length > 0 && (
        <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden">
          <h2 className="text-xs text-slate-400 uppercase tracking-wide px-5 py-3 border-b border-navy-800">Payment History</h2>
          <div className="divide-y divide-navy-800">
            {invoice.payments.map((pmt) => {
              const refundable = Math.round((Number(pmt.amount) - Number(pmt.refundedAmount)) * 100) / 100;
              return (
                <div key={pmt.id} className="px-4 sm:px-5 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-200">
                      {PAYMENT_SOURCE_LABEL[pmt.source] ?? pmt.source}
                      {pmt.method && ` · ${pmt.method}`}
                      {pmt.reference && <span className="text-slate-500"> · Ref {pmt.reference}</span>}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {formatDateTime(pmt.completedAt ?? pmt.initiatedAt)}
                      {pmt.payhereOrderId && ` · ${pmt.payhereOrderId}`}
                    </p>
                    {/* Full gateway reason — internal only; customers see a generic "contact STJ" message */}
                    {(pmt.statusCode || pmt.statusMessage) && (
                      <p className={`text-xs ${pmt.status === "FAILED" ? "text-red-300" : "text-slate-400"}`}>
                        {pmt.statusCode && (
                          <span className="font-mono">[{pmt.statusCode}] {PAYHERE_STATUS_LABEL[pmt.statusCode] ?? "Unknown"}</span>
                        )}
                        {pmt.statusCode && pmt.statusMessage && " — "}
                        {pmt.statusMessage}
                      </p>
                    )}
                    {Number(pmt.refundedAmount) > 0 && (
                      <p className="text-xs text-orange-300">Refunded {formatLKR(Number(pmt.refundedAmount))}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
                    {canWrite && pmt.status === "SUCCESS" && refundable > 0 && (
                      <RefundButton paymentId={pmt.id} invoiceId={invoice.id} source={pmt.source} refundable={refundable} />
                    )}
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{formatLKR(Number(pmt.amount))}</p>
                      <span className={`text-xs ${pmt.status === "SUCCESS" ? "text-emerald-400" : pmt.status === "PENDING" ? "text-amber-400" : pmt.status === "REFUNDED" ? "text-orange-400" : "text-red-400"}`}>
                        {pmt.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Refunds */}
      {invoice.refunds.length > 0 && (
        <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden">
          <h2 className="text-xs text-slate-400 uppercase tracking-wide px-5 py-3 border-b border-navy-800">Refunds</h2>
          <div className="divide-y divide-navy-800">
            {invoice.refunds.map((r) => (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-200">{r.reason}</p>
                  <p className="text-xs text-slate-500">
                    {PAYMENT_SOURCE_LABEL[r.method] ?? r.method} · {formatDateTime(r.createdAt)}
                    {r.reference && ` · Ref ${r.reference}`}
                  </p>
                </div>
                <p className="text-sm font-semibold text-orange-300">{formatLKR(Number(r.amount))}</p>
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
