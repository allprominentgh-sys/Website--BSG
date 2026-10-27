
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  createHmac,
  timingSafeEqual,
} from "crypto";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "admin@bestsalesgh.com";
const COOKIE_NAME = "bsg_admin_session";

type AdminSession = {
  email: string;
  expiresAt: number;
};

type PersonnelDecision = "approve" | "reject" | "suspend";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Server database configuration is missing.");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/*
 * Expected cookie format:
 * base64url(JSON session payload).hex HMAC-SHA256 signature
 *
 * The payload must contain email and expiresAt, matching the
 * existing BSG admin session implementation.
 */
function verifyAdminSession(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const cookie = request.cookies.get(COOKIE_NAME)?.value;

  if (!secret || !cookie) return false;

  const parts = cookie.split(".");
  if (parts.length !== 2) return false;

  const [encodedPayload, suppliedSignature] = parts;

  if (!encodedPayload || !/^[a-f0-9]{64}$/i.test(suppliedSignature)) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(encodedPayload)
    .digest();

  const suppliedBuffer = Buffer.from(suppliedSignature, "hex");

  if (
    suppliedBuffer.length !== expectedSignature.length ||
    !timingSafeEqual(expectedSignature, suppliedBuffer)
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as AdminSession;

    return (
      typeof payload.email === "string" &&
      payload.email.toLowerCase() === ADMIN_EMAIL &&
      typeof payload.expiresAt === "number" &&
      payload.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

function unauthorized() {
  return NextResponse.json(
    { error: "Administrator authentication required." },
    { status: 401 }
  );
}

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request)) return unauthorized();

  try {
    const supabase = getSupabaseAdmin();
    const status = request.nextUrl.searchParams.get("status");

    let query = supabase
      .from("bsg_delivery_personnel")
      .select(
        "user_id, full_name, phone, licence_number, personnel_type, vehicle_type, vehicle_model, vehicle_registration_number, carrying_capacity_kg, application_status, admin_notes, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (
      status &&
      ["pending", "approved", "rejected", "suspended"].includes(status)
    ) {
      query = query.eq("application_status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Load delivery personnel failed:", error.message);
      return NextResponse.json(
        { error: "Unable to load delivery applications." },
        { status: 500 }
      );
    }

    return NextResponse.json({ applications: data ?? [] });
  } catch (error) {
    console.error("Delivery personnel GET failed:", error);
    return NextResponse.json(
      { error: "Server configuration or database error." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdminSession(request)) return unauthorized();

  try {
    const body = await request.json();

    const userId =
      typeof body.userId === "string" ? body.userId : "";

    const decision =
      typeof body.decision === "string" ? body.decision : "";

    const adminNotes =
      typeof body.adminNotes === "string"
        ? body.adminNotes.trim().slice(0, 1000)
        : null;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        userId
      )
    ) {
      return NextResponse.json(
        { error: "A valid applicant user ID is required." },
        { status: 400 }
      );
    }

    if (
      !["approve", "reject", "suspend"].includes(decision)
    ) {
      return NextResponse.json(
        { error: "Decision must be approve, reject or suspend." },
        { status: 400 }
      );
    }

    const statusByDecision: Record<PersonnelDecision, string> = {
      approve: "approved",
      reject: "rejected",
      suspend: "suspended",
    };

    const supabase = getSupabaseAdmin();

    const { data: applicant, error: findError } = await supabase
      .from("bsg_delivery_personnel")
      .select("user_id, application_status")
      .eq("user_id", userId)
      .maybeSingle();

    if (findError) {
      console.error("Find applicant failed:", findError.message);
      return NextResponse.json(
        { error: "Unable to verify the applicant." },
        { status: 500 }
      );
    }

    if (!applicant) {
      return NextResponse.json(
        { error: "Delivery personnel application not found." },
        { status: 404 }
      );
    }

    if (
      decision === "approve" &&
      applicant.application_status === "suspended"
    ) {
      return NextResponse.json(
        { error: "A suspended account cannot be approved through this action." },
        { status: 409 }
      );
    }

    const newStatus = statusByDecision[decision as PersonnelDecision];

    const { data: updated, error: updateError } = await supabase
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
      console.error("Update application failed:", updateError.message);
      return NextResponse.json(
        { error: "Unable to update the application." },
        { status: 500 }
      );
    }

    /*
     * This updates the separate application record only.
     * Delivery assignment and GPS APIs must also check this
     * approved status before allowing work.
     */
    return NextResponse.json({
      message: `Application status changed to ${newStatus}.`,
      application: updated,
    });
  } catch (error) {
    console.error("Delivery personnel PATCH failed:", error);
    return NextResponse.json(
      { error: "Invalid request or server error." },
      { status: 500 }
    );
  }
}
