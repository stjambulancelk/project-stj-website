"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HiHome, HiDocumentText, HiUsers, HiPencil, HiChartBar,
  HiClipboardList, HiUserGroup, HiLogout, HiMenu, HiX,
  HiNewspaper, HiPlus,
} from "react-icons/hi";
import { FaAmbulance } from "react-icons/fa";
import { SITE } from "@/lib/constants";

const NAV = [
  { href: "/admin/dashboard", icon: HiHome, label: "Dashboard" },
  { href: "/admin/invoices", icon: HiDocumentText, label: "Invoices" },
  { href: "/admin/invoices/new", icon: HiPlus, label: "New Invoice" },
  { href: "/admin/customers", icon: HiUsers, label: "Customers" },
  { href: "/admin/cms", icon: HiPencil, label: "CMS" },
  { href: "/admin/news", icon: HiNewspaper, label: "News Posts" },
  { href: "/admin/reports", icon: HiChartBar, label: "Reports" },
  { href: "/admin/logs", icon: HiClipboardList, label: "Audit Logs" },
  { href: "/admin/users", icon: HiUserGroup, label: "Users" },
];

interface Props {
  user: { email: string; name: string; role: string };
}

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    // Railway strips Set-Cookie — clear cookie from client side too.
    document.cookie = "stj_session=; Path=/; Max-Age=0; SameSite=Lax";
    window.location.href = "/admin/login";
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-navy-800">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-transparent.png"
            alt="STJ"
            width={36}
            height={36}
            className="w-9 h-9 flex-shrink-0"
          />
          <div>
            <p className="text-white text-xs font-bold leading-tight">{SITE.name}</p>
            <p className="text-emerald-400 text-[10px]">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href) && href !== "/admin/invoices/new");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                active
                  ? "bg-emerald-500/15 text-emerald-400 font-medium"
                  : "text-slate-400 hover:bg-navy-800 hover:text-slate-200"
              }`}
            >
              <Icon className="text-base flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-navy-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {(user.name ?? user.email).split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{user.name ?? user.email}</p>
            <p className="text-slate-500 text-[10px] capitalize">{user.role.replace("_", " ").toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all"
        >
          <HiLogout className="text-base" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-navy-950 border-r border-navy-800 min-h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-navy-950 border-b border-navy-800 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <FaAmbulance className="text-emerald-400" />
          <span className="text-white text-sm font-bold">STJ Admin</span>
        </div>
        <button onClick={() => setMobileOpen(p => !p)} className="text-slate-400 hover:text-white p-1">
          {mobileOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div className="w-56 bg-navy-950 border-r border-navy-800 pt-14 flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
