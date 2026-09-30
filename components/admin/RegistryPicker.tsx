"use client";

import { useEffect, useRef, useState } from "react";
import { HiSearch, HiX, HiLink } from "react-icons/hi";
import { INPUT } from "./formStyles";

interface Props<T> {
  endpoint: string;                 // e.g. "/api/customers"
  placeholder: string;
  describe: (item: T) => { primary: string; secondary?: string; badge?: string };
  onSelect: (item: T) => void;
  linkedLabel?: string | null;      // shown as a chip when a record is linked
  onUnlink?: () => void;
}

/** Search-as-you-type combobox over a registry API (`?q=` search). */
export default function RegistryPicker<T extends { id: string }>({
  endpoint, placeholder, describe, onSelect, linkedLabel, onUnlink,
}: Props<T>) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<T[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const sep = endpoint.includes("?") ? "&" : "?";
        const res = await fetch(`${endpoint}${sep}limit=8&q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal });
        if (res.ok) { setItems(await res.json()); setActive(0); }
      } catch { /* aborted */ }
      setLoading(false);
    }, 200);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, open, endpoint]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(item: T) {
    onSelect(item);
    setQ("");
    setOpen(false);
  }

  function onKey(e: React.KeyboardEvent) {
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); pick(items[active]); }
    else if (e.key === "Escape") setOpen(false);
  }

  if (linkedLabel) {
    return (
      <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-emerald-900/30 border border-emerald-800 text-emerald-300">
        <HiLink className="flex-shrink-0" />
        <span className="flex-1 truncate">Linked to registry: <strong>{linkedLabel}</strong> — edits below update this record</span>
        {onUnlink && (
          <button type="button" onClick={onUnlink} className="text-emerald-400 hover:text-white" aria-label="Unlink">
            <HiX />
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={boxRef} className="relative">
      <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none" />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        placeholder={placeholder}
        className={`${INPUT} pl-9 border-dashed`}
        role="combobox"
        aria-expanded={open}
      />
      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-xl bg-navy-950 border border-navy-700 shadow-2xl max-h-72 overflow-y-auto">
          {loading && !items.length && <p className="px-3 py-2.5 text-xs text-slate-500">Searching…</p>}
          {!loading && !items.length && (
            <p className="px-3 py-2.5 text-xs text-slate-500">
              No match — fill the fields below to create a new record.
            </p>
          )}
          {items.map((item, i) => {
            const d = describe(item);
            return (
              <button
                type="button"
                key={item.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(item)}
                onMouseEnter={() => setActive(i)}
                className={`w-full text-left px-3 py-2 flex items-center gap-2 ${i === active ? "bg-navy-800" : ""}`}
              >
                <span className="flex-1 min-w-0">
                  <span className="block text-xs text-white truncate">{d.primary}</span>
                  {d.secondary && <span className="block text-[0.68rem] text-slate-400 truncate">{d.secondary}</span>}
                </span>
                {d.badge && (
                  <span className="text-[0.6rem] uppercase tracking-wide px-1.5 py-0.5 rounded bg-navy-800 text-slate-300">{d.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
