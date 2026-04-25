import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/employers/dashboard"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (isProtected) {
    // Optimistic check using the cookie next-auth v5 sets (no DB, edge-safe)
    const hasSession =
      req.cookies.has("authjs.session-token") ||
      req.cookies.has("__Secure-authjs.session-token");

    if (!hasSession) {
      const loginUrl = new URL("/employers/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/employers/dashboard/:path*"],
};
