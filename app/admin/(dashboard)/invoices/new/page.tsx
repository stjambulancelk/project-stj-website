"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiPlus, HiTrash, HiClipboardCopy } from "react-icons/hi";
import { INVOICE_CHARGE_ITEMS } from "@/lib/constants";
import { formatLKR } from "@/lib/utils";

interface Charge { description: string; amount: string; quantity: string; }

const EMPTY_CHARGE: Charge = { description: "", amount: "", quantity: "1" };

const L = "block text-[0.7rem] font-medium text-slate-400 mb-1";
const I = "w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500 [&_option]:bg-navy-950";

export default function NewInvoicePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [createdId, setCreatedId] = useState("");
  const [copied, setCopied] = useState(false);

  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [service, setService] = useState({ description: "", serviceDate: "", vehicle: "", crewNotes: "" });
  const [charges, setCharges] = useState<Charge[]>([{ ...EMPTY_CHARGE }]);
  const [expiresInDays, setExpiresInDays] = useState("7");

  function addCharge() {
    setCharges(p => [...p, { ...EMPTY_CHARGE }]);
  }

  function removeCharge(i: number) {
    setCharges(p => p.filter((_, idx) => idx !== i));
  }

  function updateCharge(i: number, field: keyof Charge, value: string) {
    setCharges(p => p.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  }

  const total = charges.reduce((sum, c) => {
    const amt = parseFloat(c.amount) || 0;
    const qty = parseInt(c.quantity) || 1;
    return sum + amt * qty;
  }, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (charges.some(c => !c.description || !c.amount)) {
      alert("All charge rows need a description and amount.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, service, charges, expiresInDays: parseInt(expiresInDays) }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed to create invoice");
      }
      const data = await res.json();
      setCreatedId(data.id);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  async function copyLink() {
    const url = `${window.location.origin}/invoice/${createdId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (status === "done") {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="rounded-2xl bg-navy-900 border border-emerald-800 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
            <HiClipboardCopy className="text-3xl text-emerald-400" />
          </div>
          <h2 className="text-headline-sm text-white mb-2">Invoice Created</h2>
          <p className="text-emerald-400 font-mono font-bold text-lg mb-4">{createdId}</p>

          <div className="flex items-center gap-2 bg-navy-950 rounded-xl px-4 py-3 mb-5 text-left">
            <span className="text-slate-300 text-xs flex-1 truncate">
              {typeof window !== "undefined" ? `${window.location.origin}/invoice/${createdId}` : `/invoice/${createdId}`}
            </span>
            <button onClick={copyLink} className="text-emerald-400 hover:text-emerald-300 text-sm flex-shrink-0">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/invoice/${createdId}`)}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
            >
              Preview Invoice
            </button>
            <button
              onClick={() => { setStatus("idle"); setCreatedId(""); setCharges([{ ...EMPTY_CHARGE }]); }}
              className="flex-1 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-sm font-semibold"
            >
              New Invoice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-headline-sm text-white font-bold mb-6">New Invoice</h1>

      {status === "error" && (
        <div className="rounded-xl bg-red-900/30 border border-red-800 p-3 mb-5 text-red-300 text-sm">
          Failed to create invoice. Check all fields and try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Customer */}
        <section className="rounded-2xl bg-navy-900 border border-navy-800 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200">Customer / Patient</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={L}>Full Name *</label>
              <input required value={customer.name} onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))}
                className={I} placeholder="Patient or client full name" />
            </div>
            <div>
              <label className={L}>Phone *</label>
              <input required value={customer.phone} onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))}
                className={I} placeholder="07X XXX XXXX" />
            </div>
            <div>
              <label className={L}>Email</label>
              <input type="email" value={customer.email} onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))}
                className={I} placeholder="optional" />
            </div>
          </div>
        </section>

        {/* Service */}
        <section className="rounded-2xl bg-navy-900 border border-navy-800 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200">Service Details</h2>
          <div>
            <label className={L}>Service Description *</label>
            <input required value={service.description} onChange={e => setService(p => ({ ...p, description: e.target.value }))}
              className={I} placeholder="e.g. Emergency transport — Galle to Colombo" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={L}>Service Date</label>
              <input type="date" value={service.serviceDate} onChange={e => setService(p => ({ ...p, serviceDate: e.target.value }))}
                className={I} />
            </div>
            <div>
              <label className={L}>Vehicle</label>
              <input value={service.vehicle} onChange={e => setService(p => ({ ...p, vehicle: e.target.value }))}
                className={I} placeholder="e.g. Type B Van — WP GAA 1234" />
            </div>
          </div>
          <div>
            <label className={L}>Crew Notes (internal)</label>
            <textarea rows={2} value={service.crewNotes} onChange={e => setService(p => ({ ...p, crewNotes: e.target.value }))}
              className={`${I} resize-none`} placeholder="Internal notes — not shown to customer" />
          </div>
        </section>

        {/* Charges */}
        <section className="rounded-2xl bg-navy-900 border border-navy-800 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">Charges</h2>

          {charges.map((charge, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-2">
                <div className="sm:col-span-3">
                  <select
                    value={charge.description}
                    onChange={e => updateCharge(i, "description", e.target.value)}
                    className={I}
                  >
                    <option value="">Select…</option>
                    {INVOICE_CHARGE_ITEMS.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    value={charge.amount}
                    onChange={e => updateCharge(i, "amount", e.target.value)}
                    className={I}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={charge.quantity}
                    onChange={e => updateCharge(i, "quantity", e.target.value)}
                    className={I}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeCharge(i)}
                disabled={charges.length === 1}
                className="mt-0.5 p-2 text-slate-500 hover:text-red-400 disabled:opacity-30 transition-colors"
              >
                <HiTrash />
              </button>
            </div>
          ))}

          <button type="button" onClick={addCharge}
            className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors py-1">
            <HiPlus /> Add charge
          </button>

          <div className="border-t border-navy-700 pt-3 flex justify-end">
            <div className="text-right">
              <p className="text-slate-400 text-xs">Total</p>
              <p className="text-white text-xl font-bold">{formatLKR(total)}</p>
            </div>
          </div>
        </section>

        {/* Expiry */}
        <section className="rounded-2xl bg-navy-900 border border-navy-800 p-5">
          <label className={L}>Payment Link Expires In</label>
          <select value={expiresInDays} onChange={e => setExpiresInDays(e.target.value)} className={`${I} max-w-xs`}>
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="0">No expiry</option>
          </select>
        </section>

        <button
          type="submit"
          disabled={status === "loading" || total === 0}
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Creating…" : `Create Invoice — ${formatLKR(total)}`}
        </button>
      </form>

    </div>
  );
}
