
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "bsg_admin_session";
const ADMIN_EMAIL = "admin@bestsalesgh.com";

/**
 * Convert a Base64URL string into a standard ArrayBuffer.
 * This avoids TypeScript BufferSource compatibility errors.
 */
function base64UrlToArrayBuffer(value: string): ArrayBuffer {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded = base64.padEnd(
    Math.ceil(base64.length / 4) * 4,
    "="
  );

  const binary = atob(padded);

  const bytes = Uint8Array.from(binary, (char) =>
    char.charCodeAt(0)
  );

  const buffer = new ArrayBuffer(bytes.length);

  new Uint8Array(buffer).set(bytes);

  return buffer;
}

/**
 * Verify the signed administrator session.
 */
async function verifySession(value: string): Promise<boolean> {
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

  try {
    // Import the secret key using the Web Crypto API.
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["verify"]
    );

    // Verify the signature.
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToArrayBuffer(signature),
      new TextEncoder().encode(payload)
    );

    if (!isValid) {
      return false;
    }

    // Decode the session payload.
    const decoded = JSON.parse(
      new TextDecoder().decode(
        base64UrlToArrayBuffer(payload)
      )
    );

    // Confirm the administrator and session expiry.
    return (
      decoded.email === ADMIN_EMAIL &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

/**
 * Protect administrator routes.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the administrator login page.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Protect all other admin pages.
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get(COOKIE_NAME)?.value;

    if (!session || !(await verifySession(session))) {
      const loginUrl = new URL(
        "/admin/login",
        request.url
      );

      loginUrl.searchParams.set("redirect", pathname);

      const response = NextResponse.redirect(loginUrl);

      // Remove invalid or expired session cookies.
      response.cookies.delete(COOKIE_NAME);

      return response;
    }
  }

  return NextResponse.next();
}

/**
 * Apply middleware to administrator routes.
 */
export const config = {
  matcher: ["/admin/:path*"],
};
