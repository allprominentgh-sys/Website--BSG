
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "admin@bestsalesgh.com";
const COOKIE_NAME = "bsg_admin_session";

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function verifyAdminCookie(token: string, secret: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, suppliedSignature] = parts;
  const expectedSignature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);

  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return false;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    return (
      decoded.email === ADMIN_EMAIL &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // First: recognize the administrator session used by the admin dashboard.
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;
    const adminCookie = request.cookies.get(COOKIE_NAME)?.value;

    if (sessionSecret && adminCookie) {
      if (verifyAdminCookie(adminCookie, sessionSecret)) {
        return NextResponse.json(
          {
            success: true,
            message: "Administrator access verified successfully.",
            authenticationMethod: "admin-session",
          },
          {
            status: 200,
            headers: { "Cache-Control": "no-store" },
          }
        );
      }
    }

    // Fallback: retain the existing Supabase Auth administrator check.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceKey) {
      console.error(
        "Admin support: required Supabase environment variables are missing."
      );
      return jsonError("Server configuration is incomplete.", 500);
    }

    const authorization = request.headers.get("authorization");
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      return jsonError(
        "Administrator session is missing or invalid. Please sign in again.",
        401
      );
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return jsonError(
        "Your login has expired or is invalid. Please sign in again.",
        401
      );
    }

    const adminDb = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: profile, error: profileError } = await adminDb
      .from("profiles")
      .select("id, account_type")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Admin support: profile lookup failed:",
        profileError.message
      );
      return jsonError(
        "Unable to verify administrator permissions.",
        500
      );
    }

    if (!profile) {
      return jsonError(
        "Your signed-in account has no matching profile.",
        403
      );
    }

    const role = String(profile.account_type ?? "")
      .trim()
      .toLowerCase();

    if (role !== "admin" && role !== "administrator") {
      return jsonError("Administrator access is required.", 403);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Administrator access verified successfully.",
        authenticationMethod: "supabase-auth",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Admin support access check failed:", error);
    return jsonError(
      "Unexpected server error while checking administrator access.",
      500
    );
  }
}
