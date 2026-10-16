
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const TABLE_NAME = "platform_location_settings";
const SETTINGS_ID = 1;

async function getAdminContext() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    throw new Error("Missing required Supabase environment variables.");
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Cookie updates may be unavailable in some server contexts.
        }
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      response: NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();

  if (
    profileError ||
    !profile ||
    !["admin", "administrator"].includes(
      String(profile.account_type ?? "").toLowerCase()
    )
  ) {
    return {
      response: NextResponse.json(
        {
          success: false,
          message: "Administrator access is required.",
        },
        { status: 403 }
      ),
    };
  }

  // Server-side only. Never expose this key in a NEXT_PUBLIC_ variable.
  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return { user, adminSupabase };
}

function errorResponse(error: unknown) {
  console.error("Platform location API error:", error);

  return NextResponse.json(
    {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected server error occurred.",
    },
    { status: 500 }
  );
}

const defaultSettings = {
  id: SETTINGS_ID,
  company_name: "BestSalesGH",
  address: "",
  region: "",
  city: "",
  landmark: "",
  ghana_post_gps: "",
  latitude: null,
  longitude: null,
  is_configured: false,
};

export async function GET() {
  try {
    const context = await getAdminContext();

    if ("response" in context) {
      return context.response;
    }

    const { data, error } = await context.adminSupabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", SETTINGS_ID)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: data ?? defaultSettings,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await getAdminContext();

    if ("response" in context) {
      return context.response;
    }

    const body = await request.json();

    const textFields = [
      "company_name",
      "address",
      "region",
      "city",
      "landmark",
      "ghana_post_gps",
    ] as const;

    const updates: Record<string, unknown> = {};

    for (const field of textFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "string") {
          return NextResponse.json(
            {
              success: false,
              message: `${field} must be text.`,
            },
            { status: 400 }
          );
        }

        updates[field] = body[field].trim();
      }
    }

    for (const field of ["latitude", "longitude"] as const) {
      if (body[field] !== undefined) {
        const value = body[field];

        if (value === null || value === "") {
          updates[field] = null;
        } else if (
          typeof value === "number" &&
          Number.isFinite(value) &&
          (field === "latitude"
            ? value >= -90 && value <= 90
            : value >= -180 && value <= 180)
        ) {
          updates[field] = value;
        } else {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid ${field}.`,
            },
            { status: 400 }
          );
        }
      }
    }

    if (body.is_configured !== undefined) {
      if (typeof body.is_configured !== "boolean") {
        return NextResponse.json(
          {
            success: false,
            message: "is_configured must be true or false.",
          },
          { status: 400 }
        );
      }

      updates.is_configured = body.is_configured;
    }

    if (
      updates.company_name !== undefined &&
      !(updates.company_name as string)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Company name cannot be empty.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await context.adminSupabase
      .from(TABLE_NAME)
      .upsert(
        {
          ...defaultSettings,
          ...updates,
          id: SETTINGS_ID,
          updated_at: new Date().toISOString(),
          updated_by: context.user.id,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (error) {
      console.error("Supabase location save error:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Platform location settings saved successfully.",
      settings: data,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
