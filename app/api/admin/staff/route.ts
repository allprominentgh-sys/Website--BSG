
import { NextRequest, NextResponse } from "next/server";
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEPARTMENT_PREFIXES: Record<string, string> = {
  "Customer Support Centre": "SUP",
  "Marketing Team": "MKT",
  Advertisers: "ADV",
  "Company Drivers": "DRV",
  "Sales Team": "SAL",
  "Delivery Team": "DEL",
  Operations: "OPS",
  Finance: "FIN",
  "IT & Technical": "IT",
  Management: "MGT",
  Other: "OTH",
};

const ALLOWED_STATUSES = ["active", "inactive", "suspended"];

const STAFF_FIELDS = [
  "staff_number",
  "full_name",
  "department",
  "job_title",
  "phone",
  "email",
  "start_date",
  "status",
  "notes",
] as const;

type StaffData = {
  staff_number: string;
  full_name: string;
  department: string;
  job_title: string;
  phone: string | null;
  email: string | null;
  start_date: string | null;
  status: string;
  notes: string | null;
  updated_at: string;
};

type ValidationResult =
  | { data: StaffData }
  | { error: string };

type AdminContext =
  | {
      db: SupabaseClient<any, "public", any, any>;
      user: { id: string };
    }
  | {
      error: string;
      status: 401 | 403;
    };

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();
  return cleaned || null;
}

async function getAdminContext(
  request: NextRequest
): Promise<AdminContext> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    throw new Error("SERVER_CONFIGURATION");
  }

  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    return {
      error: "Please sign in to continue.",
      status: 401,
    };
  }

  const authClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser(token);

  if (authError || !user) {
    return {
      error: "Your session is invalid or expired. Please sign in again.",
      status: 401,
    };
  }

  const db: SupabaseClient<any, "public", any, any> =
    createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Staff admin permission lookup failed:",
      profileError.message
    );
    throw new Error("PROFILE_LOOKUP");
  }

  const role = String(profile?.account_type ?? "")
    .trim()
    .toLowerCase();

  if (!["admin", "administrator"].includes(role)) {
    return {
      error: "Administrator access is required.",
      status: 403,
    };
  }

  return { db, user };
}

function isAuthError(
  value: AdminContext
): value is { error: string; status: 401 | 403 } {
  return "error" in value;
}

function buildStaffNumber(department: string): string {
  const prefix = DEPARTMENT_PREFIXES[department] || "OTH";

  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const suffix = randomUUID()
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase();

  return `BSG-${prefix}-${date}-${suffix}`;
}

