
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "bsg_admin_session";
const ADMIN_EMAIL = "admin@bestsalesgh.com";
const ALLOWED_CURRENCIES = ["CNY", "USD", "EUR", "GBP"] as const;

type CurrencyCode = (typeof ALLOWED_CURRENCIES)[number];

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

async function verifyAdminSession(value: string): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;

  const parts = value.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;

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
      toArrayBuffer(base64UrlToBytes(parts[1])),
      toArrayBuffer(encoder.encode(parts[0]))
    );
    if (!valid) return false;

    const decoded = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(parts[0]))
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

function getAdminSupabase() {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase server environment variables are missing.");
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function isAdmin(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)?.value;
  return !!session && verifyAdminSession(session);
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json(
      { success: false, error: "Administrator authentication required." },
      { status: 401 }
    );
  }

  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("currencies")
      .select("code, name, symbol, manual_rate_from_ghs, rate_source")
      .in("code", ["GHS", ...ALLOWED_CURRENCIES])
      .order("code");

    if (error) {
      console.error("Could not load admin currency rates:", error);
      return NextResponse.json(
        { success: false, error: "Could not load currency rates." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        currencies: (data ?? []).map((currency) => ({
          ...currency,
          manual_rate_from_ghs:
            currency.code === "GHS"
              ? 1
              : Number(currency.manual_rate_from_ghs),
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Admin currency GET error:", error);
    return NextResponse.json(
      { success: false, error: "Unexpected currency service error." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json(
      { success: false, error: "Administrator authentication required." },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const supabase = getAdminSupabase();

    if (body.action === "save-rate") {
      const currencyCode = body.currencyCode as CurrencyCode;
      const newRate = Number(body.rate);

      if (!ALLOWED_CURRENCIES.includes(currencyCode)) {
        return NextResponse.json({ error: "Unsupported currency." }, { status: 400 });
      }
      if (!Number.isFinite(newRate) || newRate <= 0) {
        return NextResponse.json(
          { error: "Enter a valid rate greater than zero." },
          { status: 400 }
        );
      }

      const { data: current, error: readError } = await supabase
        .from("currencies")
        .select("manual_rate_from_ghs, xe_rate, xe_change_percent, adjustment_percent")
        .eq("code", currencyCode)
        .single();

      if (readError || !current) {
        return NextResponse.json(
          { error: "Could not find the selected currency." },
          { status: 404 }
        );
      }

      const { error: updateError } = await supabase
        .from("currencies")
        .update({ manual_rate_from_ghs: newRate, rate_source: "MANUAL" })
        .eq("code", currencyCode);

      if (updateError) {
        console.error("Currency update error:", updateError);
        return NextResponse.json(
          { error: "Could not save the currency rate." },
          { status: 500 }
        );
      }

      const { error: historyError } = await supabase
        .from("currency_rate_history")
        .insert({
          currency_code: currencyCode,
          old_rate: current.manual_rate_from_ghs,
          new_rate: newRate,
          changed_by: null,
        });

      if (historyError) console.error("Rate history error:", historyError);

      const { error: adjustmentHistoryError } = await supabase
        .from("currency_adjustment_history")
        .insert({
          currency_code: currencyCode,
          old_rate: current.manual_rate_from_ghs,
          reference_rate: current.xe_rate,
          new_rate: newRate,
          change_percent: current.xe_change_percent ?? 0,
          adjustment_percent: current.adjustment_percent ?? 100,
          adjustment_type: "MANUAL",
          changed_by: null,
        });

      if (adjustmentHistoryError) {
        console.error("Adjustment history error:", adjustmentHistoryError);
      }

      return NextResponse.json({
        success: true,
        message: `${currencyCode} rate saved successfully.`,
        rate: newRate,
        historyWarning:
          historyError || adjustmentHistoryError
            ? "Rate saved, but a history record could not be written. Check server logs."
            : null,
      });
    }

    if (body.action === "save-adjustment-settings") {
      if (typeof body.enabled !== "boolean") {
        return NextResponse.json(
          { error: "Invalid automatic adjustment setting." },
          { status: 400 }
        );
      }

      const percentage = Number(body.percentage);
      if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
        return NextResponse.json(
          { error: "Adjustment percentage must be between 0 and 100." },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from("currencies")
        .update({
          auto_adjust_enabled: body.enabled,
          adjustment_percent: percentage,
        })
        .in("code", [...ALLOWED_CURRENCIES]);

      if (error) {
        console.error("Adjustment settings error:", error);
        return NextResponse.json(
          { error: "Could not save adjustment settings." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Adjustment settings saved successfully.",
        enabled: body.enabled,
        percentage,
      });
    }

    return NextResponse.json({ error: "Unknown currency action." }, { status: 400 });
  } catch (error) {
    console.error("Admin currency API error:", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
