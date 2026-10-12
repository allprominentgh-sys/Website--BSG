
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

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
    // Read the original request body. Paystack's signature must be
    // calculated from the unmodified body.
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature || !/^[a-fA-F0-9]{128}$/.test(signature)) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 401 }
      );
    }

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

    let event: {
      event?: string;
      data?: {
        reference?: string;
        status?: string;
        currency?: string;
        amount?: number;
      };
    };

    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook payload." },
        { status: 400 }
      );
    }

    // We only process successful charge notifications here.
    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const payment = event.data;

    if (
      !payment ||
      payment.status !== "success" ||
      typeof payment.reference !== "string" ||
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
     * NEXT REQUIRED INTEGRATION:
     *
     * 1. Find the matching pending payment in Supabase by reference.
     * 2. Compare the expected amount and currency with this notification.
     * 3. Confirm the payment purpose (advertisement or order).
     * 4. Atomically mark the payment as paid, preventing duplicate events.
     * 5. Activate the advertisement or fulfil the eligible order only
     *    after all checks pass.
     *
     * Do not activate ads or release funds until these database checks
     * are implemented.
     */

    console.info("Verified Paystack charge notification received.", {
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
    });

    return NextResponse.json({
      received: true,
      verified: true,
      processed: false,
      message: "Signature verified; database processing is not configured yet.",
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);

    return NextResponse.json(
      { error: "Could not process webhook." },
      { status: 500 }
    );
  }
}
