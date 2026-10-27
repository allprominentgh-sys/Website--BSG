
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json(
        { message: "Server configuration is incomplete." },
        { status: 500 }
      );
    }

    // Verify the signed-in user using the existing Supabase session.
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
            // Route handlers may not always permit cookie mutation.
          }
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "Please sign in before sharing your location." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const deliveryId =
      typeof body.deliveryId === "string" ? body.deliveryId : "";

    const latitude = body.latitude;
    const longitude = body.longitude;
    const accuracy = body.accuracyMeters;
    const heading = body.headingDegrees;
    const speed = body.speedMetersPerSecond;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(deliveryId)) {
      return NextResponse.json(
        { message: "A valid delivery ID is required." },
        { status: 400 }
      );
    }

    if (
      typeof latitude !== "number" ||
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      typeof longitude !== "number" ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { message: "Invalid GPS coordinates." },
        { status: 400 }
      );
    }

    if (
      accuracy != null &&
      (typeof accuracy !== "number" ||
        !Number.isFinite(accuracy) ||
        accuracy < 0 ||
        accuracy > 100000)
    ) {
      return NextResponse.json(
        { message: "Invalid GPS accuracy." },
        { status: 400 }
      );
    }

    if (
      heading != null &&
      (typeof heading !== "number" ||
        !Number.isFinite(heading) ||
        heading < 0 ||
        heading > 360)
    ) {
      return NextResponse.json(
        { message: "Invalid GPS heading." },
        { status: 400 }
      );
    }

    if (
      speed != null &&
      (typeof speed !== "number" ||
        !Number.isFinite(speed) ||
        speed < 0)
    ) {
      return NextResponse.json(
        { message: "Invalid GPS speed." },
        { status: 400 }
      );
    }

    // Keep the service-role key on the server only.
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Confirm this authenticated user is the assigned rider.
    const { data: delivery, error: deliveryError } = await admin
      .from("bsg_deliveries")
      .select("id, rider_id")
      .eq("id", deliveryId)
      .maybeSingle();

    if (deliveryError) {
      console.error("Delivery lookup failed:", deliveryError.message);

      return NextResponse.json(
        { message: "Could not verify the delivery assignment." },
        { status: 500 }
      );
    }

    if (!delivery || delivery.rider_id !== user.id) {
      return NextResponse.json(
        { message: "You are not assigned to this delivery." },
        { status: 403 }
      );
    }

    const { error: saveError } = await admin
      .from("bsg_delivery_live_locations")
      .upsert(
        {
          rider_id: user.id,
          latitude,
          longitude,
          accuracy_meters: accuracy ?? null,
          heading_degrees: heading ?? null,
          speed_meters_per_second: speed ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "rider_id" }
      );

    if (saveError) {
      console.error("GPS save failed:", saveError.message);

      return NextResponse.json(
        { message: "Could not save the GPS location." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GPS endpoint error:", error);

    return NextResponse.json(
      { message: "Unable to process the GPS update." },
      { status: 500 }
    );
  }
}
