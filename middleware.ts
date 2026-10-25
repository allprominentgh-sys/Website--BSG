import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const COOKIE_NAME = "bsg_admin_session";
const ADMIN_EMAIL = "admin@bestsalesgh.com";
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

type AdminSession = {
  email: string;
  expiresAt: number;
  lastActivityAt: number;
};

function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const crypto = require("crypto") as typeof import("crypto");

    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
}

function decodePayload(payload: string): AdminSession | null {
  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (
      !decoded ||
      typeof decoded.email !== "string" ||
      typeof decoded.expiresAt !== "number" ||
      typeof decoded.lastActivityAt !== "number"
    ) {
      return null;
    }

    return decoded as AdminSession;
  } catch {
    return null;
  }
}

function verifySession(value: string | undefined): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || !value || value.length > 8192) {
    return false;
  }

  const separator = value.lastIndexOf(".");

  if (separator <= 0 || separator === value.length - 1) {
    return false;
  }

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);

  if (!verifySignature(payload, signature, secret)) {
    return false;
  }

  const session = decodePayload(payload);

  if (!session) {
    return false;
  }

  const now = Date.now();

  return (
    session.email.toLowerCase() === ADMIN_EMAIL &&
    Number.isFinite(session.expiresAt) &&
    Number.isFinite(session.lastActivityAt) &&
    session.expiresAt > now &&
    session.lastActivityAt <= now &&
    now - session.lastActivityAt < IDLE_TIMEOUT_MS
  );
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow the login page so users can sign in.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Protect every other /admin page.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;

    if (!verifySession(sessionCookie)) {
      const loginUrl = new URL("/admin/login", request.url);

      // Only retain a local path for post-login navigation.
      loginUrl.searchParams.set("redirect", pathname);

      const response = NextResponse.redirect(loginUrl);

      response.cookies.set({
        name: COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      response.headers.set("Cache-Control", "no-store");

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
