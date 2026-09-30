import type { Prisma, LocationType } from "@prisma/client";
import { str, url, date, isLocationType } from "./registry";

// ============================================================
// Shared parsing + registry resolution for invoice create (POST) and edit (PUT).
// ============================================================

export interface ChargeInput { description: string; amount: number; quantity: number }

export interface ParsedInvoiceInput {
  customerId: string | null;
  customer: { name: string; phone: string; email: string | null; address: string | null };
  patientId: string | null;
  patient: { name: string | null; nic: string | null; ward: string | null; bedNumber: string | null };
  pickup: LocationInput;
  drop: LocationInput;
  service: { description: string; serviceDate: Date | null; vehicle: string | null; crewNotes: string | null };
  charges: ChargeInput[];
  totalAmount: number;
  expiresInDays: number | null;
}

interface LocationInput {
  locationId: string | null;
  type: LocationType | null;
  name: string | null;
  address: string | null;
  mapsUrl: string | null;
  save: boolean; // add to registry when no locationId
}

type Body = Record<string, unknown>;
const obj = (v: unknown): Body => (v && typeof v === "object" ? (v as Body) : {});
const id = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

function parseLocation(raw: unknown): LocationInput {
  const b = obj(raw);
  return {
    locationId: id(b.locationId),
    type: isLocationType(b.type) ? b.type : null,
    name: str(b.name, 200) ?? null,
    address: str(b.address, 1000) ?? null,
    mapsUrl: url(b.mapsUrl) ?? null,
    save: b.save !== false,
  };
}

export function parseInvoiceInput(raw: unknown): { ok: true; value: ParsedInvoiceInput } | { ok: false; error: string } {
  const b = obj(raw);
  const c = obj(b.customer);
  const p = obj(b.patient);
  const s = obj(b.service);

  const customer = {
    name: str(c.name, 200) ?? "",
    phone: (str(c.phone, 30) ?? "").replace(/\s/g, ""),
    email: str(c.email, 200) ?? null,
    address: str(c.address, 1000) ?? null,
  };
  const customerId = id(b.customerId);
  if (!customerId && (!customer.name || !customer.phone)) {
    return { ok: false, error: "Customer name and phone are required" };
  }

  const description = str(s.description, 500);
  if (!description) return { ok: false, error: "Service description is required" };

  const rawCharges = Array.isArray(b.charges) ? b.charges : [];
  const charges: ChargeInput[] = [];
  for (const rc of rawCharges) {
    const ch = obj(rc);
    const d = str(ch.description, 200);
    const amount = Math.round(parseFloat(String(ch.amount)) * 100) / 100;
    const quantity = parseInt(String(ch.quantity ?? "1"), 10) || 1;
    if (!d || !Number.isFinite(amount) || amount <= 0) continue;
    if (quantity < 1 || quantity > 999) return { ok: false, error: `Invalid quantity for "${d}"` };
    charges.push({ description: d, amount, quantity });
  }
  if (!charges.length) return { ok: false, error: "At least one charge is required" };
  const totalAmount = Math.round(charges.reduce((sum, ch) => sum + ch.amount * ch.quantity, 0) * 100) / 100;

  const exp = parseInt(String(b.expiresInDays ?? ""), 10);

  return {
    ok: true,
    value: {
      customerId,
      customer,
      patientId: id(b.patientId),
      patient: {
        name: str(p.name, 200) ?? null,
        nic: str(p.nic, 20)?.toUpperCase() ?? null,
        ward: str(p.ward, 50) ?? null,
        bedNumber: str(p.bedNumber, 20) ?? null,
      },
      pickup: parseLocation(b.pickup),
      drop: parseLocation(b.drop),
      service: {
        description,
        serviceDate: date(s.serviceDate) ?? null,
        vehicle: str(s.vehicle, 100) ?? null,
        crewNotes: str(s.crewNotes, 2000) ?? null,
      },
      charges,
      totalAmount,
      expiresInDays: Number.isFinite(exp) ? exp : null,
    },
  };
}

export class InputError extends Error {}

