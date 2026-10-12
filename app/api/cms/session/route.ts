import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { authenticated: false, error: "Server configuration error." },
      { status: 500 }
    );
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get("cookie");

          if (!cookieHeader) return [];

          return cookieHeader.split(";").flatMap((part) => {
            const separator = part.indexOf("=");

            if (separator < 1) return [];

            return [{
              name: part.slice(0, separator).trim(),
              value: part.slice(separator + 1).trim(),
            }];
          });
        },
        setAll() {
          // This endpoint only verifies the current session.
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: data.user.id,
      email: data.user.email ?? null,
    },
  });
}
