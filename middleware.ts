
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "bsg_admin_session";

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

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(signature),
      new TextEncoder().encode(payload)
    );

    if (!isValid) {
      return false;
    }

    const decoded = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payload))
    );

    return (
      decoded.email === "admin@bestsalesgh.com" &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Date.now()
    );
  } catch (error) {
    console.error("Session verification failed:", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the administrator login page.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Protect all other administrator pages.
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get(COOKIE_NAME)?.value;

    if (!session || !(await verifySession(session))) {
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
