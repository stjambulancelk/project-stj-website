import { NextRequest, NextResponse } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";
import crypto from "crypto";

const ADMIN_PATHS = /^\/admin(?!\/login)/;
const AUDIT_PATHS = /^\/(invoice|contact|api)/;

function hashIp(ip: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const salt = process.env.AUDIT_DAILY_SALT ?? "dev-salt";
  return crypto.createHash("sha256").update(ip + date + salt).digest("hex").slice(0, 16);
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth guard for /admin/* (except /admin/login)
  if (ADMIN_PATHS.test(pathname)) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? verifyToken(token) : null;

    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Pass session info as headers for use in server components if needed
    const response = NextResponse.next();
    response.headers.set("x-admin-user-id", session.userId);
    response.headers.set("x-admin-role", session.role);
    return response;
  }

  // IP logging header injection for audit-relevant paths
  if (AUDIT_PATHS.test(pathname)) {
    const ip = getIp(request);
    const hashedIp = hashIp(ip);
    const response = NextResponse.next();
    response.headers.set("x-hashed-ip", hashedIp);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/invoice/:path*", "/contact", "/api/:path*"],
};
