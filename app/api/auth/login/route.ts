import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyPassword, signToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { buildAuditEntry } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Update last login
    await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    // Audit log
    const audit = buildAuditEntry(request, "ADMIN_LOGIN", { actorId: user.id });
    await prisma.auditLog.create({ data: { ...audit } as never }).catch(() => {});

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
