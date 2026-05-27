import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const allowed = ["title", "excerpt", "body", "imageUrl", "imageAlt", "isPublished", "publishedAt"];
  const data: Record<string, unknown> = {};
  for (const f of allowed) {
    if (f in body) data[f] = body[f];
  }

  const post = await prisma.newsPost.update({ where: { id }, data });
  return NextResponse.json(post);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role === "VIEWER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.newsPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
