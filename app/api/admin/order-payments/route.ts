
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "admin@bestsalesgh.com";
const COOKIE_NAME = "bsg_admin_session";

type PaymentStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "REFUNDED";

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

  const suppliedBuffer = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
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

function requireAdmin(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return jsonError("Unauthorized. Please sign in as Admin.", 401);
  }

  return null;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, serviceRoleKey, {
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

// GET /api/admin/order-payments
// Optional query parameters: status, order_id, page, pageSize
export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

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
      !["PENDING", "CONFIRMED", "REJECTED", "REFUNDED"].includes(status)
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

    if (status) {
      query = query.eq("payment_status", status);
    }

    if (orderId) {
      query = query.eq("order_id", orderId);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error("Admin payment list error:", error.message);
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
    console.error("Admin payment GET error:", error);
    return jsonError("Unexpected error loading payments.", 500);
  }
}

// POST /api/admin/order-payments
// Records a payment as PENDING. Does not prove money was received.
export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

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

    if (!Number.isFinite(amount) || amount <= 0 || amount > 9999999999) {
      return jsonError("Enter a valid positive payment amount.", 400);
    }

    if (!/^[A-Z]{3}$/.test(currencyCode)) {
      return jsonError("currency_code must be a 3-letter code.", 400);
    }

    if (!/^[A-Z0-9 _-]{1,50}$/.test(paymentMethod)) {
      return jsonError("Invalid payment_method.", 400);
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
      console.error("Payment order lookup error:", orderError.message);
      return jsonError("Unable to verify the order.", 500);
    }

    if (!order) {
      return jsonError("Order not found.", 404);
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
        notes: notes || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Payment record insert error:", error.message);

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
    console.error("Admin payment POST error:", error);
    return jsonError("Invalid request or server error.", 500);
  }
}

// PATCH /api/admin/order-payments
// Body: { payment_id, action: "CONFIRMED" | "REJECTED", notes? }
export async function PATCH(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    const paymentId =
      typeof body.payment_id === "string" ? body.payment_id.trim() : "";
    const action =
      typeof body.action === "string" ? body.action.toUpperCase() : "";

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

    // Resolve the central admin's Supabase Auth UUID for verification metadata.
    const { data: adminUser, error: adminError } =
      await supabase.auth.admin.getUserById(
        // This ID is looked up by email below if not configured.
        ""
      );

    // Use paginated Auth user lookup to identify the central admin.
    // No user-provided identity is accepted for this decision.
    let adminId = adminUser?.user?.id ?? null;

    if (adminError || !adminId) {
      const { data: usersResult, error: usersError } =
        await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

      if (usersError) {
        console.error("Admin identity lookup error:", usersError.message);
        return jsonError("Unable to verify central admin identity.", 500);
      }

      adminId =
        usersResult.users.find(
          (user) => user.email?.toLowerCase() === ADMIN_EMAIL
        )?.id ?? null;
    }

    if (!adminId) {
      return jsonError("Central admin Auth user was not found.", 500);
    }

    const { data: existing, error: lookupError } = await supabase
      .from("order_payment_records")
      .select("id,payment_status")
      .eq("id", paymentId)
      .maybeSingle();

    if (lookupError) {
      console.error("Payment lookup error:", lookupError.message);
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
      payment_status: PaymentStatus;
      verified_by: string;
      verified_at: string;
      updated_at: string;
      notes?: string | null;
    } = {
      payment_status: action as PaymentStatus,
      verified_by: adminId,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (notes !== null) updateData.notes = notes;

    // Conditional update prevents two admins from changing the same pending
    // record after one of them has already handled it.
    const { data: payment, error: updateError } = await supabase
      .from("order_payment_records")
      .update(updateData)
      .eq("id", paymentId)
      .eq("payment_status", "PENDING")
      .select("*")
      .maybeSingle();

    if (updateError) {
      console.error("Payment verification error:", updateError.message);
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
            ? "Payment marked as confirmed by the central admin."
            : "Payment rejected by the central admin.",
        payment,
        moneyTransferred: false,
        companyAccountDebited: false,
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Admin payment PATCH error:", error);
    return jsonError("Invalid request or server error.", 500);
  }
}
