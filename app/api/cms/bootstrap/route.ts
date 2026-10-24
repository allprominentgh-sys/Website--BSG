
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secureSecretMatch(
  supplied: string,
  expected: string
): boolean {
  const a = Buffer.from(supplied, "utf8");
  const b = Buffer.from(expected, "utf8");

  return a.length === b.length && timingSafeEqual(a, b);
}

function reply(
  body: Record<string, unknown>,
  status: number
) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const setupSecret = process.env.CMS_BOOTSTRAP_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !setupSecret ||
      setupSecret.length < 32 ||
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      return reply(
        { error: "Protected setup is not configured correctly." },
        500
      );
    }

    const body = await request.json();

    const suppliedSecret =
      typeof body.setup_secret === "string"
        ? body.setup_secret
        : "";

    if (!secureSecretMatch(suppliedSecret, setupSecret)) {
      return reply(
        { error: "Setup authorization failed." },
        401
      );
    }

    const companyId =
      typeof body.company_id === "string"
        ? body.company_id.trim()
        : "";

    const staffId =
      typeof body.staff_id === "string"
        ? body.staff_id.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (
      !companyId ||
      !staffId ||
      companyId.length > 100 ||
      staffId.length > 100 ||
      password.length < 12 ||
      password.length > 72
    ) {
      return reply(
        {
          error:
            "Enter valid IDs and a password between 12 and 72 characters."
        },
        400
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data, error } = await supabase.rpc(
      "bootstrap_initial_cms_admin",
      {
        p_company_id: companyId,
        p_staff_id: staffId,
        p_password_hash: passwordHash
      }
    );

    if (error || !data || data.length !== 1) {
      console.error(
        "CMS bootstrap RPC failed:",
        error?.message ?? "Unexpected result"
      );

      return reply(
        {
          error:
            "Administrator setup failed. Check the SQL function and database configuration."
        },
        500
      );
    }

    const created = data[0];

    return reply(
      {
        success: true,
        message:
          "Initial CMS administrator created successfully. Disable the bootstrap endpoint and remove its secret after setup.",
        staff: {
          company_id: created.company_id,
          staff_id: created.staff_id,
          role: created.role
        }
      },
      201
    );
  } catch (error) {
    console.error("CMS bootstrap failed:", error);

    return reply(
      { error: "An unexpected setup error occurred." },
      500
    );
  }
}
