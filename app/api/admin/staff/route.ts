
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["admin", "administrator"];

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonError("Supabase configuration is missing.", 500);
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
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Some request contexts do not allow cookie updates.
            }
          },
        },
      }
    );

    // Verify the real Supabase session on the server.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonError("Please sign in as an administrator.", 401);
    }

    // Verify the administrator role from the existing profile.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, account_type")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Staff API profile verification failed:", profileError.message);
      return jsonError("Unable to verify administrator access.", 500);
    }

    const role = (profile?.account_type ?? "").toLowerCase();

    if (!profile || !ALLOWED_ROLES.includes(role)) {
      return jsonError("Administrator access required.", 403);
    }

    let body: {
      full_name?: unknown;
      department?: unknown;
      job_title?: unknown;
      phone?: unknown;
      email?: unknown;
      start_date?: unknown;
      status?: unknown;
      notes?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return jsonError("Please submit valid JSON data.", 400);
    }

    const fullName =
      typeof body.full_name === "string" ? body.full_name.trim() : "";
    const department =
      typeof body.department === "string" ? body.department.trim() : "";
    const jobTitle =
      typeof body.job_title === "string" ? body.job_title.trim() : "";

    const phone =
      typeof body.phone === "string" ? body.phone.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const startDate =
      typeof body.start_date === "string" ? body.start_date.trim() : "";
    const notes =
      typeof body.notes === "string" ? body.notes.trim() : "";

    const status =
      typeof body.status === "string" ? body.status.trim().toLowerCase() : "active";

    if (!fullName || !department || !jobTitle) {
      return jsonError(
        "Full name, department and job title are required.",
        400
      );
    }

    if (
      fullName.length > 150 ||
      department.length > 100 ||
      jobTitle.length > 100 ||
      phone.length > 40 ||
      email.length > 254 ||
      notes.length > 2000
    ) {
      return jsonError("One or more fields exceed the allowed length.", 400);
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return jsonError("Enter a valid email address.", 400);
    }

    if (!["active", "inactive", "suspended"].includes(status)) {
      return jsonError(
        "Status must be active, inactive or suspended.",
        400
      );
    }

    if (
      startDate &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
        Number.isNaN(Date.parse(`${startDate}T00:00:00Z`)) ||
        new Date(`${startDate}T00:00:00Z`).toISOString().slice(0, 10) !== startDate)
    ) {
      return jsonError("Enter a valid start date in YYYY-MM-DD format.", 400);
    }

    // A random identifier reduces collisions; the database UNIQUE
    // constraint remains the final protection against duplicate IDs.
    const staffNumber = `BSG-STAFF-${randomUUID()
      .replace(/-/g, "")
      .slice(0, 12)
      .toUpperCase()}`;

    // Use the authenticated session client so existing RLS policies apply.
    const { data: staff, error: insertError } = await supabase
      .from("staff_members")
      .insert({
        staff_number: staffNumber,
        full_name: fullName,
        department,
        job_title: jobTitle,
        phone: phone || null,
        email: email || null,
        start_date: startDate || null,
        status,
        notes: notes || null,
      })
      .select(
        "id, staff_number, full_name, department, job_title, phone, email, start_date, status, created_at"
      )
      .single();

    if (insertError) {
      console.error("Staff registration insert failed:", insertError.code, insertError.message);

      if (insertError.code === "23505") {
        return jsonError(
          "A duplicate staff number was detected. Please try again.",
          409
        );
      }

      if (insertError.code === "42501") {
        return jsonError(
          "Your account is not permitted by the database security policy to register staff.",
          403
        );
      }

      return jsonError(
        "Staff registration failed. Check the database permissions and try again.",
        500
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Staff member registered successfully.",
        staff,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected staff registration error:", error);
    return jsonError("An unexpected server error occurred.", 500);
  }
}
