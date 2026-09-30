import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin, WRITE_ROLES } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { str, url, defined, isLocationType } from "@/lib/registry";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const location = await prisma.location.findUnique({
    where: { id },
    include: { _count: { select: { pickupInvoices: true, dropInvoices: true } } },
  });
  if (!location) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(location);
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin(WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const data = defined({
    type: isLocationType(body.type) ? body.type : undefined,
    name: str(body.name, 200),
    address: str(body.address, 1000),
    city: str(body.city, 100),
    phone: str(body.phone, 30),
    mapsUrl: url(body.mapsUrl),
    notes: str(body.notes, 2000),
    isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
  });
  if (data.name === null) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });

  const existing = await prisma.location.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const location = await prisma.location.update({ where: { id }, data: data as never });
  await logAudit(request, "LOCATION_UPDATED", {
    actorId: auth.userId, entityType: "Location", entityId: id, metadata: { fields: Object.keys(data) },
  });
  return NextResponse.json(location);
}

// Hard delete when unused; archive when invoices reference it.
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin(WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.location.findUnique({
    where: { id },
    include: { _count: { select: { pickupInvoices: true, dropInvoices: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const archived = existing._count.pickupInvoices + existing._count.dropInvoices > 0;
  if (archived) await prisma.location.update({ where: { id }, data: { isActive: false } });
  else await prisma.location.delete({ where: { id } });

  await logAudit(request, "LOCATION_DELETED", {
    actorId: auth.userId, entityType: "Location", entityId: id, metadata: { archived },
  });
  return NextResponse.json({ ok: true, archived });
}
