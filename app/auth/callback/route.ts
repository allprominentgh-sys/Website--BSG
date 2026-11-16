
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function safeNextPath(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/auth/callback") ||
    value.includes("\\")
  ) {
    return "/dashboard";
  }

  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const code = requestUrl.searchParams.get("code");

  const nextPath = safeNextPath(
    requestUrl.searchParams.get("next")
  );

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", origin)
    );
  }

  const cookieStore = await cookies();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Supabase authentication configuration is missing."
    );

    return NextResponse.redirect(
      new URL("/login?error=configuration_error", origin)
    );
  }

  // Create one response and preserve it throughout the callback.
  const response = NextResponse.redirect(
    new URL(nextPath, origin)
  );

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              cookieStore.set(name, value, options);
              response.cookies.set(name, value, options);
            }
          );
        },
      },
    }
  );

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error(
      "AUTH CALLBACK ERROR:",
      exchangeError.message
    );

    return NextResponse.redirect(
      new URL("/login?error=authentication_failed", origin)
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(
      new URL("/login?error=authentication_failed", origin)
    );
  }

  const metadataAccountType =
    user.user_metadata?.account_type;

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("account_type, profile_completed")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    console.error(
      "PROFILE LOOKUP ERROR:",
      profileError.message
    );

    return response;
  }

  const accountType =
    profile?.account_type || metadataAccountType;

  // Sellers and businesses must complete their profiles first.
  if (
    (accountType === "seller" ||
      accountType === "business") &&
    profile?.profile_completed !== true
  ) {
    // Change the destination without replacing the response.
    // This preserves the Supabase session cookies.
    response.headers.set(
      "Location",
      new URL("/complete-profile", origin).toString()
    );
  }

  return response;
}
