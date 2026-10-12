import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const response = NextResponse.redirect(
    new URL("/cms/login", request.url),
    303
  );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase environment variables are missing." },
      { status: 500 }
    );
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.headers
            .get("cookie")
            ?.split(";")
            .map((cookie) => {
              const separator = cookie.indexOf("=");

              return {
                name: cookie.slice(0, separator).trim(),
                value: cookie.slice(separator + 1).trim(),
              };
            })
            .filter((cookie) => cookie.name.length > 0) ?? [];
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json(
      { error: "Unable to sign out. Please try again." },
      { status: 500 }
    );
  }

  return response;
}
