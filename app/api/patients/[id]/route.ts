import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin, WRITE_ROLES } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { str, date, defined } from "@/lib/registry";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, description: true, totalAmount: true, status: true, createdAt: true },
      },
    },
  });
  if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(patient);
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin(WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const data = defined({
    name: str(body.name, 200),
    nic: str(body.nic, 20)?.toUpperCase(),
    phone: str(body.phone, 30)?.replace(/\s/g, ""),
    dateOfBirth: date(body.dateOfBirth),
    gender: str(body.gender, 20),
    notes: str(body.notes, 2000),
    isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
  });
  if (data.name === null) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });

  const existing = await prisma.patient.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const patient = await prisma.patient.update({ where: { id }, data: data as never });
  await logAudit(request, "PATIENT_UPDATED", {
    actorId: auth.userId, entityType: "Patient", entityId: id, metadata: { fields: Object.keys(data) },
  });
  return NextResponse.json(patient);
}

// Hard delete when unused; archive when invoices reference it.
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin(WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.patient.findUnique({ where: { id }, include: { _count: { select: { invoices: true } } } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const archived = existing._count.invoices > 0;
  if (archived) await prisma.patient.update({ where: { id }, data: { isActive: false } });
  else await prisma.patient.delete({ where: { id } });

  await logAudit(request, "PATIENT_DELETED", {
    actorId: auth.userId, entityType: "Patient", entityId: id, metadata: { archived },
  });
  return NextResponse.json({ ok: true, archived });
}
