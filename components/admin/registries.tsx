"use client";

import RegistryManager, { type FieldDef } from "./RegistryManager";
import { LOCATION_TYPES, LOCATION_TYPE_LABEL, type LocationTypeValue } from "@/lib/registry";
import { formatDate } from "@/lib/utils";

const count = (n: number) => (
  <span className="text-xs px-2 py-0.5 rounded-full bg-navy-800 text-slate-300">{n}</span>
);

// ── Customers ────────────────────────────────────────────────────────────────

type CustomerRow = {
  id: string; isActive: boolean; name: string; phone: string; email: string | null;
  address: string | null; notes: string | null; createdAt: string; _count: { invoices: number };
};

const CUSTOMER_FIELDS: FieldDef[] = [
  { key: "name", label: "Full Name", required: true, wide: true },
  { key: "phone", label: "Phone", type: "tel", required: true, placeholder: "07X XXX XXXX" },
  { key: "email", label: "Email", type: "email", placeholder: "optional" },
  { key: "address", label: "Billing Address", type: "textarea", placeholder: "optional" },
  { key: "notes", label: "Notes", type: "textarea" },
];

export function CustomersManager({ canWrite }: { canWrite: boolean }) {
  return (
    <RegistryManager<CustomerRow>
      title="Customers"
      singular="Customer"
      endpoint="/api/customers"
      fields={CUSTOMER_FIELDS}
      canWrite={canWrite}
      searchPlaceholder="Search name, phone, email…"
      invoiceLink={(r) => `/admin/invoices?q=${encodeURIComponent(r.name)}`}
      columns={[
        { label: "Name", render: (r) => <span className="text-slate-200 text-sm font-medium">{r.name}</span> },
        { label: "Phone", render: (r) => r.phone },
        { label: "Email", render: (r) => r.email ?? "—" },
        { label: "Billing Address", render: (r) => <span className="line-clamp-1 max-w-[16rem] block">{r.address ?? "—"}</span> },
        { label: "Invoices", render: (r) => count(r._count.invoices) },
        { label: "Since", render: (r) => <span className="text-slate-500">{formatDate(r.createdAt)}</span> },
      ]}
    />
  );
}

// ── Patients ─────────────────────────────────────────────────────────────────

type PatientRow = {
  id: string; isActive: boolean; name: string; nic: string | null; phone: string | null;
  dateOfBirth: string | null; gender: string | null; notes: string | null; _count: { invoices: number };
};

const PATIENT_FIELDS: FieldDef[] = [
  { key: "name", label: "Full Name", required: true, wide: true },
  { key: "nic", label: "NIC", placeholder: "e.g. 951234567V" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "dateOfBirth", label: "Date of Birth", type: "date" },
  {
    key: "gender", label: "Gender", type: "select",
    options: [{ value: "", label: "—" }, { value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Other", label: "Other" }],
  },
  { key: "notes", label: "Notes (medical / access)", type: "textarea" },
];

export function PatientsManager({ canWrite }: { canWrite: boolean }) {
  return (
    <RegistryManager<PatientRow>
      title="Patients"
      singular="Patient"
      endpoint="/api/patients"
      fields={PATIENT_FIELDS}
      canWrite={canWrite}
      searchPlaceholder="Search name, NIC, phone…"
      invoiceLink={(r) => `/admin/invoices?q=${encodeURIComponent(r.name)}`}
      toForm={(r) => ({
        name: r.name, nic: r.nic ?? "", phone: r.phone ?? "", gender: r.gender ?? "", notes: r.notes ?? "",
        dateOfBirth: r.dateOfBirth ? r.dateOfBirth.slice(0, 10) : "",
      })}
      columns={[
        { label: "Name", render: (r) => <span className="text-slate-200 text-sm font-medium">{r.name}</span> },
        { label: "NIC", render: (r) => r.nic ?? "—" },
        { label: "Phone", render: (r) => r.phone ?? "—" },
        { label: "DOB", render: (r) => (r.dateOfBirth ? formatDate(r.dateOfBirth) : "—") },
        { label: "Invoices", render: (r) => count(r._count.invoices) },
      ]}
    />
  );
}

// ── Locations ────────────────────────────────────────────────────────────────

type LocationRow = {
  id: string; isActive: boolean; type: LocationTypeValue; name: string; address: string | null;
  city: string | null; phone: string | null; mapsUrl: string | null; notes: string | null;
  _count: { pickupInvoices: number; dropInvoices: number };
};

const TYPE_OPTIONS = LOCATION_TYPES.map((t) => ({ value: t, label: LOCATION_TYPE_LABEL[t] }));

const LOCATION_FIELDS: FieldDef[] = [
  { key: "type", label: "Type", type: "select", required: true, options: TYPE_OPTIONS },
  { key: "name", label: "Name", required: true, placeholder: "e.g. Karapitiya Teaching Hospital" },
  { key: "address", label: "Address", type: "textarea" },
  { key: "city", label: "City", placeholder: "e.g. Galle" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "mapsUrl", label: "Google Maps Link", type: "url", wide: true, placeholder: "https://maps.app.goo.gl/…" },
  { key: "notes", label: "Notes (entrance, contact desk…)", type: "textarea" },
];

const TYPE_BADGE: Record<LocationTypeValue, string> = {
  HOSPITAL: "bg-red-900/30 text-red-300 border-red-800",
  HOME: "bg-emerald-900/30 text-emerald-300 border-emerald-800",
  OFFICE: "bg-blue-900/30 text-blue-300 border-blue-800",
  AIRPORT: "bg-purple-900/30 text-purple-300 border-purple-800",
  HARBOUR: "bg-cyan-900/30 text-cyan-300 border-cyan-800",
  OTHER: "bg-slate-800 text-slate-300 border-slate-700",
};

export function LocationsManager({ canWrite }: { canWrite: boolean }) {
  return (
    <RegistryManager<LocationRow>
      title="Locations"
      singular="Location"
      endpoint="/api/locations"
      fields={LOCATION_FIELDS}
      canWrite={canWrite}
      searchPlaceholder="Search name, city, address…"
      filter={{ param: "type", options: TYPE_OPTIONS }}
      columns={[
        {
          label: "Type",
          render: (r) => (
            <span className={`text-[0.65rem] uppercase tracking-wide px-2 py-0.5 rounded-full border ${TYPE_BADGE[r.type]}`}>
              {LOCATION_TYPE_LABEL[r.type]}
            </span>
          ),
        },
        { label: "Name", render: (r) => <span className="text-slate-200 text-sm font-medium">{r.name}</span> },
        { label: "City", render: (r) => r.city ?? "—" },
        { label: "Address", render: (r) => <span className="line-clamp-1 max-w-[16rem] block">{r.address ?? "—"}</span> },
        {
          label: "Map",
          render: (r) =>
            r.mapsUrl ? (
              <a href={r.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Open</a>
            ) : "—",
        },
        { label: "Trips", render: (r) => count(r._count.pickupInvoices + r._count.dropInvoices) },
      ]}
    />
  );
}
