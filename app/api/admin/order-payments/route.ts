
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "admin@bestsalesgh.com";
const COOKIE_NAME = "bsg_admin_session";

const PAYMENT_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "REFUNDED",
] as const;

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}

function verifyAdminSession(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const cookie = request.cookies.get(COOKIE_NAME)?.value;

  if (!secret || !cookie) return false;

  const separator = cookie.lastIndexOf(".");
  if (separator < 1) return false;

  const payload = cookie.slice(0, separator);
  const suppliedSignature = cookie.slice(separator + 1);

  const expectedSignature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);

  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return false;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
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

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function validUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

async function getCentralAdminId(
  supabase: ReturnType<typeof getSupabaseAdmin>
): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    console.error("Admin identity lookup failed:", error.message);
    throw new Error("Unable to verify central Admin identity.");
  }

  return (
    data.users.find(
      (user) => user.email?.toLowerCase() === ADMIN_EMAIL
    )?.id ?? null
  );
}

// GET /api/admin/order-payments?status=PENDING&page=1&pageSize=50
export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return jsonError("Unauthorized. Please sign in as Admin.", 401);
  }

  try {
    const supabase = getSupabaseAdmin();
    const params = request.nextUrl.searchParams;

    const status = (params.get("status") || "").toUpperCase();
    const orderId = (params.get("order_id") || "").trim();

    const page = Math.max(
      1,
      Number.parseInt(params.get("page") || "1", 10) || 1
    );

    const pageSize = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(params.get("pageSize") || "50", 10) || 50
      )
    );

    if (
      status &&
      !(PAYMENT_STATUSES as readonly string[]).includes(status)
    ) {
      return jsonError("Invalid payment status filter.", 400);
    }

    if (orderId && !validUuid(orderId)) {
      return jsonError("Invalid order_id.", 400);
    }

    let query = supabase
      .from("order_payment_records")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status) query = query.eq("payment_status", status);
    if (orderId) query = query.eq("order_id", orderId);

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await query.range(start, end);

    if (error) {
      console.error("Payment list failed:", error.message);
      return jsonError("Unable to load payment records.", 500);
    }

    return NextResponse.json(
      {
        success: true,
        payments: data ?? [],
        pagination: {
          page,
          pageSize,
          total: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / pageSize),
        },
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Payment GET error:", error);
    return jsonError("Unexpected error loading payments.", 500);
  }
}

// POST /api/admin/order-payments
// Body: { order_id, amount, currency_code?, payment_method?,
//         payment_reference?, notes? }
// Creates a pending record; it does not verify receipt of money.
export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return jsonError("Unauthorized. Please sign in as Admin.", 401);
  }

  try {
    const body = await request.json();

    const orderId =
      typeof body.order_id === "string" ? body.order_id.trim() : "";

    const amount = Number(body.amount);

    const currencyCode =
      typeof body.currency_code === "string"
        ? body.currency_code.trim().toUpperCase()
        : "GHS";

    const paymentMethod =
      typeof body.payment_method === "string"
        ? body.payment_method.trim().toUpperCase()
        : "MANUAL";

    const paymentReference =
      typeof body.payment_reference === "string"
        ? body.payment_reference.trim()
        : null;

    const notes =
      typeof body.notes === "string" ? body.notes.trim() : null;

    if (!validUuid(orderId)) {
      return jsonError("A valid order_id is required.", 400);
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > 9999999999
    ) {
      return jsonError("Enter a valid positive payment amount.", 400);
    }

    if (!/^[A-Z]{3}$/.test(currencyCode)) {
      return jsonError("Invalid three-letter currency code.", 400);
    }

    if (!/^[A-Z0-9 _-]{1,50}$/.test(paymentMethod)) {
      return jsonError("Invalid payment method.", 400);
    }

    if (paymentReference && paymentReference.length > 200) {
      return jsonError("Payment reference is too long.", 400);
    }

    if (notes && notes.length > 2000) {
      return jsonError("Notes must be 2000 characters or fewer.", 400);
    }

    const supabase = getSupabaseAdmin();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      console.error("Order lookup failed:", orderError.message);
      return jsonError("Unable to verify the order.", 500);
    }

    if (!order) {
      return jsonError("Order not found.", 404);
    }

    const adminId = await getCentralAdminId(supabase);

    if (!adminId) {
      return jsonError("Central Admin Auth account was not found.", 500);
    }

    const { data: payment, error } = await supabase
      .from("order_payment_records")
      .insert({
        order_id: orderId,
        amount: Math.round(amount * 100) / 100,
        currency_code: currencyCode,
        payment_method: paymentMethod,
        payment_reference: paymentReference || null,
        payment_status: "PENDING",
        recorded_by: adminId,
        notes: notes || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Payment insert failed:", error.message);

      if (error.code === "23505") {
        return jsonError("That payment reference already exists.", 409);
      }

      return jsonError("Unable to create payment record.", 500);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment recorded as pending verification.",
        payment,
      },
      {
        status: 201,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Payment POST error:", error);

    return jsonError(
      error instanceof Error
        ? error.message
        : "Invalid request or server error.",
      500
    );
  }
}

