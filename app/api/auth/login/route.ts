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
      const failAudit = buildAuditEntry(request, "ADMIN_LOGIN_FAILED", { metadata: { email } });
      await prisma.auditLog.create({ data: { ...failAudit } as never }).catch(() => {});
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const audit = buildAuditEntry(request, "ADMIN_LOGIN", { actorId: user.id });
    await prisma.auditLog.create({ data: { ...audit } as never }).catch(() => {});

    const token = signToken({ userId: user.id, email: user.email, name: user.name, role: user.role });

    const isProduction = process.env.NODE_ENV === "production";
    const cookieStr = [
      `${SESSION_COOKIE}=${token}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${SESSION_MAX_AGE}`,
      ...(isProduction ? ["Secure"] : []),
    ].join("; ");

    const response = NextResponse.json({ ok: true });
    response.headers.set("Set-Cookie", cookieStr);
    response.headers.set("Cache-Control", "no-store, no-cache, private");
    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
