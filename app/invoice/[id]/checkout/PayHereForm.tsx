"use client";

import { useEffect } from "react";
import type { PayHerePayload } from "@/lib/payhere";
import { PAYHERE } from "@/lib/constants";

export default function PayHereForm({ payload }: { payload: PayHerePayload }) {
  useEffect(() => {
    const form = document.getElementById("payhere-form") as HTMLFormElement | null;
    form?.submit();
  }, []);

  return (
    <form id="payhere-form" method="POST" action={PAYHERE.baseUrl} className="hidden">
      {Object.entries(payload).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
    </form>
  );
}
