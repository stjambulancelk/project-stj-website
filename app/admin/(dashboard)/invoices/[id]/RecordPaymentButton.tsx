"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiCash } from "react-icons/hi";

const METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "OTHER", label: "Other" },
];

/** Today's date in the admin's own timezone (toISOString alone gives the UTC date). */
const todayLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

const I = "w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm";
const L = "block text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400 mb-1.5";

/** Record an offline (cash / bank / cheque) payment — full or partial. */
export default function RecordPaymentButton({ invoiceId, balance }: { invoiceId: string; balance: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(balance.toFixed(2));
  const [source, setSource] = useState("CASH");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [receivedAt, setReceivedAt] = useState(todayLocal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(`/api/invoices/${invoiceId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Today → let the server stamp the exact time; back-dated → that date
      body: JSON.stringify({ amount, source, reference, note, ...(receivedAt !== todayLocal() ? { receivedAt } : {}) }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Could not record payment");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => { setAmount(balance.toFixed(2)); setOpen(true); }}
        className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-emerald-900/40 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/60 text-xs font-medium transition-colors"
      >
        <HiCash /> Record Payment
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4">
          <form onSubmit={submit} className="bg-navy-950 border border-navy-800 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md max-h-[92dvh] overflow-y-auto shadow-2xl space-y-4">
            <div>
              <h2 className="text-white font-bold text-base">Record Offline Payment</h2>
              <p className="text-slate-400 text-xs mt-1">
                Balance due: <strong className="text-white">LKR {balance.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</strong>.
                Enter less for a part payment.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={L}>Amount (LKR)</label>
                <input type="number" min="0.01" step="0.01" max={balance} required value={amount} onChange={e => setAmount(e.target.value)} className={I} />
              </div>
              <div>
                <label className={L}>Method</label>
                <select value={source} onChange={e => setSource(e.target.value)} className={I}>
                  {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className={L}>Received on</label>
                <input type="date" value={receivedAt} onChange={e => setReceivedAt(e.target.value)} className={I} />
              </div>
              <div>
                <label className={L}>Reference</label>
                <input value={reference} onChange={e => setReference(e.target.value)} placeholder="Receipt / bank ref" className={I} />
              </div>
              <div className="col-span-2">
                <label className={L}>Note</label>
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="optional" className={I} />
              </div>
            </div>
            {error && <p className="text-sm text-red-400 bg-red-950/30 border border-red-900 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold">
                {loading ? "Saving…" : "Record Payment"}
              </button>
              <button type="button" onClick={() => { setOpen(false); setError(""); }} disabled={loading}
                className="flex-1 py-2.5 rounded-xl border border-navy-700 text-slate-400 hover:text-slate-200 text-sm font-semibold">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
