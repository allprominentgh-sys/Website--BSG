
import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SETTING_DESCRIPTIONS: Record<string, string> = {
  individual_premium_price: "Individual seller Premium promotion price per ad",
  individual_priority_price: "Individual seller Priority promotion price per ad",
  individual_top_priority_price: "Individual seller Top Priority promotion price per ad",
  company_top_priority_monthly_price: "Company Top Priority monthly advertising price",
  business_transaction_fee_percent: "Business transaction platform fee percentage",
  individual_free_ads_limit: "Number of free ads for individual sellers",
  company_free_ads_limit: "Number of free ads for companies",
  company_priority_ads_limit: "Company Priority advertising limit",
  promotion_duration_days: "Promotion duration in days",
};

const ALLOWED_KEYS = Object.keys(SETTING_DESCRIPTIONS);

const INTEGER_KEYS = new Set([
  "individual_free_ads_limit",
  "company_free_ads_limit",
  "company_priority_ads_limit",
  "promotion_duration_days",
]);

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
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing server-side Supabase environment variables.");
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function validateSettings(input: unknown): {
  settings?: Record<string, number>;
  error?: string;
} {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "Please provide a valid settings object." };
  }

  const source = input as Record<string, unknown>;
  const settings: Record<string, number> = {};

  for (const key of ALLOWED_KEYS) {
    const value = source[key];

    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { error: `A valid numeric value is required for ${key}.` };
    }

    if (value < 0) {
      return { error: `${key} cannot be negative.` };
    }

    if (INTEGER_KEYS.has(key) && !Number.isInteger(value)) {
      return { error: `${key} must be a whole number.` };
    }

    if (
      key === "business_transaction_fee_percent" &&
      value > 100
    ) {
      return { error: "The transaction fee cannot exceed 100%." };
    }

    if (
      key === "promotion_duration_days" &&
      value < 1
    ) {
      return { error: "Promotion duration must be at least one day." };
    }

    settings[key] = value;
  }

  return { settings };
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
      .in("setting_key", ALLOWED_KEYS);

    if (error) {
      console.error("Advertising settings read failed:", error.message);
      return jsonError("Could not load advertising settings.", 500);
    }

    const settings: Record<string, number> = {};

    for (const row of data ?? []) {
      settings[row.setting_key] = Number(row.setting_value);
    }

    const missingKeys = ALLOWED_KEYS.filter(
      (key) => !Object.prototype.hasOwnProperty.call(settings, key)
    );

    if (missingKeys.length > 0) {
      console.error("Missing advertising settings:", missingKeys);
      return jsonError(
        "Some advertising settings are missing from the database. Check the seeded settings.",
        500
      );
    }

    return NextResponse.json(
      { success: true, settings },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Advertising settings GET failed:", error);
    return jsonError("Server configuration error.", 500);
  }
}

export async function PUT(request: NextRequest) {
  if (!isValidAdminSession(request)) {
    return jsonError("Unauthorized. Please sign in again.", 401);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("The request body must contain valid JSON.", 400);
  }

  const input =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>).settings
      : undefined;

  const validation = validateSettings(input);

  if (validation.error || !validation.settings) {
    return jsonError(validation.error ?? "Invalid settings.", 400);
  }

  try {
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    const rows = ALLOWED_KEYS.map((key) => ({
      setting_key: key,
      setting_value: validation.settings![key],
      description: SETTING_DESCRIPTIONS[key],
      updated_at: now,
    }));

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
        settings: validation.settings,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Advertising settings PUT failed:", error);
    return jsonError("Server configuration error.", 500);
  }
}
