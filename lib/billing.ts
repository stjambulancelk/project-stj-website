import type { InvoiceStatus, Prisma } from "@prisma/client";

// ============================================================
// Invoice money math — single source of truth for paid / refunded / balance.
// ============================================================

type Num = number | string | Prisma.Decimal;
const n = (v: Num) => Number(v);
const round2 = (v: number) => Math.round(v * 100) / 100;

export interface PaymentLike { amount: Num; status: string; refundedAmount?: Num | null }

export interface InvoiceTotals {
  total: number;
  paid: number;      // sum of successful payments (gross)
  refunded: number;  // sum refunded against those payments
  net: number;       // paid - refunded (money actually kept)
  balance: number;   // total - paid (never below 0). Refunds do NOT reopen a balance —
                     // refunding means that part is no longer owed.
}

export function computeTotals(totalAmount: Num, payments: PaymentLike[]): InvoiceTotals {
  const total = n(totalAmount);
  const settled = payments.filter((p) => p.status === "SUCCESS" || p.status === "REFUNDED");
  const paid = round2(settled.reduce((s, p) => s + n(p.amount), 0));
  const refunded = round2(settled.reduce((s, p) => s + n(p.refundedAmount ?? 0), 0));
  const net = round2(paid - refunded);
  return { total, paid, refunded, net, balance: Math.max(0, round2(total - paid)) };
}

/** Invoice status implied by money movements. Returns null when money doesn't decide it. */
export function statusFromTotals(t: InvoiceTotals): InvoiceStatus | null {
  if (t.refunded > 0) return t.net <= 0 ? "REFUNDED" : "PARTIALLY_REFUNDED";
  if (t.paid <= 0) return null;
  return t.net >= t.total ? "PAID" : "PARTIALLY_PAID";
}

/** Statuses where the customer can still pay online. */
export const PAYABLE_STATUSES: InvoiceStatus[] = ["PENDING", "SENT", "FAILED", "PARTIALLY_PAID"];

/** Statuses admins may set by hand — money-driven ones are set by payments/refunds only. */
export const MANUAL_STATUSES: InvoiceStatus[] = ["PENDING", "SENT", "FAILED", "CANCELLED", "ON_HOLD"];

/** An invoice can be edited only while no money has been taken against it. */
export function isEditable(status: InvoiceStatus, payments: PaymentLike[]): boolean {
  if (payments.some((p) => p.status === "SUCCESS" || p.status === "REFUNDED")) return false;
  return !["PAID", "REFUNDED", "PARTIALLY_PAID", "PARTIALLY_REFUNDED", "CANCELLED"].includes(status);
}

/**
 * Recompute and persist invoice status after a payment/refund change.
 * Pass a Prisma transaction client.
 */
export async function syncInvoiceStatus(tx: Prisma.TransactionClient, invoiceId: string) {
  const invoice = await tx.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });
  if (!invoice) return null;
  const totals = computeTotals(invoice.totalAmount, invoice.payments);
  const next = statusFromTotals(totals);
  if (next && next !== invoice.status) {
    await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: next, ...(next === "PAID" && !invoice.paidAt ? { paidAt: new Date() } : {}) },
    });
  }
  return { totals, status: next ?? invoice.status };
}

export const PAYMENT_SOURCE_LABEL: Record<string, string> = {
  PAYHERE: "PayHere (online)",
  CASH: "Cash",
  BANK_TRANSFER: "Bank transfer",
  CHEQUE: "Cheque",
  OTHER: "Other",
};

// ── Payment attempt state (for customer-facing pages) ────────────────────────

export interface AttemptLike {
  source: string;
  status: string;
  statusCode: string | null;
  initiatedAt: Date;
}

/** PayHere reported status_code 0 = payment pending on their side (e.g. bank processing). */
export function isProcessingAtPayHere(payments: AttemptLike[]): boolean {
  return payments.some((p) => p.source === "PAYHERE" && p.status === "PENDING" && p.statusCode === "0");
}

/**
 * A checkout was opened recently and PayHere hasn't reported back yet.
 * Could be abandoned — or paid and the notification is still in flight.
 */
export function hasRecentUnconfirmedAttempt(payments: AttemptLike[], minutes = 15): boolean {
  const since = Date.now() - minutes * 60_000;
  return payments.some(
    (p) => p.source === "PAYHERE" && p.status === "PENDING" && !p.statusCode && p.initiatedAt.getTime() > since
  );
}

/** Last PayHere attempt failed (declined / cancelled / chargeback). */
export function lastAttemptFailed(payments: AttemptLike[]): boolean {
  const last = payments
    // statusCode set = PayHere actually reported (excludes attempts retired by an invoice edit)
    .filter((p) => p.source === "PAYHERE" && p.status !== "PENDING" && p.statusCode)
    .sort((a, b) => b.initiatedAt.getTime() - a.initiatedAt.getTime())[0];
  return last?.status === "FAILED";
}

/** PayHere notify status_code meanings — admin-only (never shown to customers). */
export const PAYHERE_STATUS_LABEL: Record<string, string> = {
  "2": "Success",
  "0": "Pending at PayHere",
  "-1": "Cancelled by customer",
  "-2": "Failed / declined",
  "-3": "Chargeback",
};
