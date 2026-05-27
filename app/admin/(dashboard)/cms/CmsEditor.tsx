"use client";

import { useState } from "react";

const I = "w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500";

export default function CmsEditor({
  sectionId,
  initialTitle,
  initialBody,
}: {
  sectionId: string;
  initialTitle: string;
  initialBody: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setStatus("saving");
    try {
      const res = await fetch(`/api/cms/${sectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      setStatus(res.ok ? "saved" : "error");
      if (res.ok) setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-2">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        className={I}
        placeholder="Title / heading (optional)"
      />
      <textarea
        rows={3}
        value={body}
        onChange={e => setBody(e.target.value)}
        className={`${I} resize-y`}
        placeholder="Body text…"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Plain text — HTML not supported</span>
        <button
          onClick={save}
          disabled={status === "saving"}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 ${
            status === "saved" ? "bg-emerald-700 text-white" :
            status === "error" ? "bg-red-700 text-white" :
            "bg-emerald-600 hover:bg-emerald-500 text-white"
          }`}
        >
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : status === "error" ? "Error" : "Save"}
        </button>
      </div>
    </div>
  );
}
