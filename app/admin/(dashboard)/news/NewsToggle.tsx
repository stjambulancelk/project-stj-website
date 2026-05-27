"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewsToggle({ postId, isPublished }: { postId: string; isPublished: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(isPublished);

  async function toggle() {
    setLoading(true);
    const next = !current;
    await fetch(`/api/news/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: next, publishedAt: next ? new Date().toISOString() : null }),
    });
    setCurrent(next);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 ${
        current
          ? "bg-emerald-900/30 text-emerald-400 border-emerald-800 hover:bg-emerald-900/50"
          : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
      }`}
    >
      {current ? "Published" : "Draft"}
    </button>
  );
}
