
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "bsg_admin_session";

function verifySession(value: string): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    return false;
  }

  const parts = value.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const [payload, signature] = parts;

  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    return (
      decoded.email === "admin@bestsalesgh.com" &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get(COOKIE_NAME)?.value;

    if (!session || !verifySession(session)) {
      const loginUrl = new URL(
        "/admin/login",
        request.url
      );

      loginUrl.searchParams.set("redirect", pathname);

      const response = NextResponse.redirect(loginUrl);

      response.cookies.delete(COOKIE_NAME);

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
