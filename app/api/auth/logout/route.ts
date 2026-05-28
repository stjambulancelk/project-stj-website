import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const cookieStr = `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", cookieStr);
  response.headers.set("Cache-Control", "no-store, no-cache, private");
  return response;
}
