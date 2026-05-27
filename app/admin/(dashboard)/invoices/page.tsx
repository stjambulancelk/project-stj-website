import Link from "next/link";
import { HiPlus, HiSearch, HiEye } from "react-icons/hi";
import prisma from "@/lib/db";
import { formatLKR, formatDate } from "@/lib/utils";

const STATUS_BADGE: Record<string, string> = {
  PAID:      "bg-emerald-900/30 text-emerald-400 border-emerald-800",
  PENDING:   "bg-amber-900/30 text-amber-400 border-amber-800",
  SENT:      "bg-blue-900/30 text-blue-400 border-blue-800",
  FAILED:    "bg-red-900/30 text-red-400 border-red-800",
  CANCELLED: "bg-slate-800 text-slate-400 border-slate-700",
  ON_HOLD:   "bg-purple-900/30 text-purple-400 border-purple-800",
};

const STATUS_FILTERS = ["ALL", "PENDING", "SENT", "PAID", "FAILED", "CANCELLED", "ON_HOLD"];

async function getInvoices(status?: string, search?: string) {
  return prisma.invoice.findMany({
    where: {
      ...(status && status !== "ALL" ? { status: status as never } : {}),
      ...(search ? {
        OR: [
          { id: { contains: search, mode: "insensitive" } },
          { customer: { name: { contains: search, mode: "insensitive" } } },
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
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-headline-sm text-white font-bold">Invoices</h1>
        <Link
          href="/admin/invoices/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
        >
          <HiPlus /> New Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={`/admin/invoices?status=${s}${q ? `&q=${q}` : ""}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              (status ?? "ALL") === s
                ? "bg-emerald-600 text-white"
                : "bg-navy-800 text-slate-400 hover:bg-navy-700 hover:text-slate-200"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
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

      {/* Table */}
      <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden">
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
