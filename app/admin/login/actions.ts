"use server";

import prisma from "@/lib/db";
import { verifyPassword, signToken, SESSION_MAX_AGE } from "@/lib/auth";

export async function loginAction(
  email: string,
  password: string
): Promise<{ error: string } | { token: string }> {
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

  // Create a server-side session record — allows remote revocation.
  const session = await prisma.adminSession.create({
    data: {
      adminId: user.id,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
    },
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

  // JWT payload includes sessionId — middleware verifies signature (Edge),
  // layout verifies session exists in DB (Node.js, catches revocations).
  const token = signToken({
    sessionId: session.id,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  // Railway strips Set-Cookie from all HTTP responses.
  // Return token to client; LoginForm sets it via document.cookie.
  return { token };
}
