
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceKey) {
      console.error("Admin support API environment configuration is incomplete.");
      return jsonError("Server configuration is incomplete.", 500);
    }

    const authorization = request.headers.get("authorization");
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      return jsonError("Please sign in to continue.", 401);
    }

    // Verify the supplied token with Supabase Auth.
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
      return jsonError("Your session is invalid or expired. Please sign in again.", 401);
    }

    // Check the user's actual database role. Never trust a client-supplied role.
    const adminDb = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: profile, error: profileError } = await adminDb
      .from("profiles")
      .select("account_type")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Admin support profile lookup failed:", profileError.message);
      return jsonError("Unable to verify administrator permissions.", 500);
    }

    const role = String(profile?.account_type ?? "")
      .trim()
      .toLowerCase();

    if (!["admin", "administrator"].includes(role)) {
      return jsonError("Administrator access is required.", 403);
    }

    return NextResponse.json({
      success: true,
      message: "Administrator access verified successfully.",
    });
  } catch (error) {
    console.error("Admin support access check failed:", error);
    return jsonError("Unexpected server error.", 500);
  }
}
