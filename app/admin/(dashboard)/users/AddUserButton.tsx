"use client";

import { useState } from "react";
import { HiPlus, HiX } from "react-icons/hi";
import { useRouter } from "next/navigation";

const ROLES = ["SUPER_ADMIN", "DISPATCHER", "VIEWER"];
const I = "w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500";
const L = "block text-[0.7rem] font-medium text-slate-400 mb-1";

export default function AddUserButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "DISPATCHER" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed");
      }
      setOpen(false);
      setForm({ name: "", email: "", password: "", role: "DISPATCHER" });
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
      >
        <HiPlus /> Add User
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-sm bg-navy-900 rounded-2xl border border-navy-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">New Admin User</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <HiX />
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-red-900/30 border border-red-800 p-3 mb-4 text-red-300 text-xs">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className={L}>Full Name *</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={I} placeholder="Name" />
              </div>
              <div>
                <label className={L}>Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={I} placeholder="user@stj.lk" />
              </div>
              <div>
                <label className={L}>Temporary Password *</label>
                <input required type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className={I} placeholder="min 8 chars" minLength={8} />
              </div>
              <div>
                <label className={L}>Role *</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className={I}>
                  {ROLES.map(r => <option key={r} value={r} className="bg-navy-900">{r.replace("_", " ")}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl bg-navy-800 text-slate-300 text-sm font-medium hover:bg-navy-700">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold disabled:opacity-60">
                  {loading ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
