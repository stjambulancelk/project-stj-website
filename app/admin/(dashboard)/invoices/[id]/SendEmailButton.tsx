"use client";

import { useState } from "react";
import { HiMail, HiCheckCircle } from "react-icons/hi";

export default function SendEmailButton({ invoiceId }: { invoiceId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function send() {
    setState("loading");
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send-email`, { method: "POST" });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/30 text-emerald-400 text-xs font-medium">
        <HiCheckCircle /> Email Sent
      </span>
    );
  }

  return (
    <button
      onClick={send}
      disabled={state === "loading"}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white text-xs font-medium transition-colors disabled:opacity-60"
    >
      <HiMail />
      {state === "loading" ? "Sending…" : state === "error" ? "Retry Email" : "Send Email"}
    </button>
  );
}
