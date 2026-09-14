import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = "admin@bestsalesgh.com";

/*
  IMPORTANT:
  For production, the password should be stored in Vercel Environment
  Variables instead of inside this file.

  Vercel:
  ADMIN_PASSWORD = your-admin-password
*/
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const COOKIE_NAME = "bsg_admin_session";

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

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    /*
      Check administrator credentials.
    */
    if (
      email !== ADMIN_EMAIL ||
      !ADMIN_PASSWORD ||
      password !== ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid administrator email or password.",
        },
        { status: 401 }
      );
    }

    /*
      Create a simple signed-in session marker.

      The admin area will use this cookie to determine whether
      the administrator has successfully logged in.
    */
    const sessionValue = `admin-${Date.now()}-${crypto.randomUUID()}`;

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
