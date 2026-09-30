import { NextResponse } from "next/server";

const COOKIE_NAME = "bsg_admin_session";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Administrator logged out successfully.",
  });

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
}
