
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual, randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "admin@bestsalesgh.com";
const COOKIE_NAME = "bsg_admin_session";

type DeliveryMethod =
  | "BSG_DELIVERY"
  | "SELLER_DELIVERY"
  | "SELF_PICKUP"
  | "THIRD_PARTY_REQUEST";

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function verifyAdminToken(token: string, secret: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [payload, suppliedSignature] = parts;
    if (!payload || !suppliedSignature) return false;

    const expectedSignature = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const supplied = Buffer.from(suppliedSignature, "utf8");
    const expected = Buffer.from(expectedSignature, "utf8");

    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      return false;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as {
      email?: string;
      expiresAt?: number;
    };

    return (
      session.email === ADMIN_EMAIL &&
      typeof session.expiresAt === "number" &&
      Number.isFinite(session.expiresAt) &&
      session.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

async function getAdminContext() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!url || !serviceKey || !sessionSecret) {
    return {
      ok: false as const,
      error: "Server configuration is incomplete.",
      status: 500,
    };
  }

  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token || !verifyAdminToken(token, sessionSecret)) {
    return {
      ok: false as const,
      error: "Your administrator session is invalid or expired. Please sign in again.",
      status: 401,
    };
  }

  const db = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return {
    ok: true as const,
    userId: ADMIN_EMAIL,
    db,
  };
}

function isDeliveryMethod(value: unknown): value is DeliveryMethod {
  return [
    "BSG_DELIVERY",
    "SELLER_DELIVERY",
    "SELF_PICKUP",
    "THIRD_PARTY_REQUEST",
  ].includes(String(value));
}

function makeTrackingNumber() {
  return `BSG-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}

export async function GET() {
  try {
    const context = await getAdminContext();

    if (!context.ok) {
      return jsonError(context.error, context.status);
    }

    const { db } = context;

    const { data: orders, error: ordersError } = await db
      .from("bsg_checkout_orders")
      .select(
        "id, order_number, customer_name, customer_phone, delivery_address, delivery_region, delivery_city, delivery_fee, currency_code, payment_status, order_status, created_at"
      )
      .eq("payment_status", "PAID")
      .order("created_at", { ascending: false })
      .limit(200);

    if (ordersError) {
      console.error("Paid order lookup failed:", ordersError.message);
      return jsonError("Could not load paid orders.", 500);
    }

    const orderIds = (orders ?? []).map((order) => order.id);

    if (orderIds.length === 0) {
      return NextResponse.json(
        { orders: [], deliveries: [] },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const { data: deliveries, error: deliveryError } = await db
      .from("bsg_deliveries")
      .select("*")
      .in("order_id", orderIds)
      .order("created_at", { ascending: false });

    if (deliveryError) {
      console.error("Delivery lookup failed:", deliveryError.message);
      return jsonError("Could not load delivery records.", 500);
    }

    return NextResponse.json(
      {
        orders: orders ?? [],
        deliveries: deliveries ?? [],
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Admin delivery GET error:", error);
    return jsonError("Unexpected server error.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getAdminContext();

    if (!context.ok) {
      return jsonError(context.error, context.status);
    }

    const { db, userId } = context;

    let body: {
      orderId?: string;
      deliveryMethod?: DeliveryMethod;
      thirdPartyProvider?: string;
      vehicleType?: string;
      vehicleNumber?: string;
      notes?: string;
    };

    try {
      body = await request.json();
    } catch {
      return jsonError("A valid JSON request body is required.", 400);
    }

    const orderId =
      typeof body.orderId === "string" ? body.orderId.trim() : "";

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!orderId || !uuidPattern.test(orderId)) {
      return jsonError("A valid checkout order ID is required.", 400);
    }

    const method = body.deliveryMethod ?? "BSG_DELIVERY";

    if (!isDeliveryMethod(method)) {
      return jsonError("The delivery method is invalid.", 400);
    }

    if (
      method === "THIRD_PARTY_REQUEST" &&
      (typeof body.thirdPartyProvider !== "string" ||
        !body.thirdPartyProvider.trim())
    ) {
      return jsonError(
        "Enter the requested third-party delivery provider.",
        400
      );
    }

    const { data: order, error: orderError } = await db
      .from("bsg_checkout_orders")
      .select("id, payment_status")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      console.error("Order verification failed:", orderError.message);
      return jsonError("Could not verify the order.", 500);
    }

    if (!order) {
      return jsonError("Checkout order not found.", 404);
    }

    if (order.payment_status !== "PAID") {
      return jsonError(
        "Only verified paid orders can be entered into delivery operations.",
        409
      );
    }

    const { data: existing, error: existingError } = await db
      .from("bsg_deliveries")
      .select("id")
      .eq("order_id", orderId)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error("Duplicate check failed:", existingError.message);
      return jsonError("Could not check existing delivery records.", 500);
    }

    if (existing) {
      return jsonError(
        "A delivery record already exists for this order.",
        409
      );
    }

    const status =
      method === "SELF_PICKUP"
        ? "Ready for Pickup"
        : method === "THIRD_PARTY_REQUEST"
          ? "Awaiting Quote"
          : "Pending Assignment";

    const { data: delivery, error: insertError } = await db
      .from("bsg_deliveries")
      .insert({
        order_id: orderId,
        delivery_method: method,
        third_party_provider:
          method === "THIRD_PARTY_REQUEST"
            ? body.thirdPartyProvider!.trim().slice(0, 200)
            : null,
        vehicle_type:
          typeof body.vehicleType === "string"
            ? body.vehicleType.trim().slice(0, 100) || null
            : null,
        vehicle_number:
          typeof body.vehicleNumber === "string"
            ? body.vehicleNumber.trim().slice(0, 100) || null
            : null,
        tracking_number:
          method === "BSG_DELIVERY" ? makeTrackingNumber() : null,
        status,
        notes:
          typeof body.notes === "string"
            ? body.notes.trim().slice(0, 2000) || null
            : null,
        assigned_by: null,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Delivery creation failed:", insertError.message);
      return jsonError("Could not create the delivery record.", 500);
    }

    return NextResponse.json({ delivery }, { status: 201 });
  } catch (error) {
    console.error("Admin delivery POST error:", error);
    return jsonError("Unexpected server error.", 500);
  }
}
