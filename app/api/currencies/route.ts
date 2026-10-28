
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Currency service is not configured." },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabase
      .from("currencies")
      .select("code, manual_rate_from_ghs, rate_source")
      .in("code", ["GHS", "CNY", "USD", "EUR", "GBP"]);

    if (error) {
      console.error("Could not load public currency rates:", error);
      return NextResponse.json(
        { error: "Could not load currency rates." },
        { status: 500 }
      );
    }

    const rates: Record<string, number> = {};

    for (const item of data ?? []) {
      const rate = Number(item.manual_rate_from_ghs);

      if (item.code === "GHS") {
        rates.GHS = 1;
      } else if (Number.isFinite(rate) && rate > 0) {
        rates[item.code] = rate;
      }
    }

    return NextResponse.json(
      { rates },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Public currency endpoint error:", error);

    return NextResponse.json(
      { error: "Unexpected currency service error." },
      { status: 500 }
    );
  }
}
