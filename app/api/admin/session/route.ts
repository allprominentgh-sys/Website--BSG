import { NextRequest, NextResponse } from “next/server”;
import { createHmac, timingSafeEqual } from “crypto”;

export const runtime = “nodejs”;
export const dynamic = “force-dynamic”;

const COOKIE_NAME = “bsg_admin_session”;

function signSession(payload: string, secret: string) {
return createHmac(“sha256”, secret)
.update(payload)
.digest(“base64url”);
}

export async function GET(request: NextRequest) {
try {
const secret = process.env.ADMIN_SESSION_SECRET;

if (!secret) {
  return NextResponse.json(
    { authenticated: false, error: "Admin session is not configured." },
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
const parts = token.split(".");
if (parts.length !== 2) {
  return NextResponse.json(
    { authenticated: false },
    { status: 401 }
  );
}
const [payload, suppliedSignature] = parts;
const expectedSignature = signSession(payload, secret);
const supplied = Buffer.from(suppliedSignature);
const expected = Buffer.from(expectedSignature);
if (
  supplied.length !== expected.length ||
  !timingSafeEqual(supplied, expected)
) {
  return NextResponse.json(
    { authenticated: false },
    { status: 401 }
  );
}
const decoded = JSON.parse(
  Buffer.from(payload, "base64url").toString("utf8")
);
if (
  decoded.email !== "admin@bestsalesgh.com" ||
  typeof decoded.expiresAt !== "number" ||
  decoded.expiresAt <= Date.now()
) {
  return NextResponse.json(
    { authenticated: false },
    { status: 401 }
  );
}
return NextResponse.json(
  {
    authenticated: true,
    user: {
      email: decoded.email,
      role: "admin",
    },
  },
  {
    headers: { "Cache-Control": "no-store" },
  }
);

} catch (error) {
console.error(“Admin session check failed:”, error);

return NextResponse.json(
  { authenticated: false, error: "Unable to verify admin session." },
  { status: 401 }
);

}
}
