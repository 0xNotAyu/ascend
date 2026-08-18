import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic check only: middleware runs on the Edge runtime, so it can't
// hit Prisma/Mongo to fully validate the session. We just check whether the
// session cookie exists. Every API route still calls
// `auth.api.getSession(...)` server-side, which is the real check — this is
// purely to stop logged-out users from loading the app shell / bouncing
// logged-in users back into the auth flow.
const APP_ROUTES = ["/today", "/overview", "/plan"];
const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

function matches(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  if (matches(pathname, APP_ROUTES) && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (matches(pathname, AUTH_ROUTES) && sessionCookie) {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/today/:path*",
    "/overview/:path*",
    "/plan/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ],
};
