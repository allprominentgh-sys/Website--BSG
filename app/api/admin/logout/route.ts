
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function logoutResponse(request: NextRequest) {
  const loginUrl = new URL("/admin/login", request.url);
  const response = NextResponse.redirect(loginUrl, 303);

  response.cookies.set("bsg_admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });

  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  return logoutResponse(request);
}

export async function POST(request: NextRequest) {
  return logoutResponse(request);
}
