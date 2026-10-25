import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "bsg_admin_session";
const ADMIN_EMAIL = "admin@bestsalesgh.com";
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded =
    base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

async function verifySession(
  value: string | undefined
): Promise<boolean> {
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

  try {
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      toArrayBuffer(encoder.encode(secret)),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBytes = base64UrlToBytes(signature);
    const payloadBytes = encoder.encode(payload);

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      toArrayBuffer(signatureBytes),
      toArrayBuffer(payloadBytes)
    );

    if (!valid) return false;

    const session = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payload))
    );

    const now = Date.now();

    return (
      session.email === ADMIN_EMAIL &&
      typeof session.expiresAt === "number" &&
      Number.isFinite(session.expiresAt) &&
      session.expiresAt > now &&
      typeof session.lastActivityAt === "number" &&
      Number.isFinite(session.lastActivityAt) &&
      session.lastActivityAt <= now &&
      now - session.lastActivityAt < IDLE_TIMEOUT_MS
    );
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const session = request.cookies.get(COOKIE_NAME)?.value;
    const valid = await verifySession(session);

    if (!valid) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);

      const response = NextResponse.redirect(loginUrl);
      response.cookies.set({
        name: COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: request.nextUrl.protocol === "https:",
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
