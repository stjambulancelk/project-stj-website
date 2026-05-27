import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";
import { buildAuditEntry } from "@/lib/audit";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, charges: true },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const allowedFields = ["status", "vehicle", "crewNotes"];
  const data: Record<string, unknown> = {};

  for (const f of allowedFields) {
    if (f in body) data[f] = body[f];
  }

  if (body.status === "PAID" && !data.paidAt) {
    data.paidAt = new Date();
  }

  const invoice = await prisma.invoice.update({ where: { id }, data });

  const audit = buildAuditEntry(request, "INVOICE_UPDATED", { actorId: session.userId, entityType: "Invoice", entityId: id });
  await prisma.auditLog.create({ data: { ...audit, invoiceId: id } as never }).catch(() => {});

  return NextResponse.json(invoice);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.invoice.delete({ where: { id } });

  const audit = buildAuditEntry(request, "INVOICE_DELETED", { actorId: session.userId, entityType: "Invoice", entityId: id });
  await prisma.auditLog.create({ data: { ...audit } as never }).catch(() => {});

  return NextResponse.json({ ok: true });
}