// PATCH /api/admin/order-payments
// Body: { payment_id, action: "CONFIRMED" | "REJECTED", notes? }
export async function PATCH(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return jsonError("Unauthorized. Please sign in as Admin.", 401);
  }

  try {
    const body = await request.json();

    const paymentId =
      typeof body.payment_id === "string"
        ? body.payment_id.trim()
        : "";

    const action =
      typeof body.action === "string"
        ? body.action.toUpperCase()
        : "";

    const notes =
      typeof body.notes === "string" ? body.notes.trim() : null;

    if (!validUuid(paymentId)) {
      return jsonError("A valid payment_id is required.", 400);
    }

    if (!["CONFIRMED", "REJECTED"].includes(action)) {
      return jsonError(
        "action must be CONFIRMED or REJECTED.",
        400
      );
    }

    if (notes && notes.length > 2000) {
      return jsonError("Notes must be 2000 characters or fewer.", 400);
    }

    const supabase = getSupabaseAdmin();
    const adminId = await getCentralAdminId(supabase);

    if (!adminId) {
      return jsonError("Central Admin Auth account was not found.", 500);
    }

    const { data: existing, error: lookupError } = await supabase
      .from("order_payment_records")
      .select("id,payment_status")
      .eq("id", paymentId)
      .maybeSingle();

    if (lookupError) {
      console.error("Payment lookup failed:", lookupError.message);
      return jsonError("Unable to find payment record.", 500);
    }

    if (!existing) {
      return jsonError("Payment record not found.", 404);
    }

    if (existing.payment_status !== "PENDING") {
      return jsonError(
        "Only pending payments can be confirmed or rejected.",
        409
      );
    }

    const updateData: {
      payment_status: string;
      verified_by: string;
      verified_at: string;
      updated_at: string;
      notes?: string | null;
    } = {
      payment_status: action,
      verified_by: adminId,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (notes !== null) updateData.notes = notes;

    const { data: payment, error: updateError } = await supabase
      .from("order_payment_records")
      .update(updateData)
      .eq("id", paymentId)
      .eq("payment_status", "PENDING")
      .select("*")
      .maybeSingle();

    if (updateError) {
      console.error("Payment update failed:", updateError.message);
      return jsonError("Unable to update payment status.", 500);
    }

    if (!payment) {
      return jsonError(
        "This payment has already been handled. Refresh and try again.",
        409
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          action === "CONFIRMED"
            ? "Payment marked as confirmed by the central Admin."
            : "Payment rejected by the central Admin.",
        payment,
        moneyTransferred: false,
        companyAccountDebited: false,
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Payment PATCH error:", error);

    return jsonError(
      error instanceof Error
        ? error.message
        : "Unexpected payment verification error.",
      500
    );
  }
}
