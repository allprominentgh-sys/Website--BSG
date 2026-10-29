
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["admin", "administrator"] as const;
const ALLOWED_STATUSES = ["active", "inactive", "suspended"] as const;

const STAFF_COLUMNS =
  "id, staff_number, full_name, department, job_title, phone, email, start_date, status, notes, created_at, updated_at";

type StaffStatus = (typeof ALLOWED_STATUSES)[number];

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

async function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase configuration is missing.");
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(url, anonKey, {
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
          // Cookie updates may not be available in every request context.
        }
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: jsonError("Please sign in as an administrator.", 401) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, account_type")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Staff API profile verification failed:", profileError.message);
    return {
      error: jsonError("Unable to verify administrator access.", 500),
    };
  }

  const role = String(profile?.account_type ?? "").trim().toLowerCase();

  if (!profile || !ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])) {
    return { error: jsonError("Administrator access required.", 403) };
  }

  return { supabase, user };
}

function validDate(value: string) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function parseStaffBody(body: Record<string, unknown>) {
  const full_name =
    typeof body.full_name === "string" ? body.full_name.trim() : "";
  const department =
    typeof body.department === "string" ? body.department.trim() : "";
  const job_title =
    typeof body.job_title === "string" ? body.job_title.trim() : "";
  const staff_number =
    typeof body.staff_number === "string"
      ? body.staff_number.trim().toUpperCase()
      : "";
  const phone =
    typeof body.phone === "string" ? body.phone.trim() : "";
  const email =
    typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "";
  const start_date =
    typeof body.start_date === "string" ? body.start_date.trim() : "";
  const notes =
    typeof body.notes === "string" ? body.notes.trim() : "";
  const status =
    typeof body.status === "string"
      ? body.status.trim().toLowerCase()
      : "active";

  if (!full_name || !department || !job_title) {
    return { error: "Full name, department and job title are required." };
  }

  if (
    full_name.length > 150 ||
    department.length > 100 ||
    job_title.length > 100 ||
    staff_number.length > 50 ||
    phone.length > 40 ||
    email.length > 254 ||
    notes.length > 2000
  ) {
    return { error: "One or more fields exceed the allowed length." };
  }

  if (!staff_number) {
    return { error: "Staff number is required." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  if (!(ALLOWED_STATUSES as readonly string[]).includes(status)) {
    return { error: "Status must be active, inactive or suspended." };
  }

  if (!validDate(start_date)) {
    return { error: "Enter a valid start date in YYYY-MM-DD format." };
  }

  return {
    data: {
      staff_number,
      full_name,
      department,
      job_title,
      phone: phone || null,
      email: email || null,
      start_date: start_date || null,
      status: status as StaffStatus,
      notes: notes || null,
    },
  };
}

async function readJson(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { error: "Please submit a valid JSON object." };
    }

    return { body: body as Record<string, unknown> };
  } catch {
    return { error: "Please submit valid JSON data." };
  }
}

// GET /api/admin/staff — list staff records
export async function GET() {
  try {
    const auth = await getAdminSupabase();
    if ("error" in auth) return auth.error;

    const { data, error } = await auth.supabase
      .from("staff_members")
      .select(STAFF_COLUMNS)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Staff list query failed:", error.code, error.message);
      return jsonError("Unable to load staff records. Check database permissions.", 500);
    }

    return NextResponse.json(
      { success: true, staff: data ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Staff list error:", error);
    return jsonError("An unexpected server error occurred.", 500);
  }
}

// POST /api/admin/staff — register a staff member
export async function POST(request: NextRequest) {
  try {
    const auth = await getAdminSupabase();
    if ("error" in auth) return auth.error;

    const parsed = await readJson(request);
    if (!parsed.body) {
      return jsonError(parsed.error ?? "Invalid request body.", 400);
    }

    const validated = parseStaffBody(parsed.body);
    if (!validated.data) {
      return jsonError(validated.error ?? "Invalid staff details.", 400);
    }

    const { data, error } = await auth.supabase
      .from("staff_members")
      .insert(validated.data)
      .select(STAFF_COLUMNS)
      .single();

    if (error) {
      console.error("Staff insert failed:", error.code, error.message);

      if (error.code === "23505") {
        return jsonError("That staff number already exists. Choose another.", 409);
      }

      if (error.code === "42501") {
        return jsonError("Database security policy does not permit this operation.", 403);
      }

      return jsonError("Staff registration failed. Check database columns and permissions.", 500);
    }

    return NextResponse.json(
      { success: true, message: "Staff member registered successfully.", staff: data },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Staff registration error:", error);
    return jsonError("An unexpected server error occurred.", 500);
  }
}

// PATCH /api/admin/staff — edit details or change status
export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAdminSupabase();
    if ("error" in auth) return auth.error;

    const parsed = await readJson(request);
    if (!parsed.body) {
      return jsonError(parsed.error ?? "Invalid request body.", 400);
    }

    const body = parsed.body;
    const id = typeof body.id === "string" ? body.id.trim() : "";

    if (!id || id.length > 100) {
      return jsonError("A valid staff record ID is required.", 400);
    }

    const update: Record<string, unknown> = {};

    // Status-only requests come from the Activate/Deactivate button.
    if (Object.keys(body).length === 2 && "status" in body) {
      const status =
        typeof body.status === "string"
          ? body.status.trim().toLowerCase()
          : "";

      if (!(ALLOWED_STATUSES as readonly string[]).includes(status)) {
        return jsonError("Invalid staff status.", 400);
      }

      update.status = status;
    } else {
      const validated = parseStaffBody(body);

      if (!validated.data) {
        return jsonError(validated.error ?? "Invalid staff details.", 400);
      }

      Object.assign(update, validated.data);
    }

    update.updated_at = new Date().toISOString();

    const { data, error } = await auth.supabase
      .from("staff_members")
      .update(update)
      .eq("id", id)
      .select(STAFF_COLUMNS)
      .maybeSingle();

    if (error) {
      console.error("Staff update failed:", error.code, error.message);

      if (error.code === "23505") {
        return jsonError("That staff number already exists. Choose another.", 409);
      }

      if (error.code === "42501") {
        return jsonError("Database security policy does not permit this operation.", 403);
      }

      return jsonError("Staff update failed. Check database columns and permissions.", 500);
    }

    if (!data) {
      return jsonError("Staff record was not found or cannot be updated.", 404);
    }

    return NextResponse.json(
      { success: true, message: "Staff record updated successfully.", staff: data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Staff update error:", error);
    return jsonError("An unexpected server error occurred.", 500);
  }
}
