import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "admin@bestsalesgh.com";
const COOKIE_NAME = "bsg_admin_session";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

function signSession(payload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;

    if (!adminPassword || !sessionSecret) {
      console.error("Admin login configuration is missing.");

      return NextResponse.json(
        {
          success: false,
          message: "Administrator login is not configured.",
        },
        {
          status: 500,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        {
          status: 400,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    if (email !== ADMIN_EMAIL || password !== adminPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid administrator email or password.",
        },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const now = Date.now();

    const payload = Buffer.from(
      JSON.stringify({
        email: ADMIN_EMAIL,
        issuedAt: now,
        lastActivityAt: now,
        expiresAt: now + SESSION_DURATION_MS,
      }),
      "utf8"
    ).toString("base64url");

    const signature = signSession(payload, sessionSecret);
    const sessionValue = `${payload}.${signature}`;

    const response = NextResponse.json(
      {
        success: true,
        message: "Administrator login successful.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );

    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_MS / 1000,
    });

    return response;
  } catch (error) {
    console.error(
      "ADMIN LOGIN ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process administrator login.",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
