"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NewsPost } from "@prisma/client";

const L = "block text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400 mb-1.5";
const I = "w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm";

type Props = { post?: NewsPost | null };

export default function NewsForm({ post }: Props) {
  const router = useRouter();
  const isEdit = !!post;

  const [title, setTitle]       = useState(post?.title ?? "");
  const [excerpt, setExcerpt]   = useState(post?.excerpt ?? "");
  const [body, setBody]         = useState(post?.body ?? "");
  const [imageUrl, setImageUrl] = useState(post?.imageUrl ?? "");
  const [imageAlt, setImageAlt] = useState(post?.imageAlt ?? "");
  const [isPublished, setPublished] = useState(post?.isPublished ?? false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = { title, excerpt, body, imageUrl, imageAlt, isPublished };

    const res = isEdit
      ? await fetch(`/api/news/${post!.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/news",              { method: "POST",  headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Save failed");
      return;
    }
    router.push("/admin/news");
    router.refresh();
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <h1 className="text-headline-sm text-white font-bold">
        {isEdit ? "Edit Post" : "New Post"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-navy-900 border border-navy-800 p-6">
        <div>
          <label className={L}>Title *</label>
          <input className={I} value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title" required />
        </div>

        <div>
          <label className={L}>Excerpt</label>
          <input className={I} value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short summary (shown in news grid)" />
        </div>

        <div>
          <label className={L}>Body *</label>
          <textarea
            className={`${I} resize-y min-h-[260px]`}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Post content (plain text or basic HTML)"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={L}>Cover Image URL</label>
            <input className={I} value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="/news/photo.jpg" />
          </div>
          <div>
            <label className={L}>Image Alt Text</label>
            <input className={I} value={imageAlt} onChange={e => setImageAlt(e.target.value)} placeholder="Describe the image" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={isPublished}
            onClick={() => setPublished(p => !p)}
            className={`w-11 h-6 rounded-full transition-colors relative ${isPublished ? "bg-emerald-500" : "bg-navy-700"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isPublished ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
          <span className="text-sm text-slate-300">Publish immediately</span>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Post"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/news")}
            className="px-5 py-2.5 rounded-xl border border-navy-700 text-slate-400 hover:text-slate-200 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
