"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { verifyPassword, signToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";

export async function loginAction(
  email: string,
  password: string
): Promise<{ error: string }> {
  if (!email || !password) {
    return { error: "Email and password required" };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    await prisma.auditLog
      .create({
        data: {
          action: "ADMIN_LOGIN_FAILED",
          entityType: "AdminUser",
          hashedIp: "sa",
          userAgentHash: "sa",
          metadata: { email },
        } as never,
      })
      .catch(() => {});
    return { error: "Invalid credentials" };
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await prisma.auditLog
    .create({
      data: {
        action: "ADMIN_LOGIN",
        actorId: user.id,
        entityType: "AdminUser",
        entityId: user.id,
        hashedIp: "sa",
        userAgentHash: "sa",
      } as never,
    })
    .catch(() => {});

  const token = signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  redirect("/admin/dashboard");
}
