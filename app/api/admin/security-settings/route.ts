import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "bsg_admin_session";
const ADMIN_EMAIL = "admin@bestsalesgh.com";
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

type SecuritySettings = {
  id: number;
  idle_timeout_minutes: number;
  warning_minutes: number;
  apply_to_all_staff: boolean;
  allow_remember_me_extension: boolean;
  updated_at: string;
  updated_by: string | null;
};

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function unauthorized() {
  return jsonResponse(
    { success: false, message: "Administrator access required." },
    401
  );
}

function verifyAdminSession(value: string | undefined): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!value || !secret || value.length > 8192) return false;

  const separator = value.lastIndexOf(".");
  if (separator <= 0 || separator === value.length - 1) return false;

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);

  try {
    const expected = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(signature);

    if (
      expectedBuffer.length !== actualBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return false;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    const now = Date.now();

    return (
      session.email === ADMIN_EMAIL &&
      typeof session.expiresAt === "number" &&
      Number.isFinite(session.expiresAt) &&
      session.expiresAt > now &&
      typeof session.lastActivityAt === "number" &&
      Number.isFinite(session.lastActivityAt) &&
      session.lastActivityAt <= now &&
      now - session.lastActivityAt < IDLE_TIMEOUT_MS
    );
  } catch {
    return false;
  }
}

function getSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Required Supabase server configuration is missing.");
  }

  return {
    url: url.replace(/\/+$/, ""),
    key,
  };
}

async function supabaseRequest(
  method: "GET" | "PATCH",
  body?: Record<string, unknown>
): Promise<SecuritySettings[]> {
  const { url, key } = getSupabaseConfig();

  const response = await fetch(
    `${url}/rest/v1/staff_session_settings?id=eq.1&select=*`,
    {
      method,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    // Keep database response details in server logs, not the public response.
    console.error(
      `Security settings database request failed: HTTP ${response.status}`
    );
    throw new Error("Security settings database request failed.");
  }

  const result: unknown = await response.json();

  if (!Array.isArray(result)) {
    throw new Error("Unexpected security settings database response.");
  }

  return result as SecuritySettings[];
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
        {
          success: false,
          message:
            "Security settings have not been initialized. Check that staff_session_settings contains a row with id 1.",
        },
        500
      );
    }

    return jsonResponse({ success: true, settings });
  } catch (error) {
    console.error(
      "SECURITY SETTINGS GET ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return jsonResponse(
      {
        success: false,
        message:
          "Unable to load security settings. Check the server logs and Supabase configuration.",
      },
      500
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(COOKIE_NAME)?.value)) {
    return unauthorized();
  }

  let body: Record<string, unknown>;

  try {
    const parsed: unknown = await request.json();

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return jsonResponse(
        { success: false, message: "Invalid settings request." },
        400
      );
    }

    body = parsed as Record<string, unknown>;
  } catch {
    return jsonResponse(
      { success: false, message: "Invalid JSON request." },
      400
    );
  }

  const idle = Number(body.idle_timeout_minutes);
  const warning = Number(body.warning_minutes);
  const applyToAll = body.apply_to_all_staff;
  const allowRemember = body.allow_remember_me_extension;

  if (
    !Number.isInteger(idle) ||
    idle !== 15 ||
    !Number.isInteger(warning) ||
    warning < 0 ||
    warning >= idle ||
    typeof applyToAll !== "boolean" ||
    applyToAll !== true ||
    typeof allowRemember !== "boolean" ||
    allowRemember !== false
  ) {
    return jsonResponse(
      {
        success: false,
        message:
          "Required policy: 15-minute inactivity timeout, applied to all staff, with no inactivity bypass. The warning must be shorter than the timeout.",
      },
      400
    );
  }

  try {
    const rows = await supabaseRequest("PATCH", {
      idle_timeout_minutes: 15,
      warning_minutes: warning,
      apply_to_all_staff: true,
      allow_remember_me_extension: false,
      updated_at: new Date().toISOString(),
      updated_by: ADMIN_EMAIL,
    });

    if (!rows[0]) {
      return jsonResponse(
        {
          success: false,
          message:
            "No security settings row was updated. Check that row id 1 exists.",
        },
        500
      );
    }

    return jsonResponse({ success: true, settings: rows[0] });
  } catch (error) {
    console.error(
      "SECURITY SETTINGS PATCH ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return jsonResponse(
      {
        success: false,
        message: "Unable to save security settings. Check the server logs.",
      },
      500
    );
  }
}
