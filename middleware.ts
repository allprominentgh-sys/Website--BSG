import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect the admin area
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get("bsg_admin_session");

    if (session?.value !== "authenticated") {
      const loginUrl = new URL("/admin/login", request.url);

      return NextResponse.redirect(loginUrl);
    }
  }

  // If an authenticated admin visits the login page,
  // send them directly to the dashboard.
  if (pathname === "/admin/login") {
    const session = request.cookies.get("bsg_admin_session");

    if (session?.value === "authenticated") {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