function validateStaff(
  body: Record<string, unknown>
): ValidationResult {
  const fullName = cleanText(body.full_name);
  const department = cleanText(body.department);
  const jobTitle = cleanText(body.job_title);
  const staffNumber = cleanText(body.staff_number);
  const status = cleanText(body.status) || "active";
  const phone = cleanText(body.phone);
  const email = cleanText(body.email);
  const notes = cleanText(body.notes);
  const startDate = cleanText(body.start_date);

  if (!fullName || !department || !jobTitle) {
    return {
      error: "Full name, department and job title are required.",
    };
  }

  if (fullName.length > 150 || jobTitle.length > 150) {
    return {
      error: "Name and job title must be 150 characters or fewer.",
    };
  }

  if (department.length > 100) {
    return { error: "Department name is too long." };
  }

  if (staffNumber && staffNumber.length > 60) {
    return {
      error: "Staff number must be 60 characters or fewer.",
    };
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return { error: "Invalid staff status." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  if (phone && phone.length > 40) {
    return { error: "Phone number is too long." };
  }

  if (notes && notes.length > 5000) {
    return {
      error: "Notes must be 5000 characters or fewer.",
    };
  }

  if (
    startDate &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      Number.isNaN(Date.parse(`${startDate}T00:00:00Z`)) ||
      new Date(`${startDate}T00:00:00Z`)
        .toISOString()
        .slice(0, 10) !== startDate)
  ) {
    return { error: "Enter a valid start date." };
  }

  return {
    data: {
      staff_number:
        staffNumber?.toUpperCase() ||
        buildStaffNumber(department),
      full_name: fullName,
      department,
      job_title: jobTitle,
      phone,
      email,
      start_date: startDate,
      status,
      notes,
      updated_at: new Date().toISOString(),
    },
  };
}

function isValidationError(
  result: ValidationResult
): result is { error: string } {
  return "error" in result;
}

export async function GET(request: NextRequest) {
  try {
    const context = await getAdminContext(request);

    if (isAuthError(context)) {
      return jsonError(context.error, context.status);
    }

    const { data: staff, error } = await context.db
      .from("staff_members")
      .select(
        "id, staff_number, full_name, department, job_title, phone, email, start_date, status, notes, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Staff loading failed:", error.message);
      return jsonError("Unable to load staff records.", 500);
    }

    return NextResponse.json(
      { success: true, staff: staff ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Staff GET failed:", error);

    return jsonError(
      error instanceof Error &&
        error.message === "SERVER_CONFIGURATION"
        ? "Server configuration is incomplete."
        : "Unable to load staff records.",
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getAdminContext(request);

    if (isAuthError(context)) {
      return jsonError(context.error, context.status);
    }

    let body: Record<string, unknown>;

    try {
      const parsed: unknown = await request.json();

      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        return jsonError("Invalid request body.", 400);
      }

      body = parsed as Record<string, unknown>;
    } catch {
      return jsonError("Invalid request body.", 400);
    }

    const validated = validateStaff(body);

    if (isValidationError(validated)) {
      return jsonError(validated.error, 400);
    }

    const { data: existing, error: duplicateError } =
      await context.db
        .from("staff_members")
        .select("id")
        .eq("staff_number", validated.data.staff_number)
        .maybeSingle();

    if (duplicateError) {
      console.error(
        "Staff duplicate check failed:",
        duplicateError.message
      );
      return jsonError("Unable to verify staff number.", 500);
    }

    if (existing) {
      return jsonError(
        "That staff number already exists. Generate another number.",
        409
      );
    }

    const { data: staff, error } = await context.db
      .from("staff_members")
      .insert(validated.data)
      .select(
        "id, staff_number, full_name, department, job_title, phone, email, start_date, status, notes, created_at, updated_at"
      )
      .single();

    if (error) {
      console.error("Staff registration failed:", error.message);

      if (error.code === "23505") {
        return jsonError(
          "That staff number already exists. Generate another number.",
          409
        );
      }

      return jsonError("Unable to register staff member.", 500);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Staff member registered successfully.",
        staff,
      },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Staff POST failed:", error);

    return jsonError(
      error instanceof Error &&
        error.message === "SERVER_CONFIGURATION"
        ? "Server configuration is incomplete."
        : "Unable to register staff member.",
      500
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const context = await getAdminContext(request);

    if (isAuthError(context)) {
      return jsonError(context.error, context.status);
    }

    let body: Record<string, unknown>;

    try {
      const parsed: unknown = await request.json();

      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        return jsonError("Invalid request body.", 400);
      }

      body = parsed as Record<string, unknown>;
    } catch {
      return jsonError("Invalid request body.", 400);
    }

    const id = cleanText(body.id);

    if (
      !id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return jsonError(
        "A valid staff record ID is required.",
        400
      );
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (
      Object.keys(body).length === 2 &&
      "status" in body &&
      "id" in body
    ) {
      const status = cleanText(body.status);

      if (!status || !ALLOWED_STATUSES.includes(status)) {
        return jsonError("Invalid staff status.", 400);
      }

      updates.status = status;
    } else {
      const validated = validateStaff(body);

      if (isValidationError(validated)) {
        return jsonError(validated.error, 400);
      }

      for (const field of STAFF_FIELDS) {
        updates[field] = validated.data[field];
      }
    }

    if (typeof updates.staff_number === "string") {
      const { data: duplicate, error: duplicateError } =
        await context.db
          .from("staff_members")
          .select("id")
          .eq("staff_number", updates.staff_number)
          .neq("id", id)
          .maybeSingle();

      if (duplicateError) {
        console.error(
          "Staff number check failed:",
          duplicateError.message
        );
        return jsonError("Unable to verify staff number.", 500);
      }

      if (duplicate) {
        return jsonError(
          "That staff number belongs to another employee.",
          409
        );
      }
    }

    const { data: staff, error } = await context.db
      .from("staff_members")
      .update(updates)
      .eq("id", id)
      .select(
        "id, staff_number, full_name, department, job_title, phone, email, start_date, status, notes, created_at, updated_at"
      )
      .maybeSingle();

    if (error) {
      console.error("Staff update failed:", error.message);

      if (error.code === "23505") {
        return jsonError(
          "That staff number already exists.",
          409
        );
      }

      return jsonError("Unable to update staff record.", 500);
    }

    if (!staff) {
      return jsonError("Staff record not found.", 404);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Staff record updated successfully.",
        staff,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Staff PATCH failed:", error);

    return jsonError(
      error instanceof Error &&
        error.message === "SERVER_CONFIGURATION"
        ? "Server configuration is incomplete."
        : "Unable to update staff record.",
      500
    );
  }
}
