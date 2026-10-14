
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", origin)
    );
  }

  const cookieStore = await cookies();

  const response = NextResponse.redirect(
    new URL("/dashboard", origin)
  );

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase authentication environment variables are missing.");

    return NextResponse.redirect(
      new URL("/login?error=configuration_error", origin)
    );
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          });
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

  // Read the account type saved during registration.
  const metadataAccountType =
    user.user_metadata?.account_type;

  // Check the user's existing profile without changing it.
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

    // Do not block a valid login because of a profile lookup.
    return response;
  }

  const accountType =
    profile?.account_type || metadataAccountType;

  // Buyers can proceed directly to the dashboard.
  if (accountType !== "seller" && accountType !== "business") {
    response.headers.set(
      "location",
      new URL("/dashboard", origin).toString()
    );

    return response;
  }

  // Existing completed profiles can proceed normally.
  if (profile?.profile_completed === true) {
    response.headers.set(
      "location",
      new URL("/dashboard", origin).toString()
    );

    return response;
  }

  // New sellers and businesses need to complete their profiles.
  response.headers.set(
    "location",
    new URL("/complete-profile", origin).toString()
  );

  return response;
}
