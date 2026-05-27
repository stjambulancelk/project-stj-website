import Link from "next/link";
import { HiSearch, HiDocumentText } from "react-icons/hi";
import prisma from "@/lib/db";
import { formatDate } from "@/lib/utils";

async function getCustomers(search?: string) {
  return prisma.customer.findMany({
    where: search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { _count: { select: { invoices: true } } },
  });
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await getCustomers(q);

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-headline-sm text-white font-bold">Customers</h1>

      {/* Search */}
      <div className="relative max-w-xs">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <form method="GET">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, phone, email…"
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-900 border border-navy-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
          />
        </form>
      </div>

      <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-800">
                {["Name", "Phone", "Email", "Invoices", "Since", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-slate-400 uppercase tracking-wide font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {customers.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500 text-sm">No customers found</td></tr>
              )}
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-navy-800/50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-200 text-sm font-medium">{c.name}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{c.phone}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{c.email ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-navy-800 text-slate-300">{c._count.invoices}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{formatDate(c.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/invoices?q=${encodeURIComponent(c.name)}`}
                      className="text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      <HiDocumentText />
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
