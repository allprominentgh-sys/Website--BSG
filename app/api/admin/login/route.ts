
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_EMAIL = "admin@bestsalesgh.com";
const COOKIE_NAME = "bsg_admin_session";

function signSession(payload: string, secret: string) {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const rememberMe = body.rememberMe === true;

    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;

    if (!adminPassword || !sessionSecret) {
      console.error("Admin authentication environment variables are missing.");

      return NextResponse.json(
        {
          success: false,
          message: "Administrator login is not configured.",
        },
        { status: 500 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    if (
      email !== ADMIN_EMAIL ||
      password !== adminPassword
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid administrator email or password.",
        },
        { status: 401 }
      );
    }

    const expiresAt =
      Date.now() +
      (rememberMe
        ? 30 * 24 * 60 * 60 * 1000
        : 8 * 60 * 60 * 1000);

    const payload = Buffer.from(
      JSON.stringify({
        email: ADMIN_EMAIL,
        expiresAt,
      })
    ).toString("base64url");

    const signature = signSession(payload, sessionSecret);

    const sessionValue = `${payload}.${signature}`;

    const response = NextResponse.json({
      success: true,
      message: "Administrator login successful.",
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: rememberMe
        ? 60 * 60 * 24 * 30
        : 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process administrator login.",
      },
      { status: 500 }
    );
  }
}
