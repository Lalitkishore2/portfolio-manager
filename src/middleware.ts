import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  // If no password is set on the server, bypass authentication
  if (!adminPassword) {
    return NextResponse.next();
  }

  const session = request.cookies.get("cms_session")?.value;
  const { pathname } = request.nextUrl;

  // Avoid redirect loops for login page and auth APIs
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Redirect to login if unauthorized
  if (session !== adminPassword) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply to all paths except static files, Next.js assets, favicon
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
