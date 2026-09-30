import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { requireAdmin, WRITE_ROLES } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { str, url, parseLimit, isLocationType } from "@/lib/registry";

// GET /api/locations?q=&type=HOSPITAL&active=true|false|all&limit=
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const sp = request.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const type = sp.get("type");
  const active = sp.get("active") ?? "true";

  const where: Prisma.LocationWhereInput = {
    ...(active === "all" ? {} : { isActive: active !== "false" }),
    ...(isLocationType(type) ? { type } : {}),
    ...(q ? {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
      ],
    } : {}),
  };

  const locations = await prisma.location.findMany({
    where,
    orderBy: [{ type: "asc" }, { name: "asc" }],
    take: parseLimit(sp.get("limit")),
    include: { _count: { select: { pickupInvoices: true, dropInvoices: true } } },
  });
  return NextResponse.json(locations);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => ({}));
  const name = str(body.name, 200);
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const location = await prisma.location.create({
    data: {
      type: isLocationType(body.type) ? body.type : "OTHER",
      name,
      address: str(body.address, 1000) ?? null,
      city: str(body.city, 100) ?? null,
      phone: str(body.phone, 30) ?? null,
      mapsUrl: url(body.mapsUrl) ?? null,
      notes: str(body.notes, 2000) ?? null,
    },
  });

  await logAudit(request, "LOCATION_CREATED", { actorId: auth.userId, entityType: "Location", entityId: location.id });
  return NextResponse.json(location, { status: 201 });
}
