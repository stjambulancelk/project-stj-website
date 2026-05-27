import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { verifyToken, hashPassword, SESSION_COOKIE } from "@/lib/auth";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden — Super Admin only" }, { status: 403 });
  }

  try {
    const { name, email, password, role } = await request.json();
    if (!name || !email || !password || password.length < 8) {
      return NextResponse.json({ error: "Name, email, and password (min 8 chars) required" }, { status: 400 });
    }

    const exists = await prisma.adminUser.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

    const user = await prisma.adminUser.create({
      data: { name, email, passwordHash: hashPassword(password), role: role ?? "DISPATCHER" },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
