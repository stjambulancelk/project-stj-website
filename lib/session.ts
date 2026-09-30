import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "./db";
import { verifyToken, SESSION_COOKIE, type AdminSession } from "./auth";

export type Role = "SUPER_ADMIN" | "DISPATCHER" | "VIEWER";

/**
 * Verifies the signed cookie AND that the server-side session row still exists
 * (catches revoked / expired sessions, same as the admin layout does).
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifyToken(token) : null;
  if (!session) return null;

  const dbSession = await prisma.adminSession.findUnique({ where: { id: session.sessionId } });
  if (!dbSession || dbSession.expiresAt < new Date()) return null;
  return session;
}

/**
 * For API routes. Returns the session, or a NextResponse to return directly.
 *   const auth = await requireAdmin(["SUPER_ADMIN", "DISPATCHER"]);
 *   if (auth instanceof NextResponse) return auth;
 */
export async function requireAdmin(roles?: Role[]): Promise<AdminSession | NextResponse> {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (roles && !roles.includes(session.role as Role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

/** Roles allowed to create/update/delete records. */
export const WRITE_ROLES: Role[] = ["SUPER_ADMIN", "DISPATCHER"];
