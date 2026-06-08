"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiPlus, HiTrash, HiClipboardCopy } from "react-icons/hi";
import { formatLKR } from "@/lib/utils";

// ── Fixed structured charge definitions ───────────────────────────────────────

interface FixedCharge {
  key: string;
  label: string;
  description: string; // stored in DB / shown on invoice
  group?: "medical-escort";
}

const FIXED_CHARGES: FixedCharge[] = [
  { key: "ambulanceTransfer",       label: "Ambulance Transfer",        description: "Ambulance Transfer" },
  { key: "oxygenSupply",            label: "Oxygen Supply",             description: "Oxygen Supply" },
  { key: "suctionMachineUse",       label: "Suction Machine Use",       description: "Suction Machine Use" },
  { key: "ambulanceWaiting",        label: "Ambulance Waiting Charges", description: "Ambulance Waiting Charges" },
  { key: "nightSurcharge",          label: "Night Surcharge",           description: "Night Surcharge" },
  { key: "longDistanceSurcharge",   label: "Long Distance Surcharge",   description: "Long Distance Surcharge" },
  // Medical Escort sub-group
  { key: "meDoctor",                label: "Doctor Fee",                description: "Medical Escort – Doctor Fee",               group: "medical-escort" },
  { key: "meNurse",                 label: "Nurse Fee",                 description: "Medical Escort – Nurse Fee",                group: "medical-escort" },
  { key: "meNursingAssistance",     label: "Nursing Assistance Fees",   description: "Medical Escort – Nursing Assistance Fees",  group: "medical-escort" },
  { key: "meFirstAider",            label: "1st Aider Fees",            description: "Medical Escort – 1st Aider Fees",           group: "medical-escort" },
  { key: "meOthers",                label: "Others",                    description: "Medical Escort – Others",                   group: "medical-escort" },
];

// ── Dynamic extra charge ───────────────────────────────────────────────────────

interface ExtraCharge { description: string; amount: string; quantity: string; }
const EMPTY_EXTRA: ExtraCharge = { description: "", amount: "", quantity: "1" };

// ── Styles ────────────────────────────────────────────────────────────────────

const L = "block text-[0.7rem] font-medium text-slate-400 mb-1";
const I = "w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500";
const AMT = "w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500 text-right tabindex-0";

// ── Component ─────────────────────────────────────────────────────────────────

