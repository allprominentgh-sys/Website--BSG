
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
  const suppliedBuffer = Buffer.from(supplied, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (suppliedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(suppliedBuffer, expectedBuffer);
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
      return reply({ error: "Setup authorization failed." }, 401);
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
            "Enter Company ID, Staff ID and a password between 12 and 72 characters."
        },
        400
      );
    }

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

    // Bootstrap is permitted only while cms_staff is empty.
    const { data: existing, error: lookupError } = await supabase
      .from("cms_staff")
      .select("id")
      .limit(1);

    if (lookupError) {
      console.error(
        "CMS bootstrap lookup failed:",
        lookupError.message
      );

      return reply(
        { error: "Unable to verify the CMS account state." },
        500
      );
    }

    if (existing && existing.length > 0) {
      return reply(
        {
          error:
            "Initial setup is closed because a CMS staff account already exists."
        },
        409
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: created, error: insertError } = await supabase
      .from("cms_staff")
      .insert({
        company_id: companyId,
        staff_id: staffId,
        password_hash: passwordHash,
        role: "admin",
        is_active: true
      })
      .select("id, company_id, staff_id, role")
      .single();

    if (insertError || !created) {
      console.error(
        "CMS bootstrap insert failed:",
        insertError?.message ?? "No account returned"
      );

      return reply(
        {
          error:
            "The account was not created. Check whether the IDs already exist and verify the database setup."
        },
        500
      );
    }

    return reply(
      {
        success: true,
        message:
          "Initial CMS administrator created. Remove the bootstrap route and setup secret before normal production use.",
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
