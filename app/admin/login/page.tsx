"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { FaAmbulance } from "react-icons/fa";
import { SITE } from "@/lib/constants";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? "Invalid credentials");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error — check your connection");
      setStatus("error");
    }
  }

  return (
    <div className="dark min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 mb-4">
            <FaAmbulance className="text-2xl text-emerald-400" />
          </div>
          <h1 className="text-headline-sm text-white font-bold">{SITE.name}</h1>
          <p className="text-slate-400 text-xs mt-1">Admin Portal</p>
        </div>

        {/* Form card */}
        <div className="glass rounded-2xl p-7">
          <h2 className="text-body-md font-semibold text-white mb-5">Sign in to continue</h2>

          {status === "error" && (
            <div className="rounded-xl bg-red-900/30 border border-red-800 p-3 mb-4 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-navy-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
                placeholder="you@stj.lk"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-navy-900 border border-navy-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPw ? <HiEyeOff /> : <HiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Authorised personnel only &nbsp;·&nbsp; {SITE.name}
        </p>
      </div>
    </div>
  );
}
