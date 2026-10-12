
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

type PaystackPayment = {
  reference?: unknown;
  status?: unknown;
  currency?: unknown;
  amount?: unknown;
};

type PaystackEvent = {
  event?: unknown;
  data?: PaystackPayment;
};

export async function POST(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    console.error("Paystack webhook secret is not configured.");

    return NextResponse.json(
      { error: "Webhook configuration is missing." },
      { status: 500 }
    );
  }

  try {
    // Read the raw body because Paystack signs the original payload.
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature || !/^[a-fA-F0-9]{128}$/.test(signature)) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    // Verify the signature using the Paystack secret key.
    const expectedSignature = createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    const actualBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return NextResponse.json(
        { error: "Webhook signature verification failed." },
        { status: 401 }
      );
    }

    let event: PaystackEvent;

    try {
      event = JSON.parse(rawBody) as PaystackEvent;
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook payload." },
        { status: 400 }
      );
    }

    // Ignore events this endpoint does not process.
    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const payment = event.data;

    // Validate every field before using it.
    if (
      !payment ||
      payment.status !== "success" ||
      typeof payment.reference !== "string" ||
      payment.reference.length < 1 ||
      payment.reference.length > 100 ||
      typeof payment.amount !== "number" ||
      !Number.isSafeInteger(payment.amount) ||
      payment.amount <= 0 ||
      payment.currency !== "GHS"
    ) {
      return NextResponse.json(
        { error: "Invalid payment notification." },
        { status: 400 }
      );
    }

    /*
     * IMPORTANT:
     * This endpoint verifies the Paystack signature and validates
     * the notification's fields. It does NOT yet mark an order or
     * advertisement as paid.
     *
     * Before production, connect this handler to your Supabase
     * payment records and:
     * 1. Find the pending payment by its reference.
     * 2. Compare the expected amount and currency.
     * 3. Confirm the customer and payment purpose.
     * 4. Update the payment status atomically to prevent duplicates.
     * 5. Activate the ad or fulfil the order only after verification.
     */

    console.info("Verified Paystack notification received.", {
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
    });

    return NextResponse.json({
      received: true,
      verified: true,
      processed: false,
      message:
        "Webhook signature verified. Database payment processing is not yet configured.",
    });
  } catch (error) {
    console.error(
      "Paystack webhook error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      { error: "Could not process webhook." },
      { status: 500 }
    );
  }
}
