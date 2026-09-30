// ============================================================
// Registry helpers shared by customers / patients / locations APIs + UI
// ============================================================

export const LOCATION_TYPES = ["HOSPITAL", "HOME", "OFFICE", "AIRPORT", "HARBOUR", "OTHER"] as const;
export type LocationTypeValue = (typeof LOCATION_TYPES)[number];

export const LOCATION_TYPE_LABEL: Record<LocationTypeValue, string> = {
  HOSPITAL: "Hospital",
  HOME: "Home",
  OFFICE: "Office",
  AIRPORT: "Airport",
  HARBOUR: "Harbour",
  OTHER: "Other",
};

export function isLocationType(v: unknown): v is LocationTypeValue {
  return typeof v === "string" && (LOCATION_TYPES as readonly string[]).includes(v);
}

/** Trim a string field; empty → null. Non-strings → undefined (field ignored). */
export function str(v: unknown, max = 500): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v !== "string") return undefined;
  const t = v.trim().slice(0, max);
  return t === "" ? null : t;
}

/** Only allow http(s) links (e.g. Google Maps) — blocks javascript: etc. */
export function url(v: unknown): string | null | undefined {
  const s = str(v, 1000);
  if (!s) return s;
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export function date(v: unknown): Date | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  if (typeof v !== "string") return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

/** Drop undefined keys so Prisma only updates fields that were sent. */
export function defined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

export function parseLimit(v: string | null, def = 50, max = 100) {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : def;
}
