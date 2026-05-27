import crypto from "crypto";
import { AUDIT } from "./constants";

export type AuditAction =
  | "INVOICE_CREATED"
  | "INVOICE_SENT"
  | "INVOICE_UPDATED"
  | "INVOICE_DELETED"
  | "INVOICE_VIEWED"
  | "PAYMENT_INITIATED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "PAYMENT_WEBHOOK"
  | "ADMIN_LOGIN"
  | "ADMIN_LOGIN_FAILED"
  | "ADMIN_LOGOUT"
  | "CUSTOMER_CREATED"
  | "CUSTOMER_UPDATED"
  | "CMS_CONTENT_UPDATED"
  | "FILE_UPLOADED"
  | "USER_CREATED"
  | "USER_UPDATED";

export interface AuditEntry {
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  hashedIp: string;
  userAgentHash: string;
  metadata?: Record<string, unknown>;
}

export function hashIp(ip: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return crypto
    .createHash("sha256")
    .update(`${ip}:${today}:${AUDIT.dailySalt}`)
    .digest("hex")
    .slice(0, 16);
}

export function hashUserAgent(ua: string): string {
  return crypto.createHash("sha256").update(ua).digest("hex").slice(0, 12);
}

export function extractIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export function buildAuditEntry(
  request: Request,
  action: AuditAction,
  extras?: Partial<Omit<AuditEntry, "action" | "hashedIp" | "userAgentHash">>
): AuditEntry {
  const ip = extractIp(request);
  const ua = request.headers.get("user-agent") ?? "unknown";
  return {
    action,
    hashedIp: hashIp(ip),
    userAgentHash: hashUserAgent(ua),
    ...extras,
  };
}
