
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Platform location API environment variables are missing.");

    return NextResponse.json(
      { success: false, message: "Location service is unavailable." },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabase
      .from("platform_location_settings")
      .select(
        "company_name, address, region, city, landmark, latitude, longitude, is_configured"
      )
      .eq("id", 1)
      .eq("is_configured", true)
      .maybeSingle();

    if (error) {
      console.error("Could not read platform location:", error.message);

      return NextResponse.json(
        { success: false, message: "Could not load platform location." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({
        success: true,
        configured: false,
        location: null,
      });
    }

    return NextResponse.json({
      success: true,
      configured: true,
      location: {
        company_name: data.company_name,
        address: data.address,
        region: data.region,
        city: data.city,
        landmark: data.landmark,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
  } catch (error) {
    console.error("Platform location request failed:", error);

    return NextResponse.json(
      { success: false, message: "Could not load platform location." },
      { status: 500 }
    );
  }
}
