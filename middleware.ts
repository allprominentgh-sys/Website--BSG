import { NextRequest, NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "bsg_admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
    Allow the admin login page without authentication.
  */
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  /*
    Only protect pages inside /admin.
  */
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get(
      ADMIN_SESSION_COOKIE
    )?.value;

    /*
      No admin session = send user to login.
    */
    if (!session) {
      const loginUrl = new URL(
        "/admin/login",
        request.url
      );

      loginUrl.searchParams.set(
        "redirect",
        pathname
      );

      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

/*
  Run middleware only on admin pages.
*/
export const config = {
  matcher: ["/admin/:path*"],
};
