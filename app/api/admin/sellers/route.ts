import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function isValidAdminSession(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = request.cookies.get("bsg_admin_session")?.value;

  if (!secret || !token) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [payload, signature] = parts;

    const expected = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return false;
    }

    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    return (
      decoded.email === "admin@bestsalesgh.com" &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

function getSupabaseAdmin() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET(request: NextRequest) {
  if (!isValidAdminSession(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in as an administrator." },
      { status: 401 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: listings, error: listingsError } = await supabase
      .from("listings")
      .select(
        "id,seller_id,title,description,price,currency_code,status,featured,created_at,category,subcategory,location"
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (listingsError) throw listingsError;

    const sellerIds = [
      ...new Set(
        (listings || [])
          .map((listing) => listing.seller_id)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    let profiles: {
      id: string;
      full_name: string | null;
      phone: string | null;
      account_type: string | null;
      verified: boolean | null;
      verification_status: string | null;
    }[] = [];

    if (sellerIds.length > 0) {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id,full_name,phone,account_type,verified,verification_status"
        )
        .in("id", sellerIds);

      if (error) throw error;
      profiles = data || [];
    }

    const profileMap = new Map(
      profiles.map((profile) => [profile.id, profile])
    );

    const result = (listings || []).map((listing) => ({
      ...listing,
      seller: listing.seller_id
        ? profileMap.get(listing.seller_id) || null
        : null,
    }));

    return NextResponse.json(
      { listings: result },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Admin sellers API error:", error);

    return NextResponse.json(
      { error: "Unable to load seller listings. Check the server configuration and database columns." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!isValidAdminSession(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in as an administrator." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const listingId = body?.listingId;

    if (
      (typeof listingId !== "string" &&
        typeof listingId !== "number") ||
      String(listingId).trim() === ""
    ) {
      return NextResponse.json(
        { error: "A valid listing ID is required." },
        { status: 400 }
      );
    }

    const updates: {
      status?: string;
      featured?: boolean;
    } = {};

    if (typeof body.status === "string") {
      const allowedStatuses = [
        "active",
        "pending",
        "rejected",
        "inactive",
        "sold",
      ];

      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid listing status." },
          { status: 400 }
        );
      }

      updates.status = body.status;
    }

    if (typeof body.featured === "boolean") {
      updates.featured = body.featured;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid changes were provided." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("listings")
      .update(updates)
      .eq("id", listingId)
      .select("id,status,featured")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "Listing not found or could not be updated." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Listing updated successfully.",
      listing: data,
    });
  } catch (error) {
    console.error("Admin listing update error:", error);

    return NextResponse.json(
      { error: "Unable to update listing." },
      { status: 500 }
    );
  }
}
