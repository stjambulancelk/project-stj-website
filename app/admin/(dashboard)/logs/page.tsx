import prisma from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

async function getLogs(page = 0) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    skip: page * 50,
    include: { actor: { select: { email: true } } },
  });
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const logs = await getLogs(parseInt(page ?? "0"));

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-headline-sm text-white font-bold">Audit Logs</h1>
        <p className="text-slate-400 text-xs mt-1">IP addresses stored as SHA-256 hashes — PDPA compliant. Retained 90 days.</p>
      </div>

      <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-navy-800">
                {["Timestamp", "Action", "Entity", "Actor", "IP Hash"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-slate-400 uppercase tracking-wide font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {logs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">No log entries yet</td></tr>
              )}
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-navy-800/40">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-200 font-medium">{log.action}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {log.entityType && <span>{log.entityType}</span>}
                    {log.entityId && <span className="text-slate-500 ml-1 font-mono">{log.entityId.slice(0, 12)}…</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{log.actor?.email ?? "system"}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono">{log.hashedIp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
