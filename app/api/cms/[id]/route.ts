import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { title, body } = await request.json();

  const row = await prisma.cmsContent.upsert({
    where: { id },
    create: { id, title: title || null, body: body || null, updatedBy: session.userId },
    update: { title: title || null, body: body || null, updatedBy: session.userId },
  });

  return NextResponse.json(row);
}
