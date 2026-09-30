"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { HiSearch, HiPlus, HiPencil, HiTrash, HiRefresh, HiDocumentText } from "react-icons/hi";
import { LABEL, INPUT, CARD, BTN_PRIMARY, BTN_SECONDARY } from "./formStyles";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "date" | "url" | "email" | "tel";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  wide?: boolean;
}

export interface ColumnDef<T> {
  label: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

type Row = { id: string; isActive: boolean } & Record<string, unknown>;

interface Props<T extends Row> {
  title: string;
  singular: string;
  endpoint: string;
  fields: FieldDef[];
  columns: ColumnDef<T>[];
  canWrite: boolean;
  searchPlaceholder: string;
  filter?: { param: string; options: { value: string; label: string }[] };
  invoiceLink?: (row: T) => string | null;
  toForm?: (row: T) => Record<string, string>;
}

/** Generic list / search / create / edit / archive / delete screen for a registry. */
export default function RegistryManager<T extends Row>({
  title, singular, endpoint, fields, columns, canWrite, searchPlaceholder, filter, invoiceLink, toForm,
}: Props<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [q, setQ] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ id: string | null; values: Record<string, string> } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ q, active: showArchived ? "false" : "true", limit: "100" });
    if (filter && filterValue) params.set(filter.param, filterValue);
    const res = await fetch(`${endpoint}?${params}`);
    if (res.ok) setRows(await res.json());
    setLoading(false);
  }, [endpoint, q, showArchived, filter, filterValue]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  function openNew() {
    setError("");
    setEditing({ id: null, values: Object.fromEntries(fields.map((f) => [f.key, f.options?.[0]?.value ?? ""])) });
  }

  function openEdit(row: T) {
    setError("");
    const values = toForm
      ? toForm(row)
      : Object.fromEntries(fields.map((f) => [f.key, row[f.key] == null ? "" : String(row[f.key])]));
    setEditing({ id: row.id, values });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    const res = await fetch(editing.id ? `${endpoint}/${editing.id}` : endpoint, {
      method: editing.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing.values),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Save failed");
      return;
    }
    setNotice(editing.id ? `${singular} updated` : `${singular} added`);
    setEditing(null);
    load();
  }

  async function remove(row: T) {
    if (!confirm(`Delete this ${singular.toLowerCase()}? If it is used on invoices it will be archived instead.`)) return;
    const res = await fetch(`${endpoint}/${row.id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setNotice(d.error ?? "Delete failed"); return; }
    setNotice(d.archived ? `${singular} archived (used on invoices — kept for history)` : `${singular} deleted`);
    load();
  }

  async function restore(row: T) {
    const res = await fetch(`${endpoint}/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    if (res.ok) { setNotice(`${singular} restored`); load(); }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-headline-sm text-white font-bold">{title}</h1>
        {canWrite && (
          <button onClick={openNew} className={`${BTN_PRIMARY} flex items-center gap-1.5`}>
            <HiPlus /> Add {singular}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-900 border border-navy-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
          />
        </div>
        {filter && (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All types</option>
            {filter.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="accent-emerald-500" />
          Archived only
        </label>
      </div>

      {notice && (
        <div className="rounded-xl bg-emerald-900/30 border border-emerald-800 px-4 py-2.5 text-emerald-300 text-xs flex justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} className="text-emerald-400 hover:text-white">×</button>
        </div>
      )}

      {/* Phone: cards with full-size action buttons */}
      <div className="sm:hidden space-y-2">
        {!loading && rows.length === 0 && (
          <p className={`${CARD} px-4 py-10 text-center text-slate-500 text-sm`}>No {title.toLowerCase()} found</p>
        )}
        {loading && rows.length === 0 && (
          <p className={`${CARD} px-4 py-10 text-center text-slate-500 text-sm`}>Loading…</p>
        )}
        {rows.map((row) => {
          const inv = invoiceLink?.(row);
          const [head, ...rest] = columns;
          return (
            <div key={row.id} className={`${CARD} p-4 space-y-3`}>
              <div className="text-sm">{head.render(row)}</div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {rest.map((c) => (
                  <div key={c.label} className="min-w-0">
                    <dt className="text-[0.62rem] uppercase tracking-wide text-slate-500">{c.label}</dt>
                    <dd className="text-xs text-slate-300 break-words">{c.render(row)}</dd>
                  </div>
                ))}
              </dl>
              {(inv || canWrite) && (
                <div className="flex gap-2 pt-1">
                  {inv && (
                    <Link href={inv} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-navy-800 text-slate-300 text-xs font-medium">
                      <HiDocumentText /> Invoices
                    </Link>
                  )}
                  {canWrite && row.isActive && (
                    <>
                      <button onClick={() => openEdit(row)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-navy-800 text-slate-200 text-xs font-medium">
                        <HiPencil /> Edit
                      </button>
                      <button onClick={() => remove(row)} className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-red-900/30 border border-red-900 text-red-400 text-xs" aria-label="Delete">
                        <HiTrash />
                      </button>
                    </>
                  )}
                  {canWrite && !row.isActive && (
                    <button onClick={() => restore(row)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-900/30 border border-emerald-800 text-emerald-300 text-xs font-medium">
                      <HiRefresh /> Restore
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tablet / desktop: table */}
      <div className={`${CARD} overflow-hidden hidden sm:block`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-800">
                {columns.map((c) => (
                  <th key={c.label} className="text-left px-5 py-3 text-xs text-slate-400 uppercase tracking-wide font-medium">{c.label}</th>
                ))}
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {!loading && rows.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="px-5 py-10 text-center text-slate-500 text-sm">No {title.toLowerCase()} found</td></tr>
              )}
              {loading && rows.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="px-5 py-10 text-center text-slate-500 text-sm">Loading…</td></tr>
              )}
              {rows.map((row) => {
                const inv = invoiceLink?.(row);
                return (
                  <tr key={row.id} className="hover:bg-navy-800/50 transition-colors">
                    {columns.map((c) => (
                      <td key={c.label} className={`px-5 py-3.5 text-xs text-slate-300 ${c.className ?? ""}`}>{c.render(row)}</td>
                    ))}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        {inv && (
                          <Link href={inv} className="hover:text-emerald-400" title="Invoices"><HiDocumentText /></Link>
                        )}
                        {canWrite && row.isActive && (
                          <>
                            <button onClick={() => openEdit(row)} className="hover:text-emerald-400" title="Edit"><HiPencil /></button>
                            <button onClick={() => remove(row)} className="hover:text-red-400" title="Delete"><HiTrash /></button>
                          </>
                        )}
                        {canWrite && !row.isActive && (
                          <button onClick={() => restore(row)} className="hover:text-emerald-400 flex items-center gap-1 text-xs" title="Restore">
                            <HiRefresh /> Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4">
          <form onSubmit={save} className="bg-navy-950 border border-navy-800 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-lg shadow-2xl space-y-4 max-h-[92dvh] overflow-y-auto">
            <h2 className="text-white font-bold text-base">{editing.id ? `Edit ${singular}` : `Add ${singular}`}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => {
                const value = editing.values[f.key] ?? "";
                const set = (v: string) => setEditing((p) => p && { ...p, values: { ...p.values, [f.key]: v } });
                return (
                  <div key={f.key} className={f.wide || f.type === "textarea" ? "sm:col-span-2" : ""}>
                    <label className={LABEL}>{f.label}{f.required && " *"}</label>
                    {f.type === "textarea" ? (
                      <textarea rows={2} value={value} onChange={(e) => set(e.target.value)} placeholder={f.placeholder} className={`${INPUT} resize-none`} />
                    ) : f.type === "select" ? (
                      <select value={value} onChange={(e) => set(e.target.value)} className={INPUT}>
                        {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input
                        type={f.type ?? "text"}
                        required={f.required}
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        placeholder={f.placeholder}
                        className={INPUT}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {error && <p className="text-xs text-red-400 bg-red-950/30 border border-red-900 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3 pt-1 sticky bottom-0 bg-navy-950 pb-1">
              <button type="submit" disabled={saving} className={`${BTN_PRIMARY} flex-1 py-3 sm:py-2`}>{saving ? "Saving…" : "Save"}</button>
              <button type="button" onClick={() => setEditing(null)} className={`${BTN_SECONDARY} flex-1 py-3 sm:py-2`}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
