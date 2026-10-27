
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "admin@bestsalesgh.com";
const COOKIE_NAME = "bsg_admin_session";

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

function verifyAdminSession(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const cookie = request.cookies.get(COOKIE_NAME)?.value;

  if (!secret || !cookie) return false;

  try {
    const parts = cookie.split(".");
    if (parts.length !== 2) return false;

    const [payload, suppliedSignature] = parts;
    if (!payload || !suppliedSignature) return false;

    const expectedSignature = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const supplied = Buffer.from(suppliedSignature, "utf8");
    const expected = Buffer.from(expectedSignature, "utf8");

    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      return false;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { email?: string; expiresAt?: number };

    return (
      session.email === ADMIN_EMAIL &&
      typeof session.expiresAt === "number" &&
      Number.isFinite(session.expiresAt) &&
      session.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

function getAdminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase server configuration is incomplete.");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return jsonError("Administrator session is invalid or expired.", 401);
  }

  try {
    const db = getAdminDb();
    const requestedStatus = request.nextUrl.searchParams.get("status");

    let query = db
      .from("bsg_delivery_personnel")
      .select(
        "user_id, full_name, phone, licence_number, personnel_type, vehicle_type, vehicle_model, vehicle_registration_number, carrying_capacity_kg, application_status, admin_notes, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (
      requestedStatus &&
      ["pending", "approved", "rejected", "suspended"].includes(
        requestedStatus
      )
    ) {
      query = query.eq("application_status", requestedStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Delivery application query failed:", error.message);
      return jsonError("Could not load delivery applications.", 500);
    }

    return NextResponse.json(
      { applications: data ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Delivery applications GET failed:", error);
    return jsonError("Server configuration or database error.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return jsonError("Administrator session is invalid or expired.", 401);
  }

  try {
    let body: {
      userId?: string;
      decision?: string;
      adminNotes?: string;
    };

    try {
      body = await request.json();
    } catch {
      return jsonError("A valid JSON request body is required.", 400);
    }

    const userId =
      typeof body.userId === "string" ? body.userId.trim() : "";
    const decision =
      typeof body.decision === "string" ? body.decision : "";

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        userId
      )
    ) {
      return jsonError("A valid applicant user ID is required.", 400);
    }

    const statuses: Record<string, string> = {
      approve: "approved",
      reject: "rejected",
      suspend: "suspended",
    };

    const newStatus = statuses[decision];

    if (!newStatus) {
      return jsonError(
        "Decision must be approve, reject, or suspend.",
        400
      );
    }

    const adminNotes =
      typeof body.adminNotes === "string"
        ? body.adminNotes.trim().slice(0, 1000) || null
        : null;

    const db = getAdminDb();

    const { data: applicant, error: findError } = await db
      .from("bsg_delivery_personnel")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (findError) {
      console.error("Applicant lookup failed:", findError.message);
      return jsonError("Could not verify the applicant.", 500);
    }

    if (!applicant) {
      return jsonError("Delivery application not found.", 404);
    }

    const { data: updated, error: updateError } = await db
      .from("bsg_delivery_personnel")
      .update({
        application_status: newStatus,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select(
        "user_id, full_name, personnel_type, vehicle_type, vehicle_registration_number, application_status, admin_notes, updated_at"
      )
      .single();

    if (updateError) {
      console.error("Application update failed:", updateError.message);
      return jsonError("Could not update the application.", 500);
    }

    return NextResponse.json({
      message: `Application status changed to ${newStatus}.`,
      application: updated,
    });
  } catch (error) {
    console.error("Delivery application PATCH failed:", error);
    return jsonError("Unexpected server error.", 500);
  }
}
