import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifyToken(token) : null;

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="dark">
      <div className="min-h-screen bg-navy-950 text-slate-200 flex">
        <AdminSidebar user={{ email: session.email, role: session.role }} />
        <main className="flex-1 overflow-auto pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
