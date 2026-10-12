
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "bsg_admin_session";

const ALLOWED_SETTINGS = [
  "individual_premium_price",
  "individual_priority_price",
  "individual_top_priority_price",
  "company_top_priority_monthly_price",
  "business_transaction_fee_percent",
] as const;

type SettingKey = (typeof ALLOWED_SETTINGS)[number];

const LIMITS: Record<
  SettingKey,
  { min: number; max: number; decimals: number }
> = {
  individual_premium_price: {
    min: 1,
    max: 1000000,
    decimals: 2,
  },
  individual_priority_price: {
    min: 1,
    max: 1000000,
    decimals: 2,
  },
  individual_top_priority_price: {
    min: 1,
    max: 1000000,
    decimals: 2,
  },
  company_top_priority_monthly_price: {
    min: 1,
    max: 10000000,
    decimals: 2,
  },
  business_transaction_fee_percent: {
    min: 0,
    max: 100,
    decimals: 2,
  },
};

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );

  const binary = atob(padded);

  return Uint8Array.from(binary, (character) =>
    character.charCodeAt(0)
  );
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const result = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(result).set(bytes);
  return result;
}

async function isAdministrator(request: NextRequest) {
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
      decoded.email === "admin@bestsalesgh.com" &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing server-side Supabase configuration.");
  }

  return {
    url: url.replace(/\/+$/, ""),
    serviceKey,
  };
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: NextRequest) {
  if (!(await isAdministrator(request))) {
    return jsonError("Administrator authorization required.", 401);
  }

  try {
    const { url, serviceKey } = getSupabaseConfig();

    const response = await fetch(
      `${url}/rest/v1/advertising_settings?select=setting_key,setting_value,description,updated_at&setting_key=in.(${ALLOWED_SETTINGS.join(",")})`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Settings load failed:", await response.text());
      return jsonError("Unable to load advertising settings.", 502);
    }

    const rows = await response.json();

    return NextResponse.json(
      { success: true, settings: rows },
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

  if (
    submittedKeys.length !== ALLOWED_SETTINGS.length ||
    submittedKeys.some(
      (key) => !ALLOWED_SETTINGS.includes(key as SettingKey)
    )
  ) {
    return jsonError(
      "Submit exactly the five supported advertising settings.",
      400
    );
  }

  const rows: {
    setting_key: SettingKey;
    setting_value: number;
  }[] = [];

  for (const key of ALLOWED_SETTINGS) {
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

    rows.push({ setting_key: key, setting_value: value });
  }

  try {
    const { url, serviceKey } = getSupabaseConfig();

    const response = await fetch(
      `${url}/rest/v1/advertising_settings?on_conflict=setting_key`,
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(
          rows.map((row) => ({
            ...row,
            updated_at: new Date().toISOString(),
          }))
        ),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Settings save failed:", await response.text());
      return jsonError("Unable to save advertising settings.", 502);
    }

    const saved = await response.json();

    return NextResponse.json({
      success: true,
      message: "Advertising settings saved.",
      settings: saved,
    });
  } catch (error) {
    console.error("Advertising settings PUT error:", error);
    return jsonError("Server configuration or database error.", 500);
  }
}
