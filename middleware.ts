
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "bsg_admin_session";

/*
 * Convert Base64URL text into bytes.
 */
function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

/*
 * Convert Uint8Array to a standalone ArrayBuffer.
 * This avoids the TypeScript BufferSource compatibility error.
 */
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);

  new Uint8Array(buffer).set(bytes);

  return buffer;
}

/*
 * Verify the administrator session cookie.
 */
async function verifySession(value: string): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    console.error("ADMIN_SESSION_SECRET is missing.");
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
    const encoder = new TextEncoder();

    /*
     * Import the secret key.
     */
    const key = await crypto.subtle.importKey(
      "raw",
      toArrayBuffer(encoder.encode(secret)),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["verify"]
    );

    /*
     * Convert the signature and payload to ArrayBuffer.
     */
    const signatureBuffer = toArrayBuffer(
      base64UrlToBytes(signature)
    );

    const payloadBuffer = toArrayBuffer(
      encoder.encode(payload)
    );

    /*
     * Verify the HMAC signature.
     */
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      payloadBuffer
    );

    if (!isValid) {
      return false;
    }

    /*
     * Decode the verified session payload.
     */
    const decoded = JSON.parse(
      new TextDecoder().decode(
        base64UrlToBytes(payload)
      )
    );

    /*
     * Confirm the administrator identity and expiry.
     */
    return (
      decoded.email === "admin@bestsalesgh.com" &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Date.now()
    );
  } catch (error) {
    console.error(
      "Session verification failed:",
      error
    );

    return false;
  }
}

/*
 * Protect administrator pages.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Allow the administrator login page.
   */
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  /*
   * Protect all other administrator pages.
   */
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get(
      COOKIE_NAME
    )?.value;

    if (!session || !(await verifySession(session))) {
      const loginUrl = new URL(
        "/admin/login",
        request.url
      );

      loginUrl.searchParams.set(
        "redirect",
        pathname
      );

      const response = NextResponse.redirect(loginUrl);

      response.cookies.delete(COOKIE_NAME);

      return response;
    }
  }

  return NextResponse.next();
}

/*
 * Apply middleware to administrator routes.
 */
export const config = {
  matcher: ["/admin/:path*"],
};
