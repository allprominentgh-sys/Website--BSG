
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PromotionRecord = {
  id: string | number;
  user_id: string;
  listing_id: number;
  package_id: string;
  amount: number | string;
  currency_code: string;
  payment_reference: string | null;
  payment_status: string;
  promotion_status: string;
  duration_days: number;
  duration_months: number | null;
  starts_at: string | null;
  ends_at: string | null;
  btool_selected: boolean | null;
};

const ALLOWED_MONTHS = [1, 2, 3, 6, 12] as const;

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const originalDay = result.getUTCDate();

  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);

  const lastDayOfTargetMonth = new Date(
    Date.UTC(
      result.getUTCFullYear(),
      result.getUTCMonth() + 1,
      0
    )
  ).getUTCDate();

  result.setUTCDate(Math.min(originalDay, lastDayOfTargetMonth));

  return result;
}

async function ensureBtoolEntitlement(
  supabase: any,
  promotion: PromotionRecord,
  startsAt: string | null,
  endsAt: string | null
): Promise<{ success: boolean }> {
  if (promotion.btool_selected !== true) {
    return { success: true };
  }

  if (!promotion.payment_reference || !endsAt) {
    console.error(
      "BTool entitlement is missing its payment reference or expiry:",
      promotion.id
    );

    return { success: false };
  }

  const { error } = await supabase
    .from("btool_entitlements")
    .upsert(
      {
        user_id: promotion.user_id,
        promotion_request_id: String(promotion.id),
        payment_reference: promotion.payment_reference,
        status: "active",
        activated_at: startsAt ?? new Date().toISOString(),
        expires_at: endsAt,
      },
      { onConflict: "payment_reference" }
    );

  if (error) {
    console.error("BTool entitlement activation failed:", error);
    return { success: false };
  }

  return { success: true };
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    if (!supabaseUrl || !serviceRoleKey || !paystackSecret) {
      return NextResponse.json(
        { error: "Payment verification is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const reference =
      typeof body.reference === "string"
        ? body.reference.trim()
        : "";

    if (!/^[A-Za-z0-9_-]{8,100}$/.test(reference)) {
      return NextResponse.json(
        { error: "A valid payment reference is required." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Retrieve the saved promotion associated with this reference.
    const {
      data: rawPromotion,
      error: lookupError,
    } = await supabase
      .from("promotion_requests")
      .select(
        "id, user_id, listing_id, package_id, amount, currency_code, payment_reference, payment_status, promotion_status, duration_days, duration_months, starts_at, ends_at, btool_selected"
      )
      .eq("payment_reference", reference)
      .maybeSingle();

    if (lookupError) {
      console.error("Promotion lookup failed:", lookupError);

      return NextResponse.json(
        { error: "Could not find the promotion payment record." },
        { status: 500 }
      );
    }

    if (!rawPromotion) {
      return NextResponse.json(
        { error: "No promotion request matches this reference." },
        { status: 404 }
      );
    }

    const promotion = rawPromotion as unknown as PromotionRecord;

    // Confirm payment directly with Paystack.
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const paystackResult = await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      paystackResult.status !== true ||
      !paystackResult.data
    ) {
      console.error(
        "Paystack verification failed:",
        paystackResult.message
      );

      return NextResponse.json(
        { error: "Paystack could not verify this transaction." },
        { status: 502 }
      );
    }

    const payment = paystackResult.data;

    if (payment.reference !== reference) {
      return NextResponse.json(
        { error: "The verified payment reference does not match." },
        { status: 400 }
      );
    }

    if (payment.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          status: payment.status,
          message: "Payment has not been confirmed as successful.",
        },
        { status: 402 }
      );
    }

    // Compare Paystack's actual amount with the saved total.
    // The saved total includes GH₵70 when BTool was selected.
    const expectedAmountPesewas = Math.round(
      Number(promotion.amount) * 100
    );

    if (
      !Number.isSafeInteger(expectedAmountPesewas) ||
      expectedAmountPesewas <= 0 ||
      Number(payment.amount) !== expectedAmountPesewas
    ) {
      console.error("Promotion payment amount mismatch:", {
        reference,
        expectedAmountPesewas,
        receivedAmount: payment.amount,
      });

      return NextResponse.json(
        { error: "The payment amount does not match the promotion price." },
        { status: 400 }
      );
    }

    if (
      String(payment.currency).toUpperCase() !== "GHS" ||
      String(promotion.currency_code).toUpperCase() !== "GHS"
    ) {
      return NextResponse.json(
        { error: "The payment currency does not match the promotion." },
        { status: 400 }
      );
    }

    // Repeated callbacks must not extend the promotion a second time.
    // If entitlement creation previously failed, retry it safely.
    if (promotion.payment_status === "PAID") {
      const entitlement = await ensureBtoolEntitlement(
        supabase,
        promotion,
        promotion.starts_at,
        promotion.ends_at
      );

      if (!entitlement.success) {
        return NextResponse.json(
          {
            error:
              "Payment is confirmed, but BTool access could not be saved. Retry verification or contact support.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        status: "success",
        reference,
        promotionStatus: promotion.promotion_status,
        btoolSelected: promotion.btool_selected === true,
        message: "This promotion payment has already been verified.",
      });
    }

    if (promotion.payment_status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          status: promotion.payment_status,
          message:
            "This promotion payment is not pending. Please contact support.",
        },
        { status: 409 }
      );
    }

    const validPackages = [
      "premium",
      "priority",
      "top-priority",
    ];

    if (!validPackages.includes(promotion.package_id)) {
      return NextResponse.json(
        {
          error:
            "This payment belongs to an older promotion package. Contact support to have it reviewed.",
        },
        { status: 409 }
      );
    }

    const durationMonths = Number(promotion.duration_months);

    if (
      !ALLOWED_MONTHS.includes(
        durationMonths as (typeof ALLOWED_MONTHS)[number]
      )
    ) {
      return NextResponse.json(
        { error: "The saved promotion duration is invalid." },
        { status: 400 }
      );
    }

    const startsAtDate = new Date();
    const endsAtDate = addMonths(startsAtDate, durationMonths);

    const startsAt = startsAtDate.toISOString();
    const endsAt = endsAtDate.toISOString();

    // Mark the promotion paid only if it is still pending.
    const {
      data: updatedRows,
      error: updateError,
    } = await supabase
      .from("promotion_requests")
      .update({
        payment_status: "PAID",
        promotion_status: "ACTIVE",
        starts_at: startsAt,
        ends_at: endsAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", promotion.id)
      .eq("payment_reference", reference)
      .eq("payment_status", "PENDING")
      .select("id, payment_status, promotion_status, starts_at, ends_at");

    if (updateError) {
      console.error("Promotion activation failed:", updateError);

      return NextResponse.json(
        {
          error:
            "Paystack confirmed payment, but activation could not be saved. Contact support before paying again.",
        },
        { status: 500 }
      );
    }

    // Handle another callback processing the same payment first.
    if (!updatedRows || updatedRows.length === 0) {
      const { data: current, error: currentError } = await supabase
        .from("promotion_requests")
        .select(
          "payment_status, promotion_status, starts_at, ends_at"
        )
        .eq("id", promotion.id)
        .maybeSingle();

      if (
        currentError ||
        !current ||
        current.payment_status !== "PAID"
      ) {
        return NextResponse.json(
          {
            error:
              "The payment was verified, but the promotion status needs review.",
          },
          { status: 409 }
        );
      }

      const entitlement = await ensureBtoolEntitlement(
        supabase,
        promotion,
        current.starts_at,
        current.ends_at
      );

      if (!entitlement.success) {
        return NextResponse.json(
          {
            error:
              "The promotion is active, but BTool access could not be saved. Retry verification or contact support.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        status: "success",
        reference,
        promotionStatus: current.promotion_status,
        btoolSelected: promotion.btool_selected === true,
        message: "This promotion payment has already been processed.",
      });
    }

    const activated = updatedRows[0];

    // Create the entitlement only for a verified BTool purchase.
    const entitlement = await ensureBtoolEntitlement(
      supabase,
      promotion,
      activated.starts_at,
      activated.ends_at
    );

    if (!entitlement.success) {
      return NextResponse.json(
        {
          error:
            "Your promotion is active, but BTool access could not be saved. Retry verification or contact support.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "success",
      reference,
      promotionStatus: activated.promotion_status,
      startsAt: activated.starts_at,
      endsAt: activated.ends_at,
      durationMonths,
      btoolSelected: promotion.btool_selected === true,
      message: promotion.btool_selected
        ? "Payment verified, promotion activated, and BTool entitlement saved."
        : "Payment verified and promotion activated successfully.",
    });
  } catch (error) {
    console.error("Promotion verification error:", error);

    return NextResponse.json(
      { error: "An unexpected payment verification error occurred." },
      { status: 500 }
    );
  }
}
