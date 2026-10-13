import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
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

    // Find the promotion request saved before checkout.
    const { data: promotion, error: lookupError } = await supabase
      .from("promotion_requests")
      .select(
        "id, user_id, listing_id, amount, currency_code, payment_reference, payment_status, promotion_status, duration_days"
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

    if (!promotion) {
      return NextResponse.json(
        { error: "No promotion request matches this payment reference." },
        { status: 404 }
      );
    }

    // Verify the transaction directly with Paystack.
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
      return NextResponse.json(
        { error: "Paystack could not verify this transaction." },
        { status: 502 }
      );
    }

    const payment = paystackResult.data;

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

    const expectedAmountPesewas = Math.round(
      Number(promotion.amount) * 100
    );

    if (
      !Number.isSafeInteger(expectedAmountPesewas) ||
      expectedAmountPesewas <= 0 ||
      Number(payment.amount) !== expectedAmountPesewas
    ) {
      return NextResponse.json(
        { error: "The payment amount does not match the promotion price." },
        { status: 400 }
      );
    }

    const expectedCurrency = String(
      promotion.currency_code || "GHS"
    ).toUpperCase();

    if (
      String(payment.currency).toUpperCase() !== expectedCurrency ||
      expectedCurrency !== "GHS"
    ) {
      return NextResponse.json(
        { error: "The payment currency does not match the promotion." },
        { status: 400 }
      );
    }

    if (promotion.payment_status === "SUCCESS") {
      return NextResponse.json({
        success: true,
        status: "success",
        reference,
        message: "This promotion payment has already been verified.",
      });
    }

    // Record verified payment. Keep the promotion pending for review;
    // do not activate an advertisement until your status workflow
    // and database constraints have been confirmed.
    const { error: updateError } = await supabase
      .from("promotion_requests")
      .update({
        payment_status: "SUCCESS",
        promotion_status: "PENDING",
        updated_at: new Date().toISOString(),
      })
      .eq("id", promotion.id)
      .eq("payment_reference", reference);

    if (updateError) {
      console.error("Promotion payment update failed:", updateError);

      return NextResponse.json(
        {
          error:
            "Paystack confirmed the payment, but we could not save its status. Contact support before paying again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "success",
      reference,
      message:
        "Payment verified. Your promotion request is awaiting processing.",
    });
  } catch (error) {
    console.error("Promotion verification error:", error);

    return NextResponse.json(
      { error: "An unexpected payment verification error occurred." },
      { status: 500 }
    );
  }
}
