import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLATFORM_FEE_RATE = 0.0215;
const ADMIN_EMAIL = "admin@bestsalesgh.com";

type OrderRow = {
  id: string;
  user_id: string | null;
  order_number: string | null;
  product_name: string | null;
  product_id: string | null;
  order_type: string | null;
  quantity: number | null;
  total_amount: number | string | null;
  deposit_percentage: number | string | null;
  deposit_amount: number | string | null;
  balance_percentage: number | string | null;
  balance_amount: number | string | null;
  amount_paid: number | string | null;
  amount_remaining: number | string | null;
  status: string | null;
  phone: string | null;
  delivery_address: string | null;
  terms_accepted: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type BuyerProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  account_type: string | null;
  verification_status: string | null;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function verifyAdminSession(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const cookie = request.cookies.get("bsg_admin_session")?.value;

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

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables."
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
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
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
    const params = request.nextUrl.searchParams;

    const search = (params.get("search") || "").trim().toLowerCase();
    const requestedStatus = (params.get("status") || "").trim();

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

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
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
      query = query.eq("status", requestedStatus);
    }

    const {
      data: rawOrders,
      error: orderError,
      count,
    } = await query.range(start, end);

    if (orderError) {
      console.error("Admin orders query failed:", orderError.message);
      return jsonError(
        "Unable to load orders. Check the orders table columns and database configuration.",
        500
      );
    }

    // Explicit typing fixes the TypeScript error at order.user_id.
    const orders: OrderRow[] = (rawOrders ?? []) as unknown as OrderRow[];

    const userIds = Array.from(
      new Set(
        orders
          .map((order) => order.user_id)
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      )
    );

    const profilesById = new Map<string, BuyerProfile>();

    if (userIds.length > 0) {
      const { data: rawProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id,full_name,phone,account_type,verification_status")
        .in("id", userIds);

      if (profilesError) {
        console.error("Buyer profile lookup failed:", profilesError.message);
      } else {
        const profiles = (rawProfiles ?? []) as BuyerProfile[];

        for (const profile of profiles) {
          profilesById.set(profile.id, profile);
        }
      }
    }

    const enrichedOrders = orders.map((order) => {
      const total = numberOrZero(order.total_amount);
      const paid = numberOrZero(order.amount_paid);
      const remaining = numberOrZero(order.amount_remaining);

      const buyer = order.user_id
        ? profilesById.get(order.user_id) ?? null
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
        estimated_platform_fee: roundMoney(total * PLATFORM_FEE_RATE),
        estimated_fee_on_amount_paid: roundMoney(paid * PLATFORM_FEE_RATE),

        buyer_paid_amount: paid,
        outstanding_balance: remaining,

        payment_status:
          paid <= 0
            ? "UNPAID"
            : remaining > 0
              ? "PARTIALLY_PAID"
              : "PAID",

        // The current orders schema does not link orders to a seller/company.
        seller_id: null,
        seller_name: null,
        company_payment_status: "NOT_RECORDED",
        platform_fee_collection_status: "NOT_VERIFIED",
        invoice_status: "NOT_GENERATED",
      };
    });

    const filteredOrders = search
      ? enrichedOrders.filter((order) => {
          const searchable = [
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

          return searchable.includes(search);
        })
      : enrichedOrders;

    const summary = filteredOrders.reduce(
      (result, order) => {
        result.order_value += numberOrZero(order.total_amount);
        result.amount_paid += numberOrZero(order.amount_paid);
        result.outstanding_balance += numberOrZero(order.amount_remaining);
        result.estimated_platform_fee += numberOrZero(
          order.estimated_platform_fee
        );
        result.estimated_fee_on_amount_paid += numberOrZero(
          order.estimated_fee_on_amount_paid
        );
        return result;
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
          total: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / pageSize),
        },
        summary: {
          matching_orders: filteredOrders.length,
          order_value: roundMoney(summary.order_value),
          amount_paid: roundMoney(summary.amount_paid),
          outstanding_balance: roundMoney(summary.outstanding_balance),
          estimated_platform_fee: roundMoney(
            summary.estimated_platform_fee
          ),
          estimated_fee_on_amount_paid: roundMoney(
            summary.estimated_fee_on_amount_paid
          ),
          platform_fee_rate: PLATFORM_FEE_RATE,
          note:
            "Fees are estimates, not proof of collection. Verify payment transactions before recording fees as received.",
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
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
