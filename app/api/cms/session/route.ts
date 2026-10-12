import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Supabase configuration is missing.",
        },
        { status: 500 }
      );
    }

    const cookieStore = cookies();

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(
                ({ name, value, options }) => {
                  cookieStore.set(name, value, options);
                }
              );
            } catch {
              // Cookie updates may be unavailable
              // in this request context.
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("id, full_name, account_type")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "CMS profile error:",
        profileError.message
      );

      return NextResponse.json(
        {
          authenticated: false,
          error: "Unable to verify profile.",
        },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const role = (
      profile.account_type ?? ""
    ).toLowerCase();

    if (!["admin", "administrator"].includes(role)) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Administrator access required.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: profile.id,
        full_name: profile.full_name,
        role,
      },
    });
  } catch (error) {
    console.error("CMS session error:", error);

    return NextResponse.json(
      {
        authenticated: false,
        error: "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
