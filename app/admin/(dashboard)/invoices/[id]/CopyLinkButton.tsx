"use client";

import { useState } from "react";
import { HiClipboardCopy } from "react-icons/hi";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
    >
      <HiClipboardCopy /> {copied ? "Copied!" : "Copy Payment Link"}
    </button>
  );
}
