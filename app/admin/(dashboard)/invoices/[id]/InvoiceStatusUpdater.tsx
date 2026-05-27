"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["PENDING", "SENT", "PAID", "FAILED", "CANCELLED", "ON_HOLD"];

export default function InvoiceStatusUpdater({
  invoiceId,
  currentStatus,
}: {
  invoiceId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;
    setLoading(true);
    await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={loading}
      className="px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-700 text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
    >
      {STATUSES.map(s => (
        <option key={s} value={s} className="bg-navy-900">{s}</option>
      ))}
    </select>
  );
}
