import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";
import { generateInvoiceId } from "@/lib/utils";
import { buildAuditEntry } from "@/lib/audit";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(status && status !== "ALL" ? { status: status as never } : {}),
      ...(q ? { OR: [{ id: { contains: q, mode: "insensitive" } }, { customer: { name: { contains: q, mode: "insensitive" } } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { customer: { select: { name: true, phone: true } } },
  });

  return NextResponse.json(invoices);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { customer, service, patient, charges, expiresInDays } = await request.json();

    if (!customer?.name || !customer?.phone || !service?.description || !charges?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find or create customer by phone
    let dbCustomer = await prisma.customer.findFirst({ where: { phone: customer.phone } });
    if (!dbCustomer) {
      dbCustomer = await prisma.customer.create({
        data: { name: customer.name, phone: customer.phone, email: customer.email || null },
      });
    } else {
      dbCustomer = await prisma.customer.update({
        where: { id: dbCustomer.id },
        data: { name: customer.name, email: customer.email || null },
      });
    }

    const invoiceId = generateInvoiceId();
    const totalAmount = charges.reduce(
      (sum: number, c: { amount: string; quantity: string }) =>
        sum + parseFloat(c.amount) * (parseInt(c.quantity) || 1),
      0
    );

    const expiresAt = expiresInDays && expiresInDays > 0
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const invoice = await prisma.invoice.create({
      data: {
        id: invoiceId,
        customerId: dbCustomer.id,
        description: service.description,
        serviceDate: service.serviceDate ? new Date(service.serviceDate) : null,
        vehicle: service.vehicle || null,
        crewNotes: service.crewNotes || null,
        patientName: patient?.name || null,
        patientNic: patient?.nic || null,
        ward: patient?.ward || null,
        bedNumber: patient?.bedNumber || null,
        totalAmount,
        status: "PENDING",
        expiresAt,
        createdBy: session.userId,
        charges: {
          create: charges.map((c: { description: string; amount: string; quantity: string }) => ({
            description: c.description,
            amount: parseFloat(c.amount),
            quantity: parseInt(c.quantity) || 1,
          })),
        },
      },
    });

    // Audit log
    const audit = buildAuditEntry(request, "INVOICE_CREATED", { actorId: session.userId, entityType: "Invoice", entityId: invoiceId });
    await prisma.auditLog.create({ data: { ...audit, invoiceId } as never }).catch(() => {});

    return NextResponse.json({ id: invoice.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
