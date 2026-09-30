
import { NextResponse } from "next/server";

const COOKIE_NAME = "bsg_admin_session";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Administrator logged out successfully.",
    });

    // Clear the administrator session cookie.
    response.cookies.set({
      name: COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("ADMIN LOGOUT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to log out. Please try again.",
      },
      { status: 500 }
    );
  }
}
