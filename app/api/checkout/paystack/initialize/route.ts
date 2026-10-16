import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey || !paystackSecretKey) {
      return NextResponse.json(
        { error: "Payment service is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const customerName = String(body.customerName ?? "").trim();
    const customerEmail = String(body.customerEmail ?? "")
      .trim()
      .toLowerCase();
    const customerPhone = String(body.customerPhone ?? "").trim();
    const deliveryAddress = String(body.deliveryAddress ?? "").trim();
    const deliveryRegion = String(body.deliveryRegion ?? "").trim();
    const deliveryCity = String(body.deliveryCity ?? "").trim();
    const deliveryLandmark = String(body.deliveryLandmark ?? "").trim();

    if (
      !customerName ||
      !customerEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) ||
      !customerPhone ||
      !deliveryAddress ||
      !deliveryRegion ||
      !deliveryCity
    ) {
      return NextResponse.json(
        { error: "Please provide valid customer and delivery details." },
        { status: 400 }
      );
    }

    // Do not accept prices or totals supplied by the browser.
    // Product lookup, stock checks, and server-side total calculation
    // must be connected before this endpoint is used for live orders.
    const { data: location, error: locationError } =
      await supabaseAdmin
        .from("platform_location_settings")
        .select(
          "company_name,address,region,city,landmark,latitude,longitude,is_configured"
        )
        .eq("id", 1)
        .maybeSingle();

    if (locationError) {
      return NextResponse.json(
        { error: "Could not load platform delivery settings." },
        { status: 500 }
      );
    }

    if (!location?.is_configured) {
      return NextResponse.json(
        { error: "The platform location must be configured by an admin first." },
        { status: 409 }
      );
    }

    // Temporary safety gate: never initialize a charge using a
    // browser-supplied amount. The real checkout must calculate this
    // from verified listing prices and an approved delivery fee.
    return NextResponse.json(
      {
        error:
          "Checkout is not enabled yet. Server-side product pricing, stock validation, and delivery fees must be connected first.",
      },
      { status: 409 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
