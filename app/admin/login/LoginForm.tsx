"use client";

import { useState } from "react";
import Image from "next/image";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { SITE } from "@/lib/constants";
import { loginAction } from "./actions";

const SESSION_COOKIE = "stj_admin_session";
const SESSION_MAX_AGE = 8 * 60 * 60;

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const result = await loginAction(form.email, form.password).catch(() => null);
    if (!result) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setStatus("error");
      return;
    }
    if ("error" in result) {
      setErrorMsg(result.error);
      setStatus("error");
      return;
    }
    // Railway strips Set-Cookie headers — set the session cookie from client JS instead.
    // The cookie is not httpOnly but is verified server-side on every request.
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${SESSION_COOKIE}=${result.token}; Path=/; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}${secure}`;
    window.location.href = "/admin/dashboard";
  }

  return (
    <div className="dark min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image src="/logo-transparent.png" alt="STJ" width={56} height={56} className="w-14 h-14" />
          </div>
          <h1 className="text-headline-sm text-white font-bold">{SITE.name}</h1>
          <p className="text-slate-400 text-xs mt-1">Admin Portal</p>
        </div>

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
