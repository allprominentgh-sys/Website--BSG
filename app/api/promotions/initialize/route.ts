
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PACKAGES = {
  premium: {
    bit: 1,
    setting: "individual_premium_price",
  },
  priority: {
    bit: 2,
    setting: "individual_priority_price",
  },
  "top-priority": {
    bit: 4,
    setting: "individual_top_priority_price",
  },
} as const;

const ALLOWED_MONTHS = [1, 2, 3, 6, 12] as const;

type Tier = keyof typeof PACKAGES;

type AdvertisingSettingRow = {
  setting_key: string;
  setting_value: number | string;
};

type ListingRecord = {
  id: number | string;
  seller_id: string;
  title: string;
};

type PromotionRecord = {
  id: string | number;
};

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function POST(request: NextRequest) {
  let supabase: ReturnType<typeof createClient> | null = null;
  let promotionId: string | null = null;
  let userId: string | null = null;

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

    supabase = createClient(supabaseUrl, serviceRoleKey, {
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

    userId = user.id;

    if (!user.email) {
      return NextResponse.json(
        { error: "Your account needs an email address for payment." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const listingId = String(body.listingId ?? "");
    const tier = String(body.tier ?? body.packageId ?? "");
    const durationMonths = Number(body.durationMonths);

    if (!/^\d+$/.test(listingId)) {
      return NextResponse.json(
        { error: "Choose a valid advertisement." },
        { status: 400 }
      );
    }

    if (!Object.prototype.hasOwnProperty.call(PACKAGES, tier)) {
      return NextResponse.json(
        {
          error:
            "Choose Premium, Priority or Top Priority. Refresh the page and try again.",
        },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_MONTHS.includes(
        durationMonths as (typeof ALLOWED_MONTHS)[number]
      )
    ) {
      return NextResponse.json(
        { error: "Choose a duration of 1, 2, 3, 6 or 12 months." },
        { status: 400 }
      );
    }

    const selectedTier = PACKAGES[tier as Tier];
    const numericListingId = Number(listingId);

    if (!Number.isSafeInteger(numericListingId)) {
      return NextResponse.json(
        { error: "The advertisement ID is invalid." },
        { status: 400 }
      );
    }

    // Verify ownership of the selected listing.
    const {
      data: rawListing,
      error: listingError,
    } = await supabase
      .from("listings")
      .select("id, seller_id, title")
      .eq("id", numericListingId)
      .eq("seller_id", user.id)
      .maybeSingle();

    if (listingError || !rawListing) {
      console.error("Listing verification failed:", listingError);

      return NextResponse.json(
        { error: "The selected advertisement could not be verified." },
        { status: 404 }
      );
    }

    const listing = rawListing as unknown as ListingRecord;

    // Read pricing and discount configuration from Supabase.
    const requiredKeys = [
      selectedTier.setting,
      "promotion_discount_percent",
      "promotion_discount_packages",
    ];

    const {
      data: rawSettings,
      error: settingsError,
    } = await supabase
      .from("advertising_settings")
      .select("setting_key, setting_value")
      .in("setting_key", requiredKeys);

    if (settingsError || !rawSettings) {
      console.error("Promotion settings read failed:", settingsError);

      return NextResponse.json(
        { error: "Could not load promotion prices. Please try again later." },
        { status: 500 }
      );
    }

    const settings = rawSettings as unknown as AdvertisingSettingRow[];

    const settingMap = new Map<string, number>(
      settings.map((item) => [
        item.setting_key,
        Number(item.setting_value),
      ])
    );

    const monthlyPrice = settingMap.get(selectedTier.setting);
    const discountSetting = settingMap.get("promotion_discount_percent");
    const eligiblePackages = settingMap.get("promotion_discount_packages");

    if (
      monthlyPrice === undefined ||
      !Number.isFinite(monthlyPrice) ||
      monthlyPrice <= 0 ||
      discountSetting === undefined ||
      !Number.isFinite(discountSetting) ||
      discountSetting < 0 ||
      discountSetting > 100 ||
      eligiblePackages === undefined ||
      !Number.isInteger(eligiblePackages) ||
      eligiblePackages < 0 ||
      eligiblePackages > 7
    ) {
      console.error("Invalid promotion settings:", {
        monthlyPrice,
        discountSetting,
        eligiblePackages,
      });

      return NextResponse.json(
        {
          error:
            "Promotion pricing settings are invalid. Please contact support.",
        },
        { status: 500 }
      );
    }

    // Premium = 1, Priority = 2, Top Priority = 4.
    const baseAmount = roundMoney(monthlyPrice * durationMonths);

    const discountEligible =
      (eligiblePackages & selectedTier.bit) !== 0;

    const appliedDiscount = discountEligible ? discountSetting : 0;

    const finalAmount = roundMoney(
      baseAmount * (1 - appliedDiscount / 100)
    );

    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      return NextResponse.json(
        {
          error:
            "The final payment must be greater than GH₵0. Check the admin pricing settings.",
        },
        { status: 400 }
      );
    }

    // Paystack requires the amount in pesewas.
    const amountPesewas = Math.round(finalAmount * 100);

    if (!Number.isSafeInteger(amountPesewas) || amountPesewas <= 0) {
      return NextResponse.json(
        { error: "The calculated payment amount is invalid." },
        { status: 400 }
      );
    }

    const reference = `bsgpromo_${randomBytes(16).toString("hex")}`;

    const promotionInsert = {
      user_id: user.id,
      listing_id: numericListingId,
      package_id: tier,
      duration_days: durationMonths * 30,
      duration_months: durationMonths,
      base_amount: baseAmount,
      discount_percent: appliedDiscount,
      amount: finalAmount,
      currency_code: "GHS",
      payment_reference: reference,
      payment_status: "PENDING",
      promotion_status: "PENDING",
    };

    // The database remains responsible for validating the real columns.
    const {
      data: rawPromotion,
      error: insertError,
    } = await (supabase as any)
      .from("promotion_requests")
      .insert(promotionInsert)
      .select("id")
      .single();

    if (insertError || !rawPromotion) {
      console.error("Promotion request save failed:", insertError);

      return NextResponse.json(
        { error: "Could not save your promotion request." },
        { status: 500 }
      );
    }

    const promotion = rawPromotion as PromotionRecord;
    promotionId = String(promotion.id);

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
            package_id: tier,
            duration_months: durationMonths,
            base_amount: baseAmount,
            discount_percent: appliedDiscount,
            final_amount: finalAmount,
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

      await (supabase as any)
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
      pricing: {
        tier,
        durationMonths,
        monthlyPrice,
        baseAmount,
        discountPercent: appliedDiscount,
        finalAmount,
        currency: "GHS",
      },
    });
  } catch (error) {
    console.error("Promotion initialization error:", error);

    if (supabase && promotionId && userId) {
      try {
        await (supabase as any)
          .from("promotion_requests")
          .update({ payment_status: "FAILED" })
          .eq("id", promotionId)
          .eq("user_id", userId)
          .eq("payment_status", "PENDING");
      } catch (updateError) {
        console.error(
          "Could not update failed promotion:",
          updateError
        );
      }
    }

    return NextResponse.json(
      { error: "An unexpected error occurred while preparing payment." },
      { status: 500 }
    );
  }
}
