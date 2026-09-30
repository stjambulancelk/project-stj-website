"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiPlus, HiTrash, HiClipboardCopy, HiExternalLink } from "react-icons/hi";
import { formatLKR } from "@/lib/utils";
import { LOCATION_TYPES, LOCATION_TYPE_LABEL, type LocationTypeValue } from "@/lib/registry";
import RegistryPicker from "./RegistryPicker";

// ── Fixed structured charge definitions ───────────────────────────────────────

interface FixedCharge {
  key: string;
  label: string;
  description: string; // stored in DB / shown on invoice
  group?: "medical-escort";
}

export const FIXED_CHARGES: FixedCharge[] = [
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

// ── Types ─────────────────────────────────────────────────────────────────────

interface ExtraCharge { description: string; amount: string; quantity: string; }
const EMPTY_EXTRA: ExtraCharge = { description: "", amount: "", quantity: "1" };

interface LocationState {
  locationId: string | null;
  linkedLabel: string | null;
  type: LocationTypeValue;
  name: string;
  address: string;
  mapsUrl: string;
  save: boolean;
}

export interface InvoiceFormInitial {
  customerId: string | null;
  customerLabel: string | null;
  customer: { name: string; phone: string; email: string; address: string };
  patientId: string | null;
  patientLabel: string | null;
  patient: { name: string; nic: string; ward: string; bedNumber: string };
  pickup: Omit<LocationState, "save">;
  drop: Omit<LocationState, "save">;
  service: { description: string; serviceDate: string; vehicle: string; crewNotes: string };
  charges: { description: string; amount: string; quantity: string }[];
}

type CustomerHit = { id: string; name: string; phone: string; email: string | null; address: string | null };
type PatientHit = { id: string; name: string; nic: string | null; phone: string | null };
type LocationHit = { id: string; type: LocationTypeValue; name: string; address: string | null; city: string | null; mapsUrl: string | null };

// ── Styles ────────────────────────────────────────────────────────────────────

const L = "block text-[0.7rem] font-medium text-slate-400 mb-1";
const I = "w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500";
const AMT = "w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500 text-right";
const SECTION = "rounded-2xl bg-navy-900 border border-navy-800 p-5 space-y-4";

const emptyLocation = (type: LocationTypeValue): LocationState => ({
  locationId: null, linkedLabel: null, type, name: "", address: "", mapsUrl: "", save: true,
});

// ── Component ─────────────────────────────────────────────────────────────────

export default function InvoiceForm({ mode, invoiceId, initial }: {
  mode: "create" | "edit";
  invoiceId?: string;
  initial?: InvoiceFormInitial;
}) {
  const router = useRouter();
  const [status, setStatus]       = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg]   = useState("");
  const [createdId, setCreatedId] = useState("");
  const [copied, setCopied]       = useState(false);

  // Customer
  const [customerId, setCustomerId]       = useState<string | null>(initial?.customerId ?? null);
  const [customerLabel, setCustomerLabel] = useState<string | null>(initial?.customerLabel ?? null);
  const [customer, setCustomer] = useState(initial?.customer ?? { name: "", phone: "", email: "", address: "" });

  // Patient
  const [patientId, setPatientId]       = useState<string | null>(initial?.patientId ?? null);
  const [patientLabel, setPatientLabel] = useState<string | null>(initial?.patientLabel ?? null);
  const [patient, setPatient] = useState(initial?.patient ?? { name: "", nic: "", ward: "", bedNumber: "" });

  // Pickup / drop
  const [pickup, setPickup] = useState<LocationState>(initial ? { ...initial.pickup, save: true } : emptyLocation("HOSPITAL"));
  const [drop, setDrop]     = useState<LocationState>(initial ? { ...initial.drop, save: true } : emptyLocation("HOSPITAL"));

  // Service
  const [service, setService] = useState(initial?.service ?? { description: "", serviceDate: "", vehicle: "", crewNotes: "" });

  // Charges — split initial charges into fixed rows (matched by description) and extras
  const [fixedAmounts, setFixedAmounts] = useState<Record<string, string>>(() => {
    const base = Object.fromEntries(FIXED_CHARGES.map(c => [c.key, ""]));
    for (const ch of initial?.charges ?? []) {
      const fc = FIXED_CHARGES.find(f => f.description === ch.description && ch.quantity === "1");
      if (fc && !base[fc.key]) base[fc.key] = ch.amount;
    }
    return base;
  });
  const [extras, setExtras] = useState<ExtraCharge[]>(() => {
    const used = new Set<string>();
    return (initial?.charges ?? []).filter(ch => {
      const fc = FIXED_CHARGES.find(f => f.description === ch.description && ch.quantity === "1");
      if (fc && !used.has(fc.key)) { used.add(fc.key); return false; }
      return true;
    });
  });

  const [expiresInDays, setExpiresInDays] = useState(mode === "create" ? "7" : "");

  // ── Total ────────────────────────────────────────────────────────────────────

  const fixedTotal = FIXED_CHARGES.reduce((sum, c) => sum + (parseFloat(fixedAmounts[c.key]) || 0), 0);
  const extrasTotal = extras.reduce((sum, c) => sum + (parseFloat(c.amount) || 0) * (parseInt(c.quantity) || 1), 0);
  const total = fixedTotal + extrasTotal;

  function addExtra() { setExtras(p => [...p, { ...EMPTY_EXTRA }]); }
  function removeExtra(i: number) { setExtras(p => p.filter((_, idx) => idx !== i)); }
  function updateExtra(i: number, field: keyof ExtraCharge, value: string) {
    setExtras(p => p.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  }

  // ── Picker handlers ──────────────────────────────────────────────────────────

  function selectCustomer(c: CustomerHit) {
    setCustomerId(c.id);
    setCustomerLabel(`${c.name} · ${c.phone}`);
    setCustomer({ name: c.name, phone: c.phone, email: c.email ?? "", address: c.address ?? "" });
  }
  function selectPatient(p: PatientHit) {
    setPatientId(p.id);
    setPatientLabel(p.nic ? `${p.name} · ${p.nic}` : p.name);
    setPatient(prev => ({ ...prev, name: p.name, nic: p.nic ?? "" }));
  }
  function selectLocation(set: typeof setPickup) {
    return (l: LocationHit) => set({
      locationId: l.id,
      linkedLabel: `${LOCATION_TYPE_LABEL[l.type]} · ${l.name}`,
      type: l.type,
      name: l.name,
      address: l.address ?? "",
      mapsUrl: l.mapsUrl ?? "",
      save: true,
    });
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const fixedCharges = FIXED_CHARGES
      .filter(c => parseFloat(fixedAmounts[c.key]) > 0)
      .map(c => ({ description: c.description, amount: fixedAmounts[c.key], quantity: "1" }));
    const extraCharges = extras.filter(c => c.description && parseFloat(c.amount) > 0);
    const allCharges = [...fixedCharges, ...extraCharges];

    if (!allCharges.length) {
      alert("Enter at least one charge amount.");
      return;
    }

    const loc = (l: LocationState) => ({
      locationId: l.locationId, type: l.type, name: l.name, address: l.address, mapsUrl: l.mapsUrl, save: l.save,
    });

    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(mode === "create" ? "/api/invoices" : `/api/invoices/${invoiceId}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          customer,
          patientId,
          patient,
          pickup: loc(pickup),
          drop: loc(drop),
          service,
          charges: allCharges,
          expiresInDays: expiresInDays === "" ? null : parseInt(expiresInDays),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed to save invoice");
      }
      const data = await res.json();
      if (mode === "edit") {
        router.push(`/admin/invoices/${invoiceId}`);
        router.refresh();
        return;
      }
      setCreatedId(data.id);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save invoice");
      setStatus("error");
    }
  }

  async function copyLink() {
    const url = `${window.location.origin}/invoice/${createdId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Success screen (create) ──────────────────────────────────────────────────

  if (status === "done") {
    return (
      <div className="p-4 sm:p-6 max-w-lg mx-auto">
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
              onClick={() => router.push(`/admin/invoices/${createdId}`)}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
            >
              Open Invoice
            </button>
            <button
              onClick={() => window.location.reload()}
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

  const locationBlock = (title: string, value: LocationState, set: typeof setPickup) => (
    <div className="space-y-3">
      <p className="text-[0.7rem] font-semibold text-emerald-400 uppercase tracking-wide">{title}</p>
      <RegistryPicker<LocationHit>
        endpoint="/api/locations"
        placeholder="Search saved locations (hospital, airport, home…)"
        describe={l => ({ primary: l.name, secondary: [l.address, l.city].filter(Boolean).join(", "), badge: LOCATION_TYPE_LABEL[l.type] })}
        onSelect={selectLocation(set)}
        linkedLabel={value.linkedLabel}
        onUnlink={() => set(p => ({ ...p, locationId: null, linkedLabel: null }))}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={L}>Type</label>
          <select
            value={value.type}
            disabled={!!value.locationId}
            onChange={e => set(p => ({ ...p, type: e.target.value as LocationTypeValue }))}
            className={`${I} disabled:opacity-60`}
          >
            {LOCATION_TYPES.map(t => <option key={t} value={t}>{LOCATION_TYPE_LABEL[t]}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={L}>Name</label>
          <input value={value.name} onChange={e => set(p => ({ ...p, name: e.target.value }))}
            className={I} placeholder={value.type === "HOME" ? "e.g. Patient residence" : "e.g. Karapitiya Teaching Hospital"} />
        </div>
        <div className="sm:col-span-3">
          <label className={L}>Address</label>
          <input value={value.address} onChange={e => set(p => ({ ...p, address: e.target.value }))}
            className={I} placeholder="Street, city" />
        </div>
        <div className="sm:col-span-3">
          <label className={L}>Google Maps Link</label>
          <div className="flex gap-2">
            <input type="url" value={value.mapsUrl} onChange={e => set(p => ({ ...p, mapsUrl: e.target.value }))}
              className={I} placeholder="https://maps.app.goo.gl/…" />
            {value.mapsUrl && (
              <a href={value.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center px-3 rounded-xl bg-navy-800 text-slate-300 hover:text-white" title="Open map">
                <HiExternalLink />
              </a>
            )}
          </div>
        </div>
      </div>
      {!value.locationId && value.name && (
        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
          <input type="checkbox" checked={value.save} onChange={e => set(p => ({ ...p, save: e.target.checked }))} className="accent-emerald-500" />
          Save to Locations registry for next time
        </label>
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-headline-sm text-white font-bold mb-6">
        {mode === "create" ? "New Invoice" : <>Edit Invoice <span className="font-mono text-emerald-400">{invoiceId}</span></>}
      </h1>

      {status === "error" && (
        <div className="rounded-xl bg-red-900/30 border border-red-800 p-3 mb-5 text-red-300 text-sm">
          {errorMsg || "Failed to save invoice. Check all fields and try again."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Customer ── */}
        <section className={SECTION}>
          <h2 className="text-sm font-semibold text-slate-200">Customer / Billing Contact</h2>
          <RegistryPicker<CustomerHit>
            endpoint="/api/customers"
            placeholder="Search existing customer by name, phone or email…"
            describe={c => ({ primary: c.name, secondary: [c.phone, c.email].filter(Boolean).join(" · ") })}
            onSelect={selectCustomer}
            linkedLabel={customerLabel}
            onUnlink={() => { setCustomerId(null); setCustomerLabel(null); }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={L}>Full Name *</label>
              <input required value={customer.name} onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))}
                className={I} placeholder="Billing contact full name" />
            </div>
            <div>
              <label className={L}>Phone *</label>
              <input required value={customer.phone} onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))}
                className={I} placeholder="07X XXX XXXX" type="tel" inputMode="tel" />
            </div>
            <div>
              <label className={L}>Email</label>
              <input type="email" value={customer.email} onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))}
                className={I} placeholder="optional" />
            </div>
            <div className="sm:col-span-2">
              <label className={L}>Billing Address</label>
              <textarea rows={2} value={customer.address} onChange={e => setCustomer(p => ({ ...p, address: e.target.value }))}
                className={`${I} resize-none`} placeholder="optional — shown on the invoice" />
            </div>
          </div>
        </section>

        {/* ── Patient Details ── */}
        <section className={SECTION}>
          <h2 className="text-sm font-semibold text-slate-200">Patient Details</h2>
          <RegistryPicker<PatientHit>
            endpoint="/api/patients"
            placeholder="Search existing patient by name or NIC…"
            describe={p => ({ primary: p.name, secondary: [p.nic, p.phone].filter(Boolean).join(" · ") })}
            onSelect={selectPatient}
            linkedLabel={patientLabel}
            onUnlink={() => { setPatientId(null); setPatientLabel(null); }}
          />
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

        {/* ── Pickup / Drop ── */}
        <section className={SECTION}>
          <h2 className="text-sm font-semibold text-slate-200">Pickup &amp; Drop Locations</h2>
          {locationBlock("Pickup", pickup, setPickup)}
          <div className="border-t border-navy-700" />
          {locationBlock("Drop", drop, setDrop)}
        </section>

        {/* ── Service ── */}
        <section className={SECTION}>
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
                <div className="w-32 sm:w-36">
                  <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="LKR 0.00"
                    value={fixedAmounts[c.key]}
                    onChange={e => setFixedAmounts(p => ({ ...p, [c.key]: e.target.value }))}
                    className={AMT} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-navy-700">
            <p className="text-[0.7rem] font-semibold text-emerald-400 uppercase tracking-wide mb-3">Medical Escort</p>
            <div className="space-y-2">
              {medEscortCharges.map(c => (
                <div key={c.key} className="flex items-center gap-3">
                  <span className="flex-1 text-xs text-slate-300 pl-2">{c.label}</span>
                  <div className="w-32 sm:w-36">
                    <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="LKR 0.00"
                      value={fixedAmounts[c.key]}
                      onChange={e => setFixedAmounts(p => ({ ...p, [c.key]: e.target.value }))}
                      className={AMT} />
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
              <div className="flex-1 grid grid-cols-3 sm:grid-cols-5 gap-2">
                <div className="col-span-3">
                  <input placeholder="Description" value={charge.description}
                    onChange={e => updateExtra(i, "description", e.target.value)} className={I} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="Amount" value={charge.amount}
                    onChange={e => updateExtra(i, "amount", e.target.value)} className={I} />
                </div>
                <div>
                  <input type="number" min="1" placeholder="Qty" value={charge.quantity}
                    onChange={e => updateExtra(i, "quantity", e.target.value)} className={I} />
                </div>
              </div>
              <button type="button" onClick={() => removeExtra(i)}
                className="mt-0.5 p-2 text-slate-500 hover:text-red-400 transition-colors">
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
            {mode === "edit" && <option value="">Keep current expiry</option>}
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="0">No expiry</option>
          </select>
        </section>

        {/* Sticky on phones so Save is always reachable without scrolling back */}
        <div className="flex gap-3 sticky bottom-0 z-20 -mx-4 px-4 py-3 bg-navy-950/95 backdrop-blur border-t border-navy-800 sm:static sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:border-0 sm:backdrop-blur-none">
          {mode === "edit" && (
            <button type="button" onClick={() => router.push(`/admin/invoices/${invoiceId}`)}
              className="px-6 py-3.5 rounded-xl border border-navy-700 text-slate-300 hover:text-white font-semibold">
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={status === "loading" || total === 0}
            className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "loading"
              ? "Saving…"
              : mode === "create" ? `Create Invoice — ${formatLKR(total)}` : `Save Changes — ${formatLKR(total)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
