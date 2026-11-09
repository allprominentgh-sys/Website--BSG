
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "admin@bestsalesgh.com";
const COOKIE_NAME = "bsg_admin_session";
const PAGE_SIZE = 1000;

function signSession(payload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
}

function verifyAdminSession(token: string, secret: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, suppliedSignature] = parts;
  const expectedSignature = signSession(payload, secret);

  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);

  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return false;
  }

  try {
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

export async function GET(request: NextRequest) {
  try {
    // Confirm the administrator session before using the service-role client.
    const secret = process.env.ADMIN_SESSION_SECRET;
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!secret || !token || !verifyAdminSession(token, secret)) {
      return NextResponse.json(
        { error: "Administrator access required." },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const supabase = getSupabaseAdmin();

    // Load every seller/business profile in pages.
    const sellers: Record<string, unknown>[] = [];

    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, phone, location, account_type, verified, verification_status, created_at, delivery_region, delivery_city, delivery_area, delivery_address, ghana_post_gps"
        )
        .in("account_type", ["seller", "business", "individual", "company"])
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) throw error;

      const page = data ?? [];
      sellers.push(...page);

      if (page.length < PAGE_SIZE) break;
    }

    if (sellers.length === 0) {
      return NextResponse.json(
        { sellers: [], listings: [], listingNotice: "" },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const sellerIds = sellers.map((seller) => String(seller.id));
    const listings: Record<string, unknown>[] = [];

    // Load listings belonging to all returned seller profiles.
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .in("seller_id", sellerIds)
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.error("ADMIN SELLER LISTINGS ERROR:", error);

        return NextResponse.json(
          {
            sellers,
            listings: [],
            listingNotice:
              "Seller profiles loaded, but listings could not be loaded: " +
              error.message,
          },
          { headers: { "Cache-Control": "no-store" } }
        );
      }

      const page = data ?? [];
      listings.push(...page);

      if (page.length < PAGE_SIZE) break;
    }

    return NextResponse.json(
      {
        sellers,
        listings,
        listingNotice: "",
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("ADMIN SELLERS API ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load seller records.",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
