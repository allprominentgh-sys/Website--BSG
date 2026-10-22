
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceKey) {
      console.error(
        "Admin support: required environment variables are missing."
      );
      return jsonError("Server configuration is incomplete.", 500);
    }

    const authorization = request.headers.get("authorization");
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      return jsonError("Please sign in again.", 401);
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
        "Your login has expired or is invalid. Please sign out and sign in again.",
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
