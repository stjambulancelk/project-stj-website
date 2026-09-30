import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { requireAdmin, WRITE_ROLES } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { str, date, parseLimit } from "@/lib/registry";

// GET /api/patients?q=&active=true|false|all&limit=
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const sp = request.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const active = sp.get("active") ?? "true";

  const where: Prisma.PatientWhereInput = {
    ...(active === "all" ? {} : { isActive: active !== "false" }),
    ...(q ? {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { nic: { contains: q, mode: "insensitive" } },
        { phone: { contains: q.replace(/\s/g, "") } },
      ],
    } : {}),
  };

  const patients = await prisma.patient.findMany({
    where,
    orderBy: q ? { name: "asc" } : { createdAt: "desc" },
    take: parseLimit(sp.get("limit")),
    include: { _count: { select: { invoices: true } } },
  });
  return NextResponse.json(patients);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => ({}));
  const name = str(body.name, 200);
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const patient = await prisma.patient.create({
    data: {
      name,
      nic: str(body.nic, 20)?.toUpperCase() ?? null,
      phone: str(body.phone, 30)?.replace(/\s/g, "") ?? null,
      dateOfBirth: date(body.dateOfBirth) ?? null,
      gender: str(body.gender, 20) ?? null,
      notes: str(body.notes, 2000) ?? null,
    },
  });

  await logAudit(request, "PATIENT_CREATED", { actorId: auth.userId, entityType: "Patient", entityId: patient.id });
  return NextResponse.json(patient, { status: 201 });
}
