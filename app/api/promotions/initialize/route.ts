
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

const packages = {
  "7-day": { durationDays: 7, amount: 50 },
  "14-day": { durationDays: 14, amount: 90 },
  "30-day": { durationDays: 30, amount: 180 },
} as const;

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!secretKey || !siteUrl || !supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Payment configuration is incomplete." },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!accessToken) {
      return NextResponse.json(
        { error: "Please sign in before promoting an advertisement." },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const listingId = String(body.listingId ?? "");
    const packageId = String(body.packageId ?? "");

    if (
      !/^\d+$/.test(listingId) ||
      !Object.prototype.hasOwnProperty.call(packages, packageId)
    ) {
      return NextResponse.json(
        { error: "Choose a valid advertisement and promotion package." },
        { status: 400 }
      );
    }

    const chosenPackage =
      packages[packageId as keyof typeof packages];

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, seller_id, title")
      .eq("id", Number(listingId))
      .eq("seller_id", user.id)
      .maybeSingle();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: "The selected advertisement could not be verified." },
        { status: 404 }
      );
    }

    const reference = `bsgpromo_${randomBytes(16).toString("hex")}`;
    const amountPesewas = chosenPackage.amount * 100;

    const { data: promotion, error: insertError } = await supabase
      .from("promotion_requests")
      .insert({
        user_id: user.id,
        listing_id: Number(listingId),
        package_id: packageId,
        duration_days: chosenPackage.durationDays,
        amount: chosenPackage.amount,
        currency_code: "GHS",
        payment_reference: reference,
        payment_status: "PENDING",
        promotion_status: "PENDING",
      })
      .select("id")
      .single();

    if (insertError || !promotion) {
      console.error("Promotion request save failed:", insertError);
      return NextResponse.json(
        { error: "Could not save your promotion request." },
        { status: 500 }
      );
    }

    const callbackUrl =
      `${siteUrl.replace(/\/+$/, "")}/payment/callback`;

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: amountPesewas,
          currency: "GHS",
          reference,
          callback_url: callbackUrl,
          metadata: {
            purpose: "advertisement_promotion",
            promotion_request_id: promotion.id,
            listing_id: listing.id,
            package_id: packageId,
          },
        }),
        cache: "no-store",
      }
    );

    const paystackResult = await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      paystackResult.status !== true ||
      !paystackResult.data?.authorization_url
    ) {
      console.error(
        "Paystack promotion initialization failed:",
        paystackResult.message
      );

      await supabase
        .from("promotion_requests")
        .update({ payment_status: "FAILED" })
        .eq("id", promotion.id)
        .eq("user_id", user.id);

      return NextResponse.json(
        { error: "Paystack could not start payment. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorizationUrl: paystackResult.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error("Promotion initialization error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while preparing payment." },
      { status: 500 }
    );
  }
}