/**
 * Resolve customer / patient / locations against the registries (inside a tx).
 * - Selected record (id given): fields typed in the form update that record.
 * - No id: reuse an exact match (customer: phone+name, patient: NIC) or create new.
 * Returns the invoice columns to write (relations + snapshots).
 */
export async function resolveRegistries(tx: Prisma.TransactionClient, input: ParsedInvoiceInput) {
  // ── Customer ──
  let customerId: string;
  if (input.customerId) {
    const existing = await tx.customer.findUnique({ where: { id: input.customerId } });
    if (!existing) throw new InputError("Selected customer no longer exists");
    const c = input.customer;
    await tx.customer.update({
      where: { id: existing.id },
      data: {
        ...(c.name ? { name: c.name } : {}),
        ...(c.phone ? { phone: c.phone } : {}),
        email: c.email,
        address: c.address,
        isActive: true,
      },
    });
    customerId = existing.id;
  } else {
    const c = input.customer;
    const match = await tx.customer.findFirst({
      where: { phone: c.phone, name: { equals: c.name, mode: "insensitive" } },
    });
    const saved = match
      ? await tx.customer.update({
          where: { id: match.id },
          data: { ...(c.email ? { email: c.email } : {}), ...(c.address ? { address: c.address } : {}), isActive: true },
        })
      : await tx.customer.create({ data: { name: c.name, phone: c.phone, email: c.email, address: c.address } });
    customerId = saved.id;
  }

  // ── Patient ──
  let patientId: string | null = null;
  const p = input.patient;
  if (input.patientId) {
    const existing = await tx.patient.findUnique({ where: { id: input.patientId } });
    if (!existing) throw new InputError("Selected patient no longer exists");
    await tx.patient.update({
      where: { id: existing.id },
      data: { ...(p.name ? { name: p.name } : {}), ...(p.nic ? { nic: p.nic } : {}), isActive: true },
    });
    patientId = existing.id;
  } else if (p.name) {
    const match = p.nic ? await tx.patient.findFirst({ where: { nic: p.nic } }) : null;
    patientId = match
      ? match.id
      : (await tx.patient.create({ data: { name: p.name, nic: p.nic } })).id;
  }

  // ── Pickup / drop ──
  async function resolveLocation(loc: LocationInput) {
    if (!loc.locationId && !loc.name && !loc.address && !loc.mapsUrl) {
      return { locationId: null, type: null, name: null, address: null, mapsUrl: null };
    }
    let locationId: string | null = null;
    let snap = { type: loc.type, name: loc.name, address: loc.address, mapsUrl: loc.mapsUrl };
    if (loc.locationId) {
      const existing = await tx.location.findUnique({ where: { id: loc.locationId } });
      if (!existing) throw new InputError("Selected location no longer exists");
      locationId = existing.id;
      snap = {
        type: existing.type,
        name: loc.name ?? existing.name,
        address: loc.address ?? existing.address,
        mapsUrl: loc.mapsUrl ?? existing.mapsUrl,
      };
    } else if (loc.name && loc.save) {
      const created = await tx.location.create({
        data: { type: loc.type ?? "OTHER", name: loc.name, address: loc.address, mapsUrl: loc.mapsUrl },
      });
      locationId = created.id;
      snap.type = created.type;
    }
    return { locationId, ...snap };
  }
  const pickup = await resolveLocation(input.pickup);
  const drop = await resolveLocation(input.drop);

  return {
    customerId,
    billingAddress: input.customer.address,
    patientId,
    patientName: p.name,
    patientNic: p.nic,
    ward: p.ward,
    bedNumber: p.bedNumber,
    pickupLocationId: pickup.locationId,
    pickupType: pickup.type,
    pickupName: pickup.name,
    pickupAddress: pickup.address,
    pickupMapsUrl: pickup.mapsUrl,
    dropLocationId: drop.locationId,
    dropType: drop.type,
    dropName: drop.name,
    dropAddress: drop.address,
    dropMapsUrl: drop.mapsUrl,
    description: input.service.description,
    serviceDate: input.service.serviceDate,
    vehicle: input.service.vehicle,
    crewNotes: input.service.crewNotes,
    totalAmount: input.totalAmount,
  };
}
