"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  paymentId: string;
  invoiceId: string;
  source: string;     // PAYHERE | CASH | BANK_TRANSFER | ...
  refundable: number; // amount still refundable on this payment
}

const MANUAL = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "OTHER", label: "Other" },
];

const fmt = (n: number) => `LKR ${n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function RefundButton({ paymentId, invoiceId, source, refundable }: Props) {
  const router = useRouter();
  const isPayHere = source === "PAYHERE";
  const [open, setOpen]       = useState(false);
  const [reason, setReason]   = useState("");
  const [amount, setAmount]   = useState(refundable.toFixed(2));
  // PayHere payments default to the PayHere API; others must say how money went back
  const [method, setMethod]   = useState<string>(isPayHere ? "PAYHERE" : "CASH");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const amt = parseFloat(amount) || 0;
  const viaApi = method === "PAYHERE";
  const partial = amt < refundable;

  async function handleRefund() {
    setError("");
    if (viaApi && partial) {
      setError("PayHere refunds the full payment only. Pick Cash / Bank transfer for a partial refund.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/payments/${paymentId}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        reason: reason.trim() || "Refund requested by admin",
        ...(viaApi ? {} : { method }),
      }),
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
        onClick={() => { setAmount(refundable.toFixed(2)); setOpen(true); }}
        className="px-2.5 py-1 rounded-lg bg-red-900/40 border border-red-800 text-red-400 hover:bg-red-900/60 text-[0.7rem] font-medium transition-colors"
      >
        Refund
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4">
          <div className="bg-navy-950 border border-navy-800 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md max-h-[92dvh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">⚠️</span>
              <div>
                <h2 className="text-white font-bold text-base">Issue Refund — Irreversible</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Invoice <strong className="text-white font-mono">{invoiceId}</strong> · refundable{" "}
                  <strong className="text-white">{fmt(refundable)}</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Amount (LKR)</label>
                <input
                  type="number" min="0.01" step="0.01" max={refundable}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-slate-100 focus:outline-none focus:border-red-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Refund via</label>
                <select
                  value={method}
                  onChange={e => setMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-slate-100 focus:outline-none focus:border-red-500 text-sm"
                >
                  {isPayHere && <option value="PAYHERE">PayHere (to card)</option>}
                  {MANUAL.map(m => <option key={m.value} value={m.value}>{m.label} (manual)</option>)}
                </select>
              </div>
            </div>

            <div className="bg-red-950/40 border border-red-900 rounded-xl px-4 py-3 text-sm text-red-300 space-y-1">
              {viaApi ? (
                <>
                  <p>• Full payment returned to the customer&apos;s card/account by PayHere</p>
                  <p>• 5–7 business days for funds to appear</p>
                </>
              ) : (
                <p>• You return the money yourself ({MANUAL.find(m => m.value === method)?.label}); this records it</p>
              )}
              <p>• Invoice status becomes {partial ? "PARTIALLY_REFUNDED" : "REFUNDED"} (if no other payments)</p>
              <p>• Customer gets a refund email if an address is on file</p>
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
              <p className="text-sm text-red-400 bg-red-950/30 border border-red-900 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleRefund}
                disabled={loading || amt <= 0 || amt > refundable}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-bold transition-colors"
              >
                {loading ? "Processing…" : `Yes, Refund ${fmt(amt)}`}
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
