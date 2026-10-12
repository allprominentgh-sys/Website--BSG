import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "admin@bestsalesgh.com";
const COOKIE_NAME = "bsg_admin_session";
const SESSION_DURATION = 8 * 60 * 60 * 1000;

function signSession(payload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
}

function verifySession(token: string, secret: string) {
  const parts = token.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [payload, suppliedSignature] = parts;
  const expectedSignature = signSession(payload, secret);

  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);

  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (
      decoded.email !== ADMIN_EMAIL ||
      typeof decoded.expiresAt !== "number" ||
      decoded.expiresAt <= Date.now()
    ) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

// Check whether the administrator is signed in.
export async function GET(request: NextRequest) {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET;

    if (!secret) {
      return NextResponse.json(
        { authenticated: false, message: "Admin session is not configured." },
        { status: 500 }
      );
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const session = verifySession(token, secret);

    if (!session) {
      const response = NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );

      response.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    const response = NextResponse.json({
      authenticated: true,
      email: ADMIN_EMAIL,
    });

    response.headers.set("Cache-Control", "no-store");

    return response;
  } catch (error) {
    console.error("ADMIN SESSION ERROR:", error);

    return NextResponse.json(
      { authenticated: false, message: "Unable to verify admin session." },
      { status: 500 }
    );
  }
}

// Sign out the administrator.
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Administrator signed out.",
  });

  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.headers.set("Cache-Control", "no-store");

  return response;
}

// Also support logout forms that submit POST requests.
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Administrator signed out.",
  });

  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.headers.set("Cache-Control", "no-store");

  return response;
}
