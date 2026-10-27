
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawAddress =
      typeof body?.address === "string" ? body.address.trim() : "";

    // Accept standard GhanaPostGPS formats such as GA-543-0125.
    const address = rawAddress.toUpperCase().replace(/\s+/g, "");

    if (!/^[A-Z]{2,3}-\d{3,4}-\d{3,4}$/.test(address)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid GhanaPostGPS address, for example GA-543-0125.",
        },
        { status: 400 }
      );
    }

    const url = new URL("https://api.afrihex.com/v2/lookup");
    url.searchParams.set("address", address);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            response.status === 404
              ? "That address could not be found. Check the code and try again."
              : "The address lookup service is temporarily unavailable.",
        },
        { status: response.status === 404 ? 404 : 502 }
      );
    }

    const result = await response.json();
    const data = result?.data;

    const latitude = Number(data?.center_latitude ?? data?.latitude);
    const longitude = Number(data?.center_longitude ?? data?.longitude);

    if (
      result?.success !== true ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < 4.5 ||
      latitude > 11.5 ||
      longitude < -3.5 ||
      longitude > 1.5
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "We could not verify coordinates for that GhanaPostGPS address.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      address: data.gps_name ?? address,
      latitude,
      longitude,
      region: data.region ?? null,
      district: data.district ?? null,
      area: data.area ?? null,
      street: data.street ?? null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to resolve the address right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
