
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "bsg_admin_session";
const ADMIN_EMAIL = "admin@bestsalesgh.com";

type SecuritySettings = {
  id: number;
  idle_timeout_minutes: number;
  warning_minutes: number;
  apply_to_all_staff: boolean;
  allow_remember_me_extension: boolean;
  updated_at: string;
  updated_by: string | null;
};

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Administrator access required." },
    { status: 401, headers: { "Cache-Control": "no-store" } }
  );
}

function verifyAdminSession(value: string | undefined): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!value || !secret) return false;

  const parts = value.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;

  try {
    const expected = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return false;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (
      session.email !== ADMIN_EMAIL ||
      typeof session.expiresAt !== "number" ||
      session.expiresAt <= Date.now()
    ) {
      return false;
    }

    // Older sessions without lastActivityAt must sign in again.
    if (
      typeof session.lastActivityAt !== "number" ||
      Date.now() - session.lastActivityAt >= 15 * 60 * 1000
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Server Supabase environment variables are missing.");
  }

  return {
    url: url.replace(/\/$/, ""),
    key,
  };
}

async function supabaseRequest(
  method: "GET" | "PATCH",
  body?: Record<string, unknown>
) {
  const { url, key } = getSupabaseConfig();

  const response = await fetch(
    `${url}/rest/v1/staff_session_settings?id=eq.1&select=*`,
    {
      method,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: method === "PATCH" ? "return=representation" : "return=representation",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase request failed (${response.status}).`);
  }

  return response.json() as Promise<SecuritySettings[]>;
}

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(COOKIE_NAME)?.value)) {
    return unauthorized();
  }

  try {
    const rows = await supabaseRequest("GET");
    const settings = rows[0];

    if (!settings) {
      return jsonResponse(
        { success: false, message: "Security settings have not been initialized." },
        500
      );
    }

    return jsonResponse({ success: true, settings });
  } catch (error) {
    console.error("SECURITY SETTINGS GET ERROR:", error);
    return jsonResponse(
      { success: false, message: "Unable to load security settings." },
      500
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(COOKIE_NAME)?.value)) {
    return unauthorized();
  }

  try {
    const body = await request.json();

    const idle = Number(body.idle_timeout_minutes);
    const warning = Number(body.warning_minutes);
    const applyToAll = body.apply_to_all_staff;
    const allowRemember = body.allow_remember_me_extension;

    if (
      !Number.isInteger(idle) ||
      idle < 5 ||
      idle > 60 ||
      !Number.isInteger(warning) ||
      warning < 0 ||
      warning >= idle ||
      typeof applyToAll !== "boolean" ||
      typeof allowRemember !== "boolean"
    ) {
      return jsonResponse(
        { success: false, message: "Invalid security settings." },
        400
      );
    }

    // This application requires the 15-minute policy for all staff.
    // "Keep me signed in" must never override inactivity logout.
    if (idle !== 15 || applyToAll !== true || allowRemember !== false) {
      return jsonResponse(
        {
          success: false,
          message:
            "The required policy is 15 minutes, applied to all staff, with no inactivity bypass.",
        },
        400
      );
    }

    const rows = await supabaseRequest("PATCH", {
      idle_timeout_minutes: idle,
      warning_minutes: warning,
      apply_to_all_staff: applyToAll,
      allow_remember_me_extension: false,
      updated_at: new Date().toISOString(),
      updated_by: ADMIN_EMAIL,
    });

    if (!rows[0]) {
      return jsonResponse(
        { success: false, message: "No settings row was updated." },
        500
      );
    }

    return jsonResponse({ success: true, settings: rows[0] });
  } catch (error) {
    console.error("SECURITY SETTINGS UPDATE ERROR:", error);
    return jsonResponse(
      { success: false, message: "Unable to save security settings." },
      500
    );
  }
}
