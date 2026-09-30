"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Money-driven statuses (PAID, REFUNDED, PARTIALLY_*) come from Record Payment / Refund only.
const STATUSES = ["PENDING", "SENT", "FAILED", "CANCELLED", "ON_HOLD"];

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
    if (newStatus === "CANCELLED" && !confirm("Cancel this invoice? The payment link will stop working.")) {
      e.target.value = currentStatus;
      return;
    }
    setLoading(true);
    await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  }

  // Paid / refunded invoices: status is shown in the header badge, not editable here
  if (!STATUSES.includes(currentStatus)) return null;

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={loading}
      className="px-3 py-2 sm:py-1.5 rounded-lg bg-navy-800 border border-navy-700 text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
    >
      {STATUSES.map(s => (
        <option key={s} value={s} className="bg-navy-900">{s}</option>
      ))}
    </select>
  );
}
