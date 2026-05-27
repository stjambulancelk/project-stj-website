import prisma from "@/lib/db";
import { formatDate } from "@/lib/utils";
import AddUserButton from "./AddUserButton";

async function getUsers() {
  return prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
  });
}

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-900/30 text-purple-400 border-purple-800",
  DISPATCHER:  "bg-blue-900/30 text-blue-400 border-blue-800",
  VIEWER:      "bg-slate-800 text-slate-400 border-slate-700",
};

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-sm text-white font-bold">Admin Users</h1>
        <AddUserButton />
      </div>

      <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-800">
                {["Name", "Email", "Role", "Status", "Last Login", "Since"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-slate-400 uppercase tracking-wide font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {users.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500 text-sm">No users yet</td></tr>
              )}
              {users.map(u => (
                <tr key={u.id} className="hover:bg-navy-800/50">
                  <td className="px-5 py-3.5 text-slate-200 font-medium text-sm">{u.name}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${ROLE_BADGE[u.role] ?? ROLE_BADGE.VIEWER}`}>
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs ${u.isActive ? "text-emerald-400" : "text-slate-500"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">
                    {u.lastLoginAt ? formatDate(u.lastLoginAt) : "Never"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
