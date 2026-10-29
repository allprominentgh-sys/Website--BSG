
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["admin", "administrator"] as const;

const BRANCH_COLUMNS =
  "id, company_id, branch_code, branch_name, location, manager_name, is_active, created_at, updated_at";

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

async function getAdminClient(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!url || !anonKey) {
    return {
      error: jsonError("Supabase configuration is missing.", 500),
    };
  }

  if (!token) {
    return {
      error: jsonError("Please sign in as an administrator.", 401),
    };
  }

  const supabase = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return {
      error: jsonError("Your session is invalid or expired. Please sign in again.", 401),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, account_type")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Branch API profile check failed:", profileError.message);
    return {
      error: jsonError("Unable to verify administrator permissions.", 500),
    };
  }

  const role = String(profile?.account_type ?? "").trim().toLowerCase();

  if (
    !profile ||
    !ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
  ) {
    return {
      error: jsonError("Administrator access required.", 403),
    };
  }

  return { supabase };
}

async function readBody(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { error: "Submit a valid JSON object." };
    }

    return { body: body as Record<string, unknown> };
  } catch {
    return { error: "Submit valid JSON data." };
  }
}

function parseBranch(body: Record<string, unknown>) {
  const company_id =
    typeof body.company_id === "string"
      ? body.company_id.trim()
      : "BSGH-HQ-0001";
  const branch_code =
    typeof body.branch_code === "string"
      ? body.branch_code.trim().toUpperCase()
      : "";
  const branch_name =
    typeof body.branch_name === "string"
      ? body.branch_name.trim()
      : "";
  const location =
    typeof body.location === "string" ? body.location.trim() : "";
  const manager_name =
    typeof body.manager_name === "string"
      ? body.manager_name.trim()
      : "";

  if (!company_id || !branch_code || !branch_name || !location) {
    return {
      error: "Company ID, branch code, branch name and location are required.",
    };
  }

  if (
    company_id.length > 100 ||
    branch_code.length > 50 ||
    branch_name.length > 150 ||
    location.length > 250 ||
    manager_name.length > 150
  ) {
    return { error: "One or more fields are too long." };
  }

  return {
    data: {
      company_id,
      branch_code,
      branch_name,
      location,
      manager_name: manager_name || null,
    },
  };
}

// GET: list branches
export async function GET(request: NextRequest) {
  try {
    const auth = await getAdminClient(request);
    if ("error" in auth) return auth.error;

    const { data, error } = await auth.supabase
      .from("company_branches")
      .select(BRANCH_COLUMNS)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Branch list failed:", error.code, error.message);
      return jsonError("Unable to load branches. Check database permissions.", 500);
    }

    return NextResponse.json(
      { success: true, branches: data ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Branch list error:", error);
    return jsonError("Unexpected server error.", 500);
  }
}

// POST: create a branch
export async function POST(request: NextRequest) {
  try {
    const auth = await getAdminClient(request);
    if ("error" in auth) return auth.error;

    const parsed = await readBody(request);
    if (!parsed.body) {
      return jsonError(parsed.error ?? "Invalid request body.", 400);
    }

    const validated = parseBranch(parsed.body);
    if (!validated.data) {
      return jsonError(validated.error ?? "Invalid branch details.", 400);
    }

    const { data, error } = await auth.supabase
      .from("company_branches")
      .insert({ ...validated.data, is_active: true })
      .select(BRANCH_COLUMNS)
      .single();

    if (error) {
      console.error("Branch creation failed:", error.code, error.message);

      if (error.code === "23505") {
        return jsonError("That branch code already exists.", 409);
      }

      if (error.code === "42501") {
        return jsonError("Database policy does not allow branch creation.", 403);
      }

      return jsonError("Unable to create branch. Check database permissions.", 500);
    }

    return NextResponse.json(
      { success: true, message: "Branch created successfully.", branch: data },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Branch creation error:", error);
    return jsonError("Unexpected server error.", 500);
  }
}

// PATCH: edit branch details or active status
export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAdminClient(request);
    if ("error" in auth) return auth.error;

    const parsed = await readBody(request);
    if (!parsed.body) {
      return jsonError(parsed.error ?? "Invalid request body.", 400);
    }

    const body = parsed.body;
    const id = typeof body.id === "string" ? body.id.trim() : "";

    if (!id || id.length > 100) {
      return jsonError("A valid branch ID is required.", 400);
    }

    const update: Record<string, unknown> = {};

    if (
      typeof body.is_active === "boolean" &&
      Object.keys(body).every((key) => ["id", "is_active"].includes(key))
    ) {
      update.is_active = body.is_active;
    } else {
      const validated = parseBranch(body);
      if (!validated.data) {
        return jsonError(validated.error ?? "Invalid branch details.", 400);
      }

      Object.assign(update, validated.data);

      if (typeof body.is_active === "boolean") {
        update.is_active = body.is_active;
      }
    }

    update.updated_at = new Date().toISOString();

    const { data, error } = await auth.supabase
      .from("company_branches")
      .update(update)
      .eq("id", id)
      .select(BRANCH_COLUMNS)
      .maybeSingle();

    if (error) {
      console.error("Branch update failed:", error.code, error.message);

      if (error.code === "23505") {
        return jsonError("That branch code already exists.", 409);
      }

      if (error.code === "42501") {
        return jsonError("Database policy does not allow branch updates.", 403);
      }

      return jsonError("Unable to update branch. Check database permissions.", 500);
    }

    if (!data) {
      return jsonError("Branch not found or you do not have permission to update it.", 404);
    }

    return NextResponse.json(
      { success: true, message: "Branch updated successfully.", branch: data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Branch update error:", error);
    return jsonError("Unexpected server error.", 500);
  }
}
