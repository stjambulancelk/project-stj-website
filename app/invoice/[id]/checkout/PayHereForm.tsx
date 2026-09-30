"use client";

import { useEffect } from "react";
import type { PayHerePayload } from "@/lib/payhere";

// `action` comes from the server — PAYHERE_BASE_URL is not available in the browser bundle.
export default function PayHereForm({ payload, action }: { payload: PayHerePayload; action: string }) {
  useEffect(() => {
    const form = document.getElementById("payhere-form") as HTMLFormElement | null;
    form?.submit();
  }, []);

  return (
    <form id="payhere-form" method="POST" action={action} className="hidden">
      {Object.entries(payload).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
    </form>
  );
}
