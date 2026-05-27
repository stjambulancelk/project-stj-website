import { HiCurrencyDollar, HiDocumentText, HiCheckCircle, HiXCircle } from "react-icons/hi";
import prisma from "@/lib/db";
import { formatLKR } from "@/lib/utils";

async function getReportData() {
  const [
    totalRevenue,
    paidCount,
    pendingAgg,
    failedCount,
    cancelledCount,
    monthlyPayments,
  ] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true }, _count: true }),
    prisma.invoice.count({ where: { status: "PAID" } }),
    prisma.invoice.aggregate({ where: { status: { in: ["PENDING", "SENT"] } }, _sum: { totalAmount: true }, _count: true }),
    prisma.invoice.count({ where: { status: "FAILED" } }),
    prisma.invoice.count({ where: { status: "CANCELLED" } }),
    prisma.payment.findMany({
      where: { status: "SUCCESS" },
      orderBy: { initiatedAt: "desc" },
      take: 20,
      select: { amount: true, method: true, initiatedAt: true, invoice: { select: { id: true, customer: { select: { name: true } } } } },
    }),
  ]);
  return { totalRevenue, paidCount, pendingAgg, failedCount, cancelledCount, monthlyPayments };
}

export default async function ReportsPage() {
  const { totalRevenue, paidCount, pendingAgg, failedCount, cancelledCount, monthlyPayments } = await getReportData();
  const revenue = Number(totalRevenue._sum.amount ?? 0);
  const outstanding = Number(pendingAgg._sum.totalAmount ?? 0);

  const stats = [
    { label: "Total Revenue Collected", value: formatLKR(revenue), icon: HiCurrencyDollar, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Paid Invoices", value: paidCount.toString(), icon: HiCheckCircle, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Outstanding", value: formatLKR(outstanding), sub: `${pendingAgg._count} invoices`, icon: HiDocumentText, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Failed / Cancelled", value: (failedCount + cancelledCount).toString(), icon: HiXCircle, color: "text-red-400", bg: "bg-red-500/10" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-sm text-white font-bold">Reports</h1>
        <p className="text-slate-500 text-xs">All-time figures</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl bg-navy-900 border border-navy-800 p-5">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon className={`text-lg ${s.color}`} />
              </div>
              <p className="text-slate-400 text-xs mb-1">{s.label}</p>
              <p className="text-white text-lg font-bold">{s.value}</p>
              {s.sub && <p className="text-slate-500 text-xs mt-0.5">{s.sub}</p>}
            </div>
          );
        })}
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-navy-800">
          <h2 className="text-sm font-semibold text-white">Recent Successful Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-800">
                {["Invoice", "Customer", "Amount", "Method", "Date"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-slate-400 uppercase tracking-wide font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {monthlyPayments.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500 text-sm">No payments yet</td></tr>
              )}
              {monthlyPayments.map((p, i) => (
                <tr key={i} className="hover:bg-navy-800/50">
                  <td className="px-5 py-3 text-emerald-400 font-mono text-xs">{p.invoice.id}</td>
                  <td className="px-5 py-3 text-slate-200 text-xs">{p.invoice.customer.name}</td>
                  <td className="px-5 py-3 text-white font-semibold text-xs">{formatLKR(Number(p.amount))}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{p.method ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(p.initiatedAt)}
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
