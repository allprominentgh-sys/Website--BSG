
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ADMIN_EMAIL = "admin@bestsalesgh.com";
const COOKIE_NAME = "bsg_admin_session";

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function verifyAdminToken(token: string, secret: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [payload, signature] = parts;

    if (!payload || !signature) return false;

    const expectedSignature = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const supplied = Buffer.from(signature, "utf8");
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

async function getAdminClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!url || !serviceKey || !sessionSecret) {
    return {
      ok: false as const,
      status: 500,
      message: "Server configuration is incomplete.",
    };
  }

  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token || !verifyAdminToken(token, sessionSecret)) {
    return {
      ok: false as const,
      status: 401,
      message: "Administrator session is invalid or expired.",
    };
  }

  return {
    ok: true as const,
    db: createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }),
  };
}

// List rider applications.
export async function GET() {
  try {
    const context = await getAdminClient();

    if (!context.ok) {
      return jsonError(context.message, context.status);
    }

    const { data, error } = await context.db
      .from("profiles")
      .select(
        "id, full_name, phone, account_type, verified, verification_status, created_at"
      )
      .eq("account_type", "rider")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Rider application lookup failed:", error.message);
      return jsonError("Could not load rider applications.", 500);
    }

    return NextResponse.json(
      { success: true, applications: data ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Rider application GET error:", error);
    return jsonError("Unexpected server error.", 500);
  }
}

// Approve or reject a rider application.
export async function PATCH(request: NextRequest) {
  try {
    const context = await getAdminClient();

    if (!context.ok) {
      return jsonError(context.message, context.status);
    }

    let body: {
      riderId?: unknown;
      decision?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return jsonError("A valid JSON request body is required.", 400);
    }

    const riderId =
      typeof body.riderId === "string" ? body.riderId : "";

    const decision = body.decision;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(riderId)) {
      return jsonError("A valid rider ID is required.", 400);
    }

    if (decision !== "approve" && decision !== "reject") {
      return jsonError(
        "Decision must be approve or reject.",
        400
      );
    }

    const { data: rider, error: lookupError } = await context.db
      .from("profiles")
      .select("id, account_type, verification_status")
      .eq("id", riderId)
      .maybeSingle();

    if (lookupError) {
      console.error("Rider lookup failed:", lookupError.message);
      return jsonError("Could not verify the rider application.", 500);
    }

    if (!rider || rider.account_type !== "rider") {
      return jsonError("Rider application not found.", 404);
    }

    const newStatus =
      decision === "approve" ? "approved" : "rejected";

    const { data: updated, error: updateError } = await context.db
      .from("profiles")
      .update({
        verified: decision === "approve",
        verification_status: newStatus,
      })
      .eq("id", riderId)
      .eq("account_type", "rider")
      .select(
        "id, full_name, phone, account_type, verified, verification_status"
      )
      .single();

    if (updateError) {
      console.error("Rider approval update failed:", updateError.message);
      return jsonError("Could not update the rider application.", 500);
    }

    return NextResponse.json({
      success: true,
      application: updated,
      message:
        decision === "approve"
          ? "Rider approved. Delivery assignment access must still be enforced by the delivery API."
          : "Rider application rejected.",
    });
  } catch (error) {
    console.error("Rider approval PATCH error:", error);
    return jsonError("Unexpected server error.", 500);
  }
}
