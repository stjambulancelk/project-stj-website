import Link from "next/link";
import { HiDocumentText, HiCurrencyDollar, HiClock, HiUsers, HiPlus, HiCheckCircle } from "react-icons/hi";
import prisma from "@/lib/db";
import { formatLKR, formatDate } from "@/lib/utils";

async function getDashboardData() {
  const [
    paidRevenue,
    outstandingAgg,
    statusCounts,
    recentInvoices,
    recentPayments,
    totalCustomers,
  ] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
    prisma.invoice.aggregate({ where: { status: { in: ["PENDING", "SENT"] } }, _sum: { totalAmount: true }, _count: true }),
    prisma.invoice.groupBy({ by: ["status"], _count: true }),
    prisma.invoice.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } } },
    }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { initiatedAt: "desc" },
      where: { status: "SUCCESS" },
      include: { invoice: { select: { id: true, customer: { select: { name: true } } } } },
    }),
    prisma.customer.count(),
  ]);

  return { paidRevenue, outstandingAgg, statusCounts, recentInvoices, recentPayments, totalCustomers };
}

const STATUS_BADGE: Record<string, string> = {
  PAID:      "bg-emerald-900/30 text-emerald-400 border-emerald-800",
  PENDING:   "bg-amber-900/30 text-amber-400 border-amber-800",
  SENT:      "bg-blue-900/30 text-blue-400 border-blue-800",
  FAILED:    "bg-red-900/30 text-red-400 border-red-800",
  CANCELLED: "bg-slate-800 text-slate-400 border-slate-700",
  ON_HOLD:   "bg-purple-900/30 text-purple-400 border-purple-800",
};

export default async function DashboardPage() {
  const { paidRevenue, outstandingAgg, recentInvoices, recentPayments, totalCustomers } =
    await getDashboardData();

  const revenue = Number(paidRevenue._sum.amount ?? 0);
  const outstanding = Number(outstandingAgg._sum.totalAmount ?? 0);
  const outstandingCount = outstandingAgg._count;

  const KPIs = [
    { label: "Total Revenue", value: formatLKR(revenue), icon: HiCurrencyDollar, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Outstanding", value: formatLKR(outstanding), sub: `${outstandingCount} invoice${outstandingCount !== 1 ? "s" : ""}`, icon: HiClock, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Customers", value: totalCustomers.toString(), icon: HiUsers, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Recent Payments", value: recentPayments.length.toString(), sub: "last 5 successful", icon: HiCheckCircle, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-sm text-white font-bold">Dashboard</h1>
          <p className="text-slate-400 text-xs mt-0.5">STJ Southern Ambulance — Admin</p>
        </div>
        <Link href="/admin/invoices/new" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">
          <HiPlus /> New Invoice
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIs.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-2xl bg-navy-900 border border-navy-800 p-5">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                <Icon className={`text-lg ${kpi.color}`} />
              </div>
              <p className="text-slate-400 text-xs mb-1">{kpi.label}</p>
              <p className="text-white text-lg font-bold">{kpi.value}</p>
              {kpi.sub && <p className="text-slate-500 text-xs mt-0.5">{kpi.sub}</p>}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent invoices */}
        <div className="lg:col-span-2 rounded-2xl bg-navy-900 border border-navy-800">
          <div className="flex items-center justify-between p-5 border-b border-navy-800">
            <div className="flex items-center gap-2">
              <HiDocumentText className="text-slate-400" />
              <h2 className="text-sm font-semibold text-white">Recent Invoices</h2>
            </div>
            <Link href="/admin/invoices" className="text-xs text-emerald-400 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-navy-800">
            {recentInvoices.length === 0 && (
              <p className="p-5 text-slate-500 text-sm text-center">No invoices yet</p>
            )}
            {recentInvoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/admin/invoices/${inv.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-navy-800/50 transition-colors group"
              >
                <div>
                  <p className="text-sm text-white font-medium group-hover:text-emerald-400 transition-colors">{inv.id}</p>
                  <p className="text-xs text-slate-400">{inv.customer.name} · {formatDate(inv.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-slate-200">{formatLKR(Number(inv.totalAmount))}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[inv.status] ?? STATUS_BADGE.PENDING}`}>
                    {inv.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent payments */}
        <div className="rounded-2xl bg-navy-900 border border-navy-800">
          <div className="flex items-center gap-2 p-5 border-b border-navy-800">
            <HiCheckCircle className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Payments Received</h2>
          </div>
          <div className="divide-y divide-navy-800">
            {recentPayments.length === 0 && (
              <p className="p-5 text-slate-500 text-sm text-center">No payments yet</p>
            )}
            {recentPayments.map((pmt) => (
              <div key={pmt.id} className="px-5 py-3.5">
                <p className="text-sm text-white font-medium">{formatLKR(Number(pmt.amount))}</p>
                <p className="text-xs text-slate-400">{pmt.invoice.customer.name}</p>
                <p className="text-xs text-slate-500">{pmt.invoice.id}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
