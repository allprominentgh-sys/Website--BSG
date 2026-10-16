
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

type DeliveryMethod =
  | "BSG_DELIVERY"
  | "SELLER_DELIVERY"
  | "SELF_PICKUP"
  | "THIRD_PARTY_REQUEST";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getAdminContext() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    return {
      ok: false as const,
      error: "Server configuration is incomplete.",
      status: 500,
    };
  }

  const authClient = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        try {
          values.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Cookie writes may not be available in this context.
        }
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return {
      ok: false as const,
      error: "Please sign in to continue.",
      status: 401,
    };
  }

  const { data: profile, error: profileError } = await authClient
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Admin profile check failed:", profileError.message);
    return {
      ok: false as const,
      error: "Unable to verify administrator permissions.",
      status: 500,
    };
  }

  const role = String(profile?.account_type ?? "")
    .trim()
    .toLowerCase();

  if (!["admin", "administrator"].includes(role)) {
    return {
      ok: false as const,
      error: "Administrator access is required.",
      status: 403,
    };
  }

  const db = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return { ok: true as const, userId: user.id, db };
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
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `BSG-${random.toUpperCase()}`;
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
      return NextResponse.json({ orders: [], deliveries: [] });
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

    return NextResponse.json({
      orders: orders ?? [],
      deliveries: deliveries ?? [],
    });
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

    const orderId = body.orderId?.trim();

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
      !body.thirdPartyProvider?.trim()
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
            ? body.thirdPartyProvider?.trim()
            : null,
        vehicle_type: body.vehicleType?.trim() || null,
        vehicle_number: body.vehicleNumber?.trim() || null,
        tracking_number:
          method === "BSG_DELIVERY" ? makeTrackingNumber() : null,
        status,
        notes: body.notes?.trim() || null,
        assigned_by: userId,
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
