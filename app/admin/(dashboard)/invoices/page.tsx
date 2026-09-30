import Link from "next/link";
import { HiPlus, HiSearch, HiEye } from "react-icons/hi";
import prisma from "@/lib/db";
import { formatLKR, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  PAID:      "bg-emerald-900/30 text-emerald-400 border-emerald-800",
  PARTIALLY_PAID:     "bg-teal-900/30 text-teal-300 border-teal-800",
  PARTIALLY_REFUNDED: "bg-orange-900/30 text-orange-300 border-orange-800",
  PENDING:   "bg-amber-900/30 text-amber-400 border-amber-800",
  SENT:      "bg-blue-900/30 text-blue-400 border-blue-800",
  FAILED:    "bg-red-900/30 text-red-400 border-red-800",
  CANCELLED: "bg-slate-800 text-slate-400 border-slate-700",
  ON_HOLD:   "bg-purple-900/30 text-purple-400 border-purple-800",
};

const STATUS_FILTERS = ["ALL", "PENDING", "SENT", "PARTIALLY_PAID", "PAID", "FAILED", "CANCELLED", "ON_HOLD", "REFUNDED", "PARTIALLY_REFUNDED"];

async function getInvoices(status?: string, search?: string) {
  return prisma.invoice.findMany({
    where: {
      ...(status && status !== "ALL" ? { status: status as never } : {}),
      ...(search ? {
        OR: [
          { id: { contains: search, mode: "insensitive" } },
          { customer: { name: { contains: search, mode: "insensitive" } } },
          { patientName: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { customer: { select: { name: true, phone: true } } },
  });
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const invoices = await getInvoices(status, q);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-headline-sm text-white font-bold">Invoices</h1>
        <Link
          href="/admin/invoices/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
        >
          <HiPlus /> New Invoice
        </Link>
      </div>

      {/* Filters — one swipeable row on phones, wrapped on larger screens */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={`/admin/invoices?status=${s}${q ? `&q=${q}` : ""}`}
            className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
              (status ?? "ALL") === s
                ? "bg-emerald-600 text-white"
                : "bg-navy-800 text-slate-400 hover:bg-navy-700 hover:text-slate-200"
            }`}
          >
            {s.replace("_", " ")}
          </Link>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <form method="GET" action="/admin/invoices">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search ID or customer…"
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-900 border border-navy-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
          />
        </form>
      </div>

      {/* Phone: tappable cards */}
      <div className="sm:hidden space-y-2">
        {invoices.length === 0 && (
          <p className="rounded-2xl bg-navy-900 border border-navy-800 px-4 py-10 text-center text-slate-500 text-sm">No invoices found</p>
        )}
        {invoices.map((inv) => (
          <Link
            key={inv.id}
            href={`/admin/invoices/${inv.id}`}
            className="block rounded-2xl bg-navy-900 border border-navy-800 p-4 active:bg-navy-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-slate-200 text-sm font-medium truncate">{inv.customer.name}</p>
                <p className="font-mono text-emerald-400 text-xs">{inv.id}</p>
              </div>
              <p className="text-white font-semibold text-sm whitespace-nowrap">{formatLKR(Number(inv.totalAmount))}</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-slate-500 text-xs">{formatDate(inv.createdAt)} · {inv.customer.phone}</p>
              <span className={`text-[0.65rem] px-2 py-0.5 rounded-full border ${STATUS_BADGE[inv.status] ?? STATUS_BADGE.PENDING}`}>
                {inv.status.replace("_", " ")}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Tablet / desktop: table */}
      <div className="hidden sm:block rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-800">
                <th className="text-left px-5 py-3 text-xs text-slate-400 uppercase tracking-wide font-medium">Invoice</th>
                <th className="text-left px-5 py-3 text-xs text-slate-400 uppercase tracking-wide font-medium">Customer</th>
                <th className="text-left px-5 py-3 text-xs text-slate-400 uppercase tracking-wide font-medium hidden md:table-cell">Date</th>
                <th className="text-right px-5 py-3 text-xs text-slate-400 uppercase tracking-wide font-medium">Amount</th>
                <th className="text-center px-5 py-3 text-xs text-slate-400 uppercase tracking-wide font-medium">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">No invoices found</td>
                </tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-navy-800/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-emerald-400 text-xs">{inv.id}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-slate-200 text-sm">{inv.customer.name}</p>
                    <p className="text-slate-500 text-xs">{inv.customer.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs hidden md:table-cell">{formatDate(inv.createdAt)}</td>
                  <td className="px-5 py-3.5 text-right text-slate-200 font-semibold">{formatLKR(Number(inv.totalAmount))}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_BADGE[inv.status] ?? STATUS_BADGE.PENDING}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/invoices/${inv.id}`} className="text-slate-400 hover:text-emerald-400 transition-colors">
                      <HiEye />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
