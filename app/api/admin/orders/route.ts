import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLATFORM_FEE_RATE = 0.0215;

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

/**
 * Validate the existing central-admin session cookie.
 * This expects the same HMAC session format used by
 * app/api/admin/login/route.ts.
 *
 * Expected cookie payload:
 * base64url(JSON.stringify({ email, expiresAt }))
 * followed by "." and an HMAC-SHA256 signature.
 *
 * IMPORTANT:
 * If your existing login route uses a different cookie
 * format, keep its validation logic consistent here.
 */
function verifyAdminSession(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    return false;
  }

  const cookie = request.cookies.get("bsg_admin_session")?.value;

  if (!cookie) {
    return false;
  }

  const separator = cookie.lastIndexOf(".");

  if (separator < 1) {
    return false;
  }

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
      decoded.email === "admin@bestsalesgh.com" &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
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

function numberOrZero(value: unknown): number {
  const valueAsNumber = Number(value ?? 0);

  return Number.isFinite(valueAsNumber) ? valueAsNumber : 0;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return jsonError("Unauthorized. Please sign in as Admin.", 401);
  }

  try {
    const supabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;

    const search = (searchParams.get("search") || "")
      .trim()
      .toLowerCase();

    const requestedStatus = (
      searchParams.get("status") || ""
    ).trim();

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10) || 1
    );

    const pageSize = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(searchParams.get("pageSize") || "50", 10) || 50
      )
    );

    /*
     * Load the orders table.
     * Only use columns confirmed in the database schema.
     */
    let orderQuery = supabase
      .from("orders")
      .select(
        [
          "id",
          "user_id",
          "order_number",
          "product_name",
          "product_id",
          "order_type",
          "quantity",
          "total_amount",
          "deposit_percentage",
          "deposit_amount",
          "balance_percentage",
          "balance_amount",
          "amount_paid",
          "amount_remaining",
          "status",
          "phone",
          "delivery_address",
          "terms_accepted",
          "created_at",
          "updated_at",
        ].join(","),
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (requestedStatus && requestedStatus !== "all") {
      orderQuery = orderQuery.eq("status", requestedStatus);
    }

    const {
      data: orderData,
      error: orderError,
      count,
    } = await orderQuery.range(
      (page - 1) * pageSize,
      page * pageSize - 1
    );

    if (orderError) {
      console.error("Admin orders query failed:", orderError.message);

      return jsonError(
        "Unable to load orders from the database. Check the orders table and Supabase permissions.",
        500
      );
    }

    const orders = orderData || [];

    /*
     * Load buyer profiles for the orders.
     */
    const userIds = Array.from(
      new Set(
        orders
          .map((order) => order.user_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    const profilesById = new Map<
      string,
      {
        id: string;
        full_name: string | null;
        phone: string | null;
        account_type: string | null;
        verification_status: string | null;
      }
    >();

    if (userIds.length > 0) {
      const {
        data: profiles,
        error: profilesError,
      } = await supabase
        .from("profiles")
        .select(
          "id,full_name,phone,account_type,verification_status"
        )
        .in("id", userIds);

      if (profilesError) {
        console.error(
          "Buyer profile lookup failed:",
          profilesError.message
        );
      } else {
        for (const profile of profiles || []) {
          profilesById.set(profile.id, profile);
        }
      }
    }

    /*
     * Calculate the platform fee.
     *
     * This is an estimate based on order total.
     * It is not evidence that the fee has been collected.
     */
    const enrichedOrders = orders.map((order) => {
      const total = numberOrZero(order.total_amount);
      const paid = numberOrZero(order.amount_paid);
      const remaining = numberOrZero(order.amount_remaining);

      const platformFee = roundMoney(total * PLATFORM_FEE_RATE);
      const feeOnAmountPaid = roundMoney(paid * PLATFORM_FEE_RATE);

      const buyer = order.user_id
        ? profilesById.get(order.user_id) || null
        : null;

      return {
        ...order,
        buyer: buyer
          ? {
              id: buyer.id,
              full_name: buyer.full_name,
              phone: buyer.phone,
              account_type: buyer.account_type,
              verification_status: buyer.verification_status,
            }
          : null,

        platform_fee_rate: PLATFORM_FEE_RATE,
        estimated_platform_fee: platformFee,
        estimated_fee_on_amount_paid: feeOnAmountPaid,

        buyer_paid_amount: paid,
        outstanding_balance: remaining,

        payment_status:
          paid <= 0
            ? "UNPAID"
            : remaining > 0
              ? "PARTIALLY_PAID"
              : "PAID",

        /*
         * The current orders schema does not identify the
         * receiving seller/company or confirm fee collection.
         */
        seller_id: null,
        seller_name: null,
        company_payment_status: "NOT_RECORDED",
        platform_fee_collection_status: "NOT_VERIFIED",
        invoice_status: "NOT_GENERATED",
      };
    });

    const filteredOrders = search
      ? enrichedOrders.filter((order) => {
          const searchableText = [
            order.order_number,
            order.product_name,
            order.product_id,
            order.order_type,
            order.status,
            order.phone,
            order.delivery_address,
            order.user_id,
            order.buyer?.full_name,
            order.buyer?.phone,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(search);
        })
      : enrichedOrders;

    const summary = filteredOrders.reduce(
      (totals, order) => {
        totals.order_value += numberOrZero(order.total_amount);
        totals.amount_paid += numberOrZero(order.amount_paid);
        totals.outstanding_balance += numberOrZero(
          order.amount_remaining
        );
        totals.estimated_platform_fee += numberOrZero(
          order.estimated_platform_fee
        );
        totals.estimated_fee_on_amount_paid += numberOrZero(
          order.estimated_fee_on_amount_paid
        );

        return totals;
      },
      {
        order_value: 0,
        amount_paid: 0,
        outstanding_balance: 0,
        estimated_platform_fee: 0,
        estimated_fee_on_amount_paid: 0,
      }
    );

    return NextResponse.json(
      {
        success: true,
        orders: filteredOrders,
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
        summary: {
          matching_orders: filteredOrders.length,
          order_value: roundMoney(summary.order_value),
          amount_paid: roundMoney(summary.amount_paid),
          outstanding_balance: roundMoney(
            summary.outstanding_balance
          ),
          estimated_platform_fee: roundMoney(
            summary.estimated_platform_fee
          ),
          estimated_fee_on_amount_paid: roundMoney(
            summary.estimated_fee_on_amount_paid
          ),
          platform_fee_rate: PLATFORM_FEE_RATE,
          note:
            "Platform fees are estimates only. Actual collection and company payments must be verified against payment transaction records.",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Admin orders API error:", error);

    return jsonError(
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while loading orders.",
      500
    );
  }
}
