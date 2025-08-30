// apps/web/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "__session";

// pages that should be hidden when logged in
const PUBLIC_ONLY_PATHS = ["/", "/login", "/signup", "/reset"];

// pages that should require login
const PROTECTED_PREFIXES = ["/account", "/feed", "/members"];

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE_NAME)?.value);

  // 1) logged in + public page → redirect to /feed
  if (hasSession && PUBLIC_ONLY_PATHS.includes(url.pathname)) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // 2) not logged in + protected page → redirect to /login
  const isProtected = PROTECTED_PREFIXES.some((p) => url.pathname.startsWith(p));
  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Apply to all routes except static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
