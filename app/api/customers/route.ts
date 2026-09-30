import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { requireAdmin, WRITE_ROLES } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { str, parseLimit } from "@/lib/registry";

// GET /api/customers?q=&active=true|false|all&limit=
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const sp = request.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const active = sp.get("active") ?? "true";

  const where: Prisma.CustomerWhereInput = {
    ...(active === "all" ? {} : { isActive: active !== "false" }),
    ...(q ? {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q.replace(/\s/g, "") } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    } : {}),
  };

  const customers = await prisma.customer.findMany({
    where,
    orderBy: q ? { name: "asc" } : { createdAt: "desc" },
    take: parseLimit(sp.get("limit")),
    include: { _count: { select: { invoices: true } } },
  });
  return NextResponse.json(customers);
}

// POST /api/customers
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => ({}));
  const name = str(body.name, 200);
  const phone = str(body.phone, 30)?.replace(/\s/g, "");
  if (!name || !phone) return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });

  const customer = await prisma.customer.create({
    data: {
      name,
      phone,
      email: str(body.email, 200) ?? null,
      address: str(body.address, 1000) ?? null,
      notes: str(body.notes, 2000) ?? null,
    },
  });

  await logAudit(request, "CUSTOMER_CREATED", { actorId: auth.userId, entityType: "Customer", entityId: customer.id });
  return NextResponse.json(customer, { status: 201 });
}
