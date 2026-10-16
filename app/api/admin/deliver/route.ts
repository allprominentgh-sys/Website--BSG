
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getAdminContext() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceKey) {
    throw new Error("Server Supabase environment variables are missing.");
  }

  const authClient = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Cookie updates may not be available in every server context.
        }
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return { error: "Please sign in.", status: 401 as const };
  }

  const { data: profile, error: profileError } = await authClient
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Admin profile verification failed:", profileError.message);
    return {
      error: "Unable to verify administrator permissions.",
      status: 500 as const,
    };
  }

  const role = String(profile?.account_type ?? "")
    .trim()
    .toLowerCase();

  if (!["admin", "administrator"].includes(role)) {
    return {
      error: "Administrator access is required.",
      status: 403 as const,
    };
  }

  const db = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return { user, db };
}

export async function GET() {
  try {
    const context = await getAdminContext();

    if ("error" in context) {
      return jsonError(context.error, context.status);
    }

    const { db } = context;

    const { data, error } = await db
      .from("bsg_checkout_orders")
      .select(
        "id, order_number, customer_name, customer_phone, delivery_address, delivery_region, delivery_city, delivery_fee, currency_code, payment_status, order_status, created_at"
      )
      .eq("payment_status", "PAID")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Paid checkout order lookup failed:", error.message);
      return jsonError("Could not load paid checkout orders.", 500);
    }

    const orderIds = (data ?? []).map((order) => order.id);

    let assignments: Record<string, unknown>[] = [];

    if (orderIds.length > 0) {
      const result = await db
        .from("bsg_deliveries")
        .select("*")
        .in("order_id", orderIds);

      if (result.error) {
        console.error("Delivery lookup failed:", result.error.message);
        return jsonError(
          "Could not load delivery assignments. Confirm the bsg_deliveries table was created.",
          500
        );
      }

      assignments = result.data ?? [];
    }

    return NextResponse.json({
      orders: data ?? [],
      deliveries: assignments,
    });
  } catch (error) {
    console.error("Admin delivery GET failed:", error);
    return jsonError("Unexpected server error.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getAdminContext();

    if ("error" in context) {
      return jsonError(context.error, context.status);
    }

    const { db, user } = context;

    let body: {
      orderId?: string;
      riderId?: string | null;
      vehicleType?: string;
      vehicleNumber?: string;
      notes?: string;
    };

    try {
      body = await request.json();
    } catch {
      return jsonError("Request body must be valid JSON.", 400);
    }

    const orderId = body.orderId?.trim();

    if (!orderId) {
      return jsonError("A checkout order ID is required.", 400);
    }

    if (
      body.riderId &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.riderId)
    ) {
      return jsonError("The rider ID must be a valid user UUID.", 400);
    }

    const { data: order, error: orderError } = await db
      .from("bsg_checkout_orders")
      .select("id, payment_status")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      console.error("Checkout order verification failed:", orderError.message);
      return jsonError("Could not verify the checkout order.", 500);
    }

    if (!order) {
      return jsonError("Checkout order not found.", 404);
    }

    if (order.payment_status !== "PAID") {
      return jsonError(
        "Only verified paid checkout orders can be assigned for delivery.",
        409
      );
    }

    const { data: existing, error: existingError } = await db
      .from("bsg_deliveries")
      .select("id")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existingError) {
      console.error("Existing delivery lookup failed:", existingError.message);
      return jsonError(
        "Could not check existing delivery assignments. Confirm the delivery table exists.",
        500
      );
    }

    if (existing) {
      return jsonError(
        "This order already has a delivery record. Update that record instead.",
        409
      );
    }

    if (body.riderId) {
      const { data: rider, error: riderError } = await db
        .from("profiles")
        .select("id, account_type")
        .eq("id", body.riderId)
        .maybeSingle();

      if (riderError) {
        return jsonError("Could not verify the assigned rider.", 500);
      }

      const riderRole = String(rider?.account_type ?? "")
        .trim()
        .toLowerCase();

      if (
        !rider ||
        !["delivery", "delivery_staff", "rider", "driver"].includes(riderRole)
      ) {
        return jsonError(
          "The selected user is not registered with an approved delivery role.",
          400
        );
      }
    }

    const { data: delivery, error: insertError } = await db
      .from("bsg_deliveries")
      .insert({
        order_id: orderId,
        rider_id: body.riderId || null,
        status: body.riderId ? "Assigned" : "Pending Assignment",
        vehicle_type: body.vehicleType?.trim() || null,
        vehicle_number: body.vehicleNumber?.trim() || null,
        notes: body.notes?.trim() || null,
        assigned_by: user.id,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Delivery creation failed:", insertError.message);
      return jsonError("Could not create the delivery record.", 500);
    }

    return NextResponse.json({ delivery }, { status: 201 });
  } catch (error) {
    console.error("Admin delivery POST failed:", error);
    return jsonError("Unexpected server error.", 500);
  }
}
