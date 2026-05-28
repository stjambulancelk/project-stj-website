import { NextRequest, NextResponse } from "next/server";

// Edge Runtime — keep this file free of Node.js imports.
// Full JWT verification (Node.js crypto) happens in app/admin/(dashboard)/layout.tsx.
// Middleware only checks cookie presence to avoid redundant edge-crypto complexity
// that has proven unreliable on Railway's edge proxy.

const ADMIN_PATHS = /^\/admin(?!\/login)/;
const SESSION_COOKIE = "stj_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ADMIN_PATHS.test(pathname)) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Cookie present — let the Node.js layout do full JWT signature + DB session check.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
