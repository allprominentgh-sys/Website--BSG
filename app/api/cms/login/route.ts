
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "bsg_cms_session";
const SESSION_DURATION = 8 * 60 * 60 * 1000;

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.CMS_SESSION_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!secret || !supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "CMS server configuration is incomplete." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const companyId =
      typeof body.company_id === "string"
        ? body.company_id.trim()
        : "";
    const staffId =
      typeof body.staff_id === "string"
        ? body.staff_id.trim()
        : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (
      !companyId ||
      !staffId ||
      !password ||
      companyId.length > 100 ||
      staffId.length > 100 ||
      password.length > 1024
    ) {
      return NextResponse.json(
        { error: "Enter a valid Company ID, Staff ID and password." },
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
      .select("id, company_id, staff_id, password_hash, is_active, role")
      .eq("company_id", companyId)
      .eq("staff_id", staffId)
      .maybeSingle();

    if (error) {
      console.error("CMS staff lookup failed:", error.message);
      return NextResponse.json(
        { error: "Unable to verify the staff account. Check the CMS database setup." },
        { status: 500 }
      );
    }

    if (
      !staff ||
      staff.is_active !== true ||
      typeof staff.password_hash !== "string" ||
      !staff.password_hash
    ) {
      return NextResponse.json(
        { error: "Invalid credentials or inactive staff account." },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      staff.password_hash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid credentials or inactive staff account." },
        { status: 401 }
      );
    }

    const now = Date.now();
    const payload = Buffer.from(
      JSON.stringify({
        staffId: staff.id,
        companyId: staff.company_id,
        employeeId: staff.staff_id,
        role: staff.role,
        issuedAt: now,
        expiresAt: now + SESSION_DURATION,
      })
    ).toString("base64url");

    const token = `${payload}.${signPayload(payload, secret)}`;

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      staff: {
        company_id: staff.company_id,
        staff_id: staff.staff_id,
        role: staff.role,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION / 1000,
    });

    response.headers.set("Cache-Control", "no-store");

    return response;
  } catch (error) {
    console.error("CMS login error:", error);

    return NextResponse.json(
      { error: "An unexpected login error occurred." },
      { status: 500 }
    );
  }
}
