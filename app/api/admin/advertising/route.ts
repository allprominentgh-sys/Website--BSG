
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const ALLOWED_SETTINGS = {
  individual_premium_price: { min: 0, max: 1000000 },
  individual_priority_price: { min: 0, max: 1000000 },
  individual_top_priority_price: { min: 0, max: 1000000 },
  company_top_priority_monthly_price: { min: 0, max: 1000000 },
  business_transaction_fee_percent: { min: 0, max: 100 },
  individual_free_ads_limit: { min: 0, max: 10000, integer: true },
  company_free_ads_limit: { min: 0, max: 10000, integer: true },
  company_priority_ads_limit: { min: 0, max: 10000, integer: true },
  promotion_duration_days: { min: 1, max: 3650, integer: true },
} as const;

type SettingKey = keyof typeof ALLOWED_SETTINGS;

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

function isValidAdminSession(request: NextRequest): boolean {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET;
    const token = request.cookies.get("bsg_admin_session")?.value;

    if (!secret || !token) return false;

    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [payload, signature] = parts;
    if (!payload || !signature) return false;

    const expectedSignature = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return false;
    }

    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    return (
      decoded.email === "admin@bestsalesgh.com" &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

function getSupabaseAdmin() {
  const url =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Server Supabase configuration is missing.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function normalizeSettings(rows: { setting_key: string; setting_value: number | string }[]) {
  const settings: Record<string, number> = {};

  for (const row of rows) {
    if (row.setting_key in ALLOWED_SETTINGS) {
      settings[row.setting_key] = Number(row.setting_value);
    }
  }

  return settings;
}

export async function GET(request: NextRequest) {
  if (!isValidAdminSession(request)) {
    return jsonError("Unauthorized. Please sign in again.", 401);
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("advertising_settings")
      .select("setting_key, setting_value")
      .order("setting_key");

    if (error) {
      console.error("Advertising settings read failed:", error.message);
      return jsonError("Could not load advertising settings.", 500);
    }

    return NextResponse.json(
      {
        success: true,
        settings: normalizeSettings(data ?? []),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(
      "Advertising settings configuration error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return jsonError("Advertising settings are not configured correctly.", 500);
  }
}

export async function PUT(request: NextRequest) {
  if (!isValidAdminSession(request)) {
    return jsonError("Unauthorized. Please sign in again.", 401);
  }

  let body: { settings?: Record<string, unknown> };

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON request.", 400);
  }

  if (
    !body.settings ||
    typeof body.settings !== "object" ||
    Array.isArray(body.settings)
  ) {
    return jsonError("A settings object is required.", 400);
  }

  const submitted = body.settings;
  const rows: {
    setting_key: SettingKey;
    setting_value: number;
    updated_at: string;
  }[] = [];

  for (const key of Object.keys(ALLOWED_SETTINGS) as SettingKey[]) {
    if (!(key in submitted)) {
      return jsonError(`Missing setting: ${key}`, 400);
    }

    const value = submitted[key];
    const rule = ALLOWED_SETTINGS[key];

    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < rule.min ||
      value > rule.max ||
      ("integer" in rule && rule.integer && !Number.isInteger(value))
    ) {
      return jsonError(`Invalid value for ${key}.`, 400);
    }

    rows.push({
      setting_key: key,
      setting_value: value,
      updated_at: new Date().toISOString(),
    });
  }

  // Reject unexpected settings instead of silently accepting them.
  const allowedKeys = new Set(Object.keys(ALLOWED_SETTINGS));
  const unexpectedKeys = Object.keys(submitted).filter(
    (key) => !allowedKeys.has(key)
  );

  if (unexpectedKeys.length > 0) {
    return jsonError("The request contains unsupported settings.", 400);
  }

  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("advertising_settings")
      .upsert(rows, { onConflict: "setting_key" });

    if (error) {
      console.error("Advertising settings save failed:", error.message);
      return jsonError("Could not save advertising settings.", 500);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Advertising settings saved successfully.",
        settings: Object.fromEntries(
          rows.map((row) => [row.setting_key, row.setting_value])
        ),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(
      "Advertising settings configuration error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return jsonError("Advertising settings are not configured correctly.", 500);
  }
}
