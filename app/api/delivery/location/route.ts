
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GPSBody = {
  deliveryId?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  accuracyMeters?: unknown;
  headingDegrees?: unknown;
  speedMetersPerSecond?: unknown;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase server configuration is incomplete.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getAuthenticatedUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase authentication configuration is incomplete.");
  }

  const cookieStore = cookies();

  const supabase = createServerClient(url, key, {
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
          // Some rendering contexts do not allow cookie mutation.
        }
      },
    },
  });

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

async function getAssignedDelivery(
  deliveryId: string,
  userId: string
) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("bsg_deliveries")
    .select("id, rider_id")
    .eq("id", deliveryId)
    .maybeSingle();

  if (error) {
    throw new Error("Could not verify the delivery assignment.");
  }

  if (!data || data.rider_id !== userId) {
    return null;
  }

  return data;
}

// POST: Save the authenticated rider's latest GPS position.
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return jsonError("Please sign in before sharing your location.", 401);
    }

    let body: GPSBody;

    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid request body.", 400);
    }

    const deliveryId =
      typeof body.deliveryId === "string" ? body.deliveryId : "";

    if (!UUID_PATTERN.test(deliveryId)) {
      return jsonError("A valid delivery ID is required.", 400);
    }

    const latitude = body.latitude;
    const longitude = body.longitude;
    const accuracy = body.accuracyMeters;
    const heading = body.headingDegrees;
    const speed = body.speedMetersPerSecond;

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
      return jsonError("Invalid GPS coordinates.", 400);
    }

    if (
      accuracy != null &&
      (typeof accuracy !== "number" ||
        !Number.isFinite(accuracy) ||
        accuracy < 0 ||
        accuracy > 100000)
    ) {
      return jsonError("Invalid GPS accuracy.", 400);
    }

    if (
      heading != null &&
      (typeof heading !== "number" ||
        !Number.isFinite(heading) ||
        heading < 0 ||
        heading > 360)
    ) {
      return jsonError("Invalid GPS heading.", 400);
    }

    if (
      speed != null &&
      (typeof speed !== "number" ||
        !Number.isFinite(speed) ||
        speed < 0)
    ) {
      return jsonError("Invalid GPS speed.", 400);
    }

    const delivery = await getAssignedDelivery(deliveryId, user.id);

    if (!delivery) {
      return jsonError(
        "You are not assigned to this delivery.",
        403
      );
    }

    const admin = createAdminClient();

    const { error } = await admin
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

    if (error) {
      console.error("GPS save failed:", error.message);
      return jsonError("Could not save the GPS location.", 500);
    }

    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GPS POST error:", error);

    return jsonError(
      "Unable to process the GPS update. Check server configuration.",
      500
    );
  }
}

// GET: Read the latest GPS position for the assigned rider.
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return jsonError("Please sign in.", 401);
    }

    const deliveryId =
      request.nextUrl.searchParams.get("deliveryId") ?? "";

    if (!UUID_PATTERN.test(deliveryId)) {
      return jsonError("A valid delivery ID is required.", 400);
    }

    const delivery = await getAssignedDelivery(deliveryId, user.id);

    if (!delivery) {
      return jsonError(
        "You are not authorised to view this delivery location.",
        403
      );
    }

    const admin = createAdminClient();

    const { data, error } = await admin
      .from("bsg_delivery_live_locations")
      .select(
        "rider_id, latitude, longitude, accuracy_meters, heading_degrees, speed_meters_per_second, updated_at"
      )
      .eq("rider_id", delivery.rider_id)
      .maybeSingle();

    if (error) {
      console.error("GPS read failed:", error.message);
      return jsonError("Could not load the latest location.", 500);
    }

    return NextResponse.json({
      success: true,
      location: data ?? null,
    });
  } catch (error) {
    console.error("GPS GET error:", error);

    return jsonError(
      "Unable to load the delivery location. Check server configuration.",
      500
    );
  }
}
