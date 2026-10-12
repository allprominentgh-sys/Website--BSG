
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "node:crypto";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "bsg_admin_session";
const ADMIN_EMAIL = "admin@bestsalesgh.com";

function verifyAdmin(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!secret || !token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;

  try {
    const expected = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);

    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return false;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    return (
      session.email === ADMIN_EMAIL &&
      typeof session.expiresAt === "number" &&
      session.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing server-side Supabase environment variables.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in as Admin." },
      { status: 401 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const search = request.nextUrl.searchParams.get("search")?.trim() || "";

    let query = supabase
      .from("listings")
      .select(
        "id, seller_id, category_id, title, description, price, currency_code, location, status, featured, created_at, category, subcategory, currency, item_region, item_city, item_area"
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (search) {
      const safeSearch = search.replace(/[,%()]/g, " ");
      query = query.ilike("title", `%${safeSearch}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Admin listings query failed:", error.message);
      return NextResponse.json(
        { error: "Unable to load listings." },
        { status: 500 }
      );
    }

    return NextResponse.json({ listings: data ?? [] });
  } catch (error) {
    console.error("Admin listings GET failed:", error);
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in as Admin." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const id = body?.id;

    if (
      (typeof id !== "string" && typeof id !== "number") ||
      !/^\d+$/.test(String(id))
    ) {
      return NextResponse.json(
        { error: "A valid listing ID is required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: listing, error: lookupError } = await supabase
      .from("listings")
      .select("id, title")
      .eq("id", Number(id))
      .maybeSingle();

    if (lookupError) {
      console.error("Listing lookup failed:", lookupError.message);
      return NextResponse.json(
        { error: "Unable to verify this listing." },
        { status: 500 }
      );
    }

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found. It may already have been removed." },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", Number(id));

    if (deleteError) {
      console.error("Listing deletion failed:", deleteError.message);
      return NextResponse.json(
        {
          error:
            "The listing could not be deleted. Check related database records and constraints.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully.",
      id: Number(id),
    });
  } catch (error) {
    console.error("Admin listings DELETE failed:", error);
    return NextResponse.json(
      { error: "Unable to complete the deletion." },
      { status: 500 }
    );
  }
}
