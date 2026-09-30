"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-renders the server page every `seconds` (up to `maxTries`) — used while waiting for PayHere's notification. */
export default function AutoRefresh({ seconds = 5, maxTries = 24 }: { seconds?: number; maxTries?: number }) {
  const router = useRouter();
  useEffect(() => {
    let tries = 0;
    const t = setInterval(() => {
      if (++tries > maxTries) return clearInterval(t);
      router.refresh();
    }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds, maxTries]);
  return null;
}
