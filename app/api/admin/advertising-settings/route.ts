
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "bsg_admin_session";
const ADMIN_EMAIL = "admin@bestsalesgh.com";

const SETTING_DESCRIPTIONS = {
  individual_premium_price: "Price per individual Premium advertisement.",
  individual_priority_price: "Price per individual Priority advertisement.",
  individual_top_priority_price: "Price per individual Top Priority advertisement.",
  company_top_priority_monthly_price: "Monthly price for the company Top Priority advertising package.",
  business_transaction_fee_percent: "Platform fee percentage for eligible business transactions.",
  individual_free_ads_limit: "Number of free advertisements per individual seller.",
  company_free_ads_limit: "Number of free advertisements per company seller.",
  company_priority_ads_limit: "Company advertisements covered by the Priority arrangement.",
  promotion_duration_days: "Legacy duration of an individual paid promotion in days.",
  promotion_discount_percent: "Discount percentage for eligible paid advertisement promotions.",
  promotion_discount_packages: "Package eligibility bitmask: Premium=1, Priority=2, Top Priority=4; combinations are added.",
} as const;

type SettingKey = keyof typeof SETTING_DESCRIPTIONS;

const ALLOWED_SETTINGS = Object.keys(
  SETTING_DESCRIPTIONS
) as SettingKey[];

const REQUIRED_LEGACY_SETTINGS = ALLOWED_SETTINGS.filter(
  (key) =>
    key !== "promotion_discount_percent" &&
    key !== "promotion_discount_packages"
);

const LIMITS: Record<
  SettingKey,
  { min: number; max: number; decimals: number }
> = {
  individual_premium_price: { min: 1, max: 1_000_000, decimals: 2 },
  individual_priority_price: { min: 1, max: 1_000_000, decimals: 2 },
  individual_top_priority_price: { min: 1, max: 1_000_000, decimals: 2 },
  company_top_priority_monthly_price: { min: 1, max: 10_000_000, decimals: 2 },
  business_transaction_fee_percent: { min: 0, max: 100, decimals: 2 },
  individual_free_ads_limit: { min: 0, max: 1_000_000, decimals: 0 },
  company_free_ads_limit: { min: 0, max: 1_000_000, decimals: 0 },
  company_priority_ads_limit: { min: 0, max: 1_000_000, decimals: 0 },
  promotion_duration_days: { min: 1, max: 3650, decimals: 0 },
  promotion_discount_percent: { min: 0, max: 100, decimals: 2 },
  promotion_discount_packages: { min: 0, max: 7, decimals: 0 },
};

const DEFAULTS: Record<SettingKey, number> = {
  individual_premium_price: 160,
  individual_priority_price: 420,
  individual_top_priority_price: 790,
  company_top_priority_monthly_price: 630,
  business_transaction_fee_percent: 2.15,
  individual_free_ads_limit: 9,
  company_free_ads_limit: 12,
  company_priority_ads_limit: 12,
  promotion_duration_days: 30,
  promotion_discount_percent: 0,
  promotion_discount_packages: 0,
};

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

async function isAdministrator(request: NextRequest): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const session = request.cookies.get(COOKIE_NAME)?.value;

  if (!secret || !session) return false;

  const parts = session.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  if (!payload || !signature) return false;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      toArrayBuffer(encoder.encode(secret)),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      toArrayBuffer(base64UrlToBytes(signature)),
      toArrayBuffer(encoder.encode(payload))
    );

    if (!valid) return false;

    const decoded = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payload))
    );

    return (
      decoded.email === ADMIN_EMAIL &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing server-side Supabase configuration.");
  }

  return { url: url.replace(/\/+$/, ""), serviceKey };
}

async function databaseRequest(
  path: string,
  serviceKey: string,
  options: RequestInit = {}
) {
  const { url } = getSupabaseConfig();

  return fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      ...options.headers,
    },
    cache: "no-store",
  });
}

function rowsToSettings(rows: { setting_key: string; setting_value: number | string }[]) {
  const settings: Partial<Record<SettingKey, number>> = {};

  for (const row of rows) {
    if (ALLOWED_SETTINGS.includes(row.setting_key as SettingKey)) {
      const value = Number(row.setting_value);
      if (Number.isFinite(value)) {
        settings[row.setting_key as SettingKey] = value;
      }
    }
  }

  return settings;
}

export async function GET(request: NextRequest) {
  if (!(await isAdministrator(request))) {
    return jsonError("Administrator authorization required.", 401);
  }

  try {
    const { serviceKey } = getSupabaseConfig();
    const keys = ALLOWED_SETTINGS.join(",");

    const response = await databaseRequest(
      `advertising_settings?select=setting_key,setting_value,description,updated_at&setting_key=in.(${keys})`,
      serviceKey
    );

    if (!response.ok) {
      console.error("Advertising settings load failed:", await response.text());
      return jsonError("Unable to load advertising settings.", 502);
    }

    const rows = await response.json();
    const settings = { ...DEFAULTS, ...rowsToSettings(rows) };

    return NextResponse.json(
      { success: true, settings, rows },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Advertising settings GET error:", error);
    return jsonError("Server configuration or database error.", 500);
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAdministrator(request))) {
    return jsonError("Administrator authorization required.", 401);
  }

  let body: { settings?: unknown };

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
    return jsonError("Provide a settings object.", 400);
  }

  const submitted = body.settings as Record<string, unknown>;
  const submittedKeys = Object.keys(submitted);

  const isLegacySubmission =
    submittedKeys.length === REQUIRED_LEGACY_SETTINGS.length &&
    REQUIRED_LEGACY_SETTINGS.every((key) => submittedKeys.includes(key));

  const isCompleteSubmission =
    submittedKeys.length === ALLOWED_SETTINGS.length &&
    ALLOWED_SETTINGS.every((key) => submittedKeys.includes(key));

  if (!isLegacySubmission && !isCompleteSubmission) {
    return jsonError(
      "Submit either the nine existing settings or all eleven settings.",
      400
    );
  }

  const rows: {
    setting_key: SettingKey;
    setting_value: number;
    description: string;
    updated_at: string;
  }[] = [];

  const now = new Date().toISOString();

  for (const key of submittedKeys as SettingKey[]) {
    const raw = submitted[key];
    const value =
      typeof raw === "number"
        ? raw
        : typeof raw === "string" && raw.trim() !== ""
          ? Number(raw)
          : NaN;

    const limits = LIMITS[key];

    if (
      !Number.isFinite(value) ||
      value < limits.min ||
      value > limits.max ||
      Number(value.toFixed(limits.decimals)) !== value
    ) {
      return jsonError(`Invalid value for ${key}.`, 400);
    }

    rows.push({
      setting_key: key,
      setting_value: value,
      description: SETTING_DESCRIPTIONS[key],
      updated_at: now,
    });
  }

  try {
    const { serviceKey } = getSupabaseConfig();

    const response = await databaseRequest(
      "advertising_settings?on_conflict=setting_key",
      serviceKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(rows),
      }
    );

    if (!response.ok) {
      console.error("Advertising settings save failed:", await response.text());
      return jsonError("Unable to save advertising settings.", 502);
    }

    const savedRows = await response.json();

    return NextResponse.json(
      {
        success: true,
        message: "Advertising settings saved.",
        settings: { ...DEFAULTS, ...rowsToSettings(savedRows) },
        rows: savedRows,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Advertising settings PUT error:", error);
    return jsonError("Server configuration or database error.", 500);
  }
}
