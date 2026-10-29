
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "admin@bestsalesgh.com";
const COOKIE_NAME = "bsg_admin_session";

const ALLOWED_STATUSES = ["active", "inactive", "suspended"] as const;

const STAFF_COLUMNS =
  "id, staff_number, full_name, department, job_title, phone, email, start_date, status, notes, created_at, updated_at";

type StaffStatus = (typeof ALLOWED_STATUSES)[number];

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

function verifyAdminSession(token: string, secret: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;

  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    return (
      session.email === ADMIN_EMAIL &&
      typeof session.expiresAt === "number" &&
      session.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

function getDatabase(request: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || !url || !serviceKey) {
    return {
      error: jsonError("Server configuration is incomplete.", 500),
    };
  }

  if (!token || !verifyAdminSession(token, secret)) {
    return {
      error: jsonError(
        "Administrator session is missing or expired. Sign in again.",
        401
      ),
    };
  }

  const db = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return { db };
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

  if (!full_name || !department || !job_title || !staff_number) {
    return {
      error:
        "Full name, department, job title and staff number are required.",
    };
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

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  if (!(ALLOWED_STATUSES as readonly string[]).includes(status)) {
    return {
      error: "Status must be active, inactive or suspended.",
    };
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

export async function GET(request: NextRequest) {
  try {
    const auth = getDatabase(request);
    if ("error" in auth) return auth.error;

    const { data, error } = await auth.db
      .from("staff_members")
      .select(STAFF_COLUMNS)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Staff list query failed:", error.code, error.message);
      return jsonError("Unable to load staff records.", 500);
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

export async function POST(request: NextRequest) {
  try {
    const auth = getDatabase(request);
    if ("error" in auth) return auth.error;

    const parsed = await readJson(request);
    if (!parsed.body) {
      return jsonError(parsed.error ?? "Invalid request body.", 400);
    }

    const validated = parseStaffBody(parsed.body);
    if (!validated.data) {
      return jsonError(validated.error ?? "Invalid staff details.", 400);
    }

    const { data, error } = await auth.db
      .from("staff_members")
      .insert(validated.data)
      .select(STAFF_COLUMNS)
      .single();

    if (error) {
      console.error("Staff insert failed:", error.code, error.message);

      if (error.code === "23505") {
        return jsonError("That staff number already exists.", 409);
      }

      return jsonError("Staff registration failed.", 500);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Staff member registered successfully.",
        staff: data,
      },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Staff registration error:", error);
    return jsonError("An unexpected server error occurred.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = getDatabase(request);
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

    const { data, error } = await auth.db
      .from("staff_members")
      .update(update)
      .eq("id", id)
      .select(STAFF_COLUMNS)
      .maybeSingle();

    if (error) {
      console.error("Staff update failed:", error.code, error.message);

      if (error.code === "23505") {
        return jsonError("That staff number already exists.", 409);
      }

      return jsonError("Staff update failed.", 500);
    }

    if (!data) {
      return jsonError("Staff record was not found.", 404);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Staff record updated successfully.",
        staff: data,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Staff update error:", error);
    return jsonError("An unexpected server error occurred.", 500);
  }
}
