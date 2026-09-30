import { NextRequest, NextResponse } from "next/server";
import prisma, { TX_OPTIONS } from "@/lib/db";
import { requireAdmin, WRITE_ROLES } from "@/lib/session";
import { generateInvoiceId } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import { parseInvoiceInput, resolveRegistries, InputError } from "@/lib/invoice-input";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(status && status !== "ALL" ? { status: status as never } : {}),
      ...(q ? {
        OR: [
          { id: { contains: q, mode: "insensitive" } },
          { customer: { name: { contains: q, mode: "insensitive" } } },
          { patientName: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { customer: { select: { name: true, phone: true } } },
  });

  return NextResponse.json(invoices);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const parsed = parseInvoiceInput(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const input = parsed.value;

  try {
    const invoiceId = generateInvoiceId();
    const expiresAt = input.expiresInDays && input.expiresInDays > 0
      ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    await prisma.$transaction(async (tx) => {
      const fields = await resolveRegistries(tx, input);
      await tx.invoice.create({
        data: {
          id: invoiceId,
          ...fields,
          status: "PENDING",
          expiresAt,
          createdBy: auth.userId,
          charges: { create: input.charges },
        },
      });
    }, TX_OPTIONS);

    await logAudit(request, "INVOICE_CREATED", {
      actorId: auth.userId, entityType: "Invoice", entityId: invoiceId, invoiceId,
    });
    return NextResponse.json({ id: invoiceId }, { status: 201 });
  } catch (err) {
    if (err instanceof InputError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
