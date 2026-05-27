"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  paymentId: string;
  invoiceId: string;
  amount: string; // pre-formatted LKR string for display
}

export default function RefundButton({ paymentId, invoiceId, amount }: Props) {
  const router = useRouter();
  const [open, setOpen]     = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  async function handleRefund() {
    setError("");
    setLoading(true);

    const res = await fetch(`/api/payments/${paymentId}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason.trim() || "Refund requested by admin" }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Refund failed. Try again or process via PayHere portal.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/40 border border-red-800 text-red-400 hover:bg-red-900/60 text-xs font-medium transition-colors"
      >
        Issue Refund
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-navy-950 border border-navy-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            {/* Warning header */}
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">⚠️</span>
              <div>
                <h2 className="text-white font-bold text-base">Issue Refund — Irreversible</h2>
                <p className="text-slate-400 text-sm mt-1">
                  This will refund <strong className="text-white">{amount}</strong> for invoice{" "}
                  <strong className="text-white font-mono">{invoiceId}</strong> via PayHere.
                  This action <strong className="text-red-400">cannot be undone</strong>.
                </p>
              </div>
            </div>

            <div className="bg-red-950/40 border border-red-900 rounded-xl px-4 py-3 text-sm text-red-300 space-y-1">
              <p>• Payment will be returned to the customer's card/account</p>
              <p>• Invoice status will change to REFUNDED</p>
              <p>• Customer will receive a refund confirmation email</p>
              <p>• 5–7 business days for funds to appear</p>
            </div>

            <div>
              <label className="block text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Reason for refund
              </label>
              <input
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Service cancelled, duplicate charge…"
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/30 border border-red-900 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleRefund}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-bold transition-colors"
              >
                {loading ? "Processing…" : "Yes, Issue Refund"}
              </button>
              <button
                onClick={() => { setOpen(false); setError(""); }}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl border border-navy-700 text-slate-400 hover:text-slate-200 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
