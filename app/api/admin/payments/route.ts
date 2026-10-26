
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "bsg_admin_session";
const ADMIN_EMAIL = "admin@bestsalesgh.com";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function verifyAdminSession(value?: string): boolean {
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

    const now = Date.now();

    if (
      session.email !== ADMIN_EMAIL ||
      typeof session.expiresAt !== "number" ||
      session.expiresAt <= now ||
      typeof session.lastActivityAt !== "number" ||
      now - session.lastActivityAt >= 15 * 60 * 1000
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (
    !verifyAdminSession(
      request.cookies.get(COOKIE_NAME)?.value
    )
  ) {
    return json(
      {
        success: false,
        message: "Administrator access required. Please log in again.",
      },
      401
    );
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return json(
      {
        success: false,
        message: "Server database configuration is missing.",
      },
      500
    );
  }

  try {
    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data, error } = await supabase
      .from("promotion_requests")
      .select(
        "id, listing_id, amount, currency_code, payment_reference, payment_status, created_at"
      )
      .not("payment_reference", "is", null)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("Admin promotion payments query failed:", error);

      return json(
        {
          success: false,
          message:
            "Could not read promotion payment records. Check the server logs and database schema.",
        },
        500
      );
    }

    const payments = (data ?? []).map((row) => ({
      id: row.id,
      reference: row.payment_reference,
      order_id: row.listing_id,
      amount: Number(row.amount ?? 0),
      currency: row.currency_code || "GHS",
      status: row.payment_status || "pending",
      payment_method: "Paystack",
      created_at: row.created_at,
    }));

    return json({
      success: true,
      payments,
      source: "promotion_requests",
    });
  } catch (error) {
    console.error("Admin payments API error:", error);

    return json(
      {
        success: false,
        message: "Unable to load payment records.",
      },
      500
    );
  }
}
