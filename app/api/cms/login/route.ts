
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server configuration is missing." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const companyId = String(body.company_id ?? "").trim();
    const staffId = String(body.staff_id ?? "").trim();
    const password = String(body.password ?? "");

    if (!companyId || !staffId || !password) {
      return NextResponse.json(
        { error: "Company ID, staff ID and password are required." },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: staff, error } = await supabase
      .from("cms_staff")
      .select("id, company_id, staff_id, password_hash, is_active")
      .eq("company_id", companyId)
      .eq("staff_id", staffId)
      .maybeSingle();

    if (error) {
      console.error("CMS login database error:", error.message);
      return NextResponse.json(
        { error: "Unable to verify staff account." },
        { status: 500 }
      );
    }

    if (!staff || staff.is_active !== true) {
      return NextResponse.json(
        { error: "Invalid credentials or inactive account." },
        { status: 401 }
      );
    }

    const bcrypt = await import("bcryptjs");
    const passwordMatches = await bcrypt.compare(
      password,
      staff.password_hash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid credentials or inactive account." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Credentials verified.",
      staff: {
        id: staff.id,
        company_id: staff.company_id,
        staff_id: staff.staff_id,
      },
    });
  } catch (error) {
    console.error("CMS login error:", error);
    return NextResponse.json(
      { error: "An unexpected login error occurred." },
      { status: 500 }
    );
  }
}
