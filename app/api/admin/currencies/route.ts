
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const COOKIE_NAME = "bsg_admin_session";
const ADMIN_EMAIL = "admin@bestsalesgh.com";

const ALLOWED_CURRENCIES = ["CNY", "USD", "EUR", "GBP"] as const;

type CurrencyCode = (typeof ALLOWED_CURRENCIES)[number];

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

async function verifyAdminSession(value: string): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    console.error("ADMIN_SESSION_SECRET is missing.");
    return false;
  }

  const parts = value.split(".");

  if (parts.length !== 2) return false;

  const [payload, signature] = parts;

  if (!payload || !signature) return false;

  try {
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      toArrayBuffer(encoder.encode(secret)),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
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

function getAdminSupabase() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase server environment variables are missing.");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)?.value;

  if (!session || !(await verifyAdminSession(session))) {
    return NextResponse.json(
      { error: "Administrator authentication required." },
      { status: 401 }
    );
  }

  let body: any;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  try {
    const supabase = getAdminSupabase();

    /*
     * Save one manually entered exchange rate.
     */
    if (body.action === "save-rate") {
      const currencyCode = body.currencyCode as CurrencyCode;
      const newRate = Number(body.rate);

      if (!ALLOWED_CURRENCIES.includes(currencyCode)) {
        return NextResponse.json(
          { error: "Unsupported currency." },
          { status: 400 }
        );
      }

      if (!Number.isFinite(newRate) || newRate <= 0) {
        return NextResponse.json(
          { error: "Enter a valid rate greater than zero." },
          { status: 400 }
        );
      }

      const { data: current, error: readError } = await supabase
        .from("currencies")
        .select(
          "manual_rate_from_ghs, xe_rate, xe_change_percent, adjustment_percent"
        )
        .eq("code", currencyCode)
        .single();

      if (readError || !current) {
        console.error("Currency lookup error:", readError);

        return NextResponse.json(
          { error: "Could not find the selected currency." },
          { status: 404 }
        );
      }

      const { error: updateError } = await supabase
        .from("currencies")
        .update({
          manual_rate_from_ghs: newRate,
          rate_source: "MANUAL",
        })
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

      if (historyError) {
        console.error("Rate history error:", historyError);
      }

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
        console.error(
          "Adjustment history error:",
          adjustmentHistoryError
        );
      }

      return NextResponse.json({
        success: true,
        message: `${currencyCode} rate saved successfully.`,
        rate: newRate,
        historyWarning:
          historyError || adjustmentHistoryError
            ? "The rate was saved, but one or more history records could not be written. Check server logs."
            : null,
      });
    }

    /*
     * Save automatic adjustment settings.
     */
    if (body.action === "save-adjustment-settings") {
      if (typeof body.enabled !== "boolean") {
        return NextResponse.json(
          { error: "Invalid automatic adjustment setting." },
          { status: 400 }
        );
      }

      const percentage = Number(body.percentage);

      if (
        !Number.isFinite(percentage) ||
        percentage < 0 ||
        percentage > 100
      ) {
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

    return NextResponse.json(
      { error: "Unknown currency action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin currency API error:", error);

    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