export default function NewInvoicePage() {
  const router = useRouter();
  const [status, setStatus]     = useState<"idle" | "loading" | "done" | "error">("idle");
  const [createdId, setCreatedId] = useState("");
  const [copied, setCopied]     = useState(false);

  // Customer
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });

  // Patient details
  const [patient, setPatient]   = useState({ name: "", nic: "", ward: "", bedNumber: "" });

  // Service
  const [service, setService]   = useState({ description: "", serviceDate: "", vehicle: "", crewNotes: "" });

  // Fixed structured charges — keyed by FixedCharge.key
  const [fixedAmounts, setFixedAmounts] = useState<Record<string, string>>(
    Object.fromEntries(FIXED_CHARGES.map(c => [c.key, ""]))
  );

  // Dynamic extra charges
  const [extras, setExtras] = useState<ExtraCharge[]>([]);

  const [expiresInDays, setExpiresInDays] = useState("7");

  // ── Total ────────────────────────────────────────────────────────────────────

  const fixedTotal = FIXED_CHARGES.reduce((sum, c) => {
    const v = parseFloat(fixedAmounts[c.key]) || 0;
    return sum + v;
  }, 0);

  const extrasTotal = extras.reduce((sum, c) => {
    const amt = parseFloat(c.amount) || 0;
    const qty = parseInt(c.quantity) || 1;
    return sum + amt * qty;
  }, 0);

  const total = fixedTotal + extrasTotal;

  // ── Extras helpers ───────────────────────────────────────────────────────────

  function addExtra() { setExtras(p => [...p, { ...EMPTY_EXTRA }]); }
  function removeExtra(i: number) { setExtras(p => p.filter((_, idx) => idx !== i)); }
  function updateExtra(i: number, field: keyof ExtraCharge, value: string) {
    setExtras(p => p.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Build charge array from fixed non-zero rows
    const fixedCharges = FIXED_CHARGES
      .filter(c => parseFloat(fixedAmounts[c.key]) > 0)
      .map(c => ({ description: c.description, amount: fixedAmounts[c.key], quantity: "1" }));

    // Valid extra charges
    const extraCharges = extras.filter(c => c.description && parseFloat(c.amount) > 0);

    const allCharges = [...fixedCharges, ...extraCharges];

    if (!allCharges.length) {
      alert("Enter at least one charge amount.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          patient,
          service,
          charges: allCharges,
          expiresInDays: parseInt(expiresInDays),
        }),
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

  // ── Success screen ────────────────────────────────────────────────────────────

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
              onClick={() => { setStatus("idle"); setCreatedId(""); setFixedAmounts(Object.fromEntries(FIXED_CHARGES.map(c => [c.key, ""]))); setExtras([]); }}
              className="flex-1 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-sm font-semibold"
            >
              New Invoice
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────────

  const standardCharges = FIXED_CHARGES.filter(c => !c.group);
  const medEscortCharges = FIXED_CHARGES.filter(c => c.group === "medical-escort");

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-headline-sm text-white font-bold mb-6">New Invoice</h1>

      {status === "error" && (
        <div className="rounded-xl bg-red-900/30 border border-red-800 p-3 mb-5 text-red-300 text-sm">
          Failed to create invoice. Check all fields and try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Customer ── */}
        <section className="rounded-2xl bg-navy-900 border border-navy-800 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200">Customer / Billing Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={L}>Full Name *</label>
              <input required value={customer.name} onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))}
                className={I} placeholder="Billing contact full name" />
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

        {/* ── Patient Details ── */}
        <section className="rounded-2xl bg-navy-900 border border-navy-800 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200">Patient Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={L}>Patient Name</label>
              <input value={patient.name} onChange={e => setPatient(p => ({ ...p, name: e.target.value }))}
                className={I} placeholder="Full name of the patient" />
            </div>
            <div>
              <label className={L}>NIC (National ID)</label>
              <input value={patient.nic} onChange={e => setPatient(p => ({ ...p, nic: e.target.value }))}
                className={I} placeholder="e.g. 951234567V" />
            </div>
            <div>
              <label className={L}>Ward</label>
              <input value={patient.ward} onChange={e => setPatient(p => ({ ...p, ward: e.target.value }))}
                className={I} placeholder="e.g. Ward 4B" />
            </div>
            <div>
              <label className={L}>Bed Number</label>
              <input value={patient.bedNumber} onChange={e => setPatient(p => ({ ...p, bedNumber: e.target.value }))}
                className={I} placeholder="e.g. 12" />
            </div>
          </div>
        </section>

        {/* ── Service ── */}
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
              className={`${I} resize-none`} placeholder="Internal notes — not shown to patient" />
          </div>
        </section>

        {/* ── Standard Charges ── */}
        <section className="rounded-2xl bg-navy-900 border border-navy-800 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">Standard Charges</h2>
          <p className="text-[0.68rem] text-slate-500">Leave blank or 0 to exclude from invoice.</p>

          <div className="space-y-2">
            {standardCharges.map(c => (
              <div key={c.key} className="flex items-center gap-3">
                <span className="flex-1 text-xs text-slate-300">{c.label}</span>
                <div className="w-36">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="LKR 0.00"
                    value={fixedAmounts[c.key]}
                    onChange={e => setFixedAmounts(p => ({ ...p, [c.key]: e.target.value }))}
                    className={AMT}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Medical Escort sub-group */}
          <div className="mt-4 pt-4 border-t border-navy-700">
            <p className="text-[0.7rem] font-semibold text-emerald-400 uppercase tracking-wide mb-3">Medical Escort</p>
            <div className="space-y-2">
              {medEscortCharges.map(c => (
                <div key={c.key} className="flex items-center gap-3">
                  <span className="flex-1 text-xs text-slate-300 pl-2">{c.label}</span>
                  <div className="w-36">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="LKR 0.00"
                      value={fixedAmounts[c.key]}
                      onChange={e => setFixedAmounts(p => ({ ...p, [c.key]: e.target.value }))}
                      className={AMT}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Additional Charges (dynamic) ── */}
        <section className="rounded-2xl bg-navy-900 border border-navy-800 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">Additional Charges</h2>
          <p className="text-[0.68rem] text-slate-500">For items not covered above.</p>

          {extras.map((charge, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-2">
                <div className="sm:col-span-3">
                  <input
                    placeholder="Description"
                    value={charge.description}
                    onChange={e => updateExtra(i, "description", e.target.value)}
                    className={I}
                  />
                </div>
                <div>
                  <input
                    type="number" min="0" step="0.01"
                    placeholder="Amount"
                    value={charge.amount}
                    onChange={e => updateExtra(i, "amount", e.target.value)}
                    className={I}
                  />
                </div>
                <div>
                  <input
                    type="number" min="1"
                    placeholder="Qty"
                    value={charge.quantity}
                    onChange={e => updateExtra(i, "quantity", e.target.value)}
                    className={I}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeExtra(i)}
                className="mt-0.5 p-2 text-slate-500 hover:text-red-400 transition-colors"
              >
                <HiTrash />
              </button>
            </div>
          ))}

          <button type="button" onClick={addExtra}
            className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors py-1">
            <HiPlus /> Add charge
          </button>
        </section>

        {/* ── Total ── */}
        <div className="rounded-2xl bg-navy-900 border border-navy-700 p-5">
          <div className="flex justify-between items-center">
            <p className="text-slate-400 text-sm">Invoice Total</p>
            <p className="text-white text-2xl font-bold">{formatLKR(total)}</p>
          </div>
        </div>

        {/* ── Expiry ── */}
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
