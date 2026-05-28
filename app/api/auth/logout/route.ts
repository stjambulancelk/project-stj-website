import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const session = verifyToken(token);
    if (session?.sessionId) {
      await prisma.adminSession.delete({ where: { id: session.sessionId } }).catch(() => {});
    }
  }
  // Railway strips Set-Cookie — client clears cookie via document.cookie after this call.
  return NextResponse.json({ ok: true }, {
    headers: { "Cache-Control": "no-store, no-cache, private" },
  });
}
