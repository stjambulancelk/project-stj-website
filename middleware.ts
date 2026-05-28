import { NextRequest, NextResponse } from "next/server";

// Edge Runtime — NO Node.js imports allowed here.
// All crypto uses Web Crypto API (crypto.subtle).

const ADMIN_PATHS = /^\/admin(?!\/login)/;
const SESSION_COOKIE = "stj_session";

function base64urlToBuffer(s: string): ArrayBuffer {
  const base64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buf;
}

async function verifyToken(
  token: string
): Promise<{ userId: string; email: string; role: string } | null> {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;
    const encoded = token.slice(0, dot);
    const sig = token.slice(dot + 1);

    const secret = process.env.NEXTAUTH_SECRET ?? "change-me-in-production";
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64urlToBuffer(sig),
      new TextEncoder().encode(encoded)
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64urlToBuffer(encoded)));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ADMIN_PATHS.test(pathname)) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-admin-user-id", session.userId);
    requestHeaders.set("x-admin-role", session.role);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
