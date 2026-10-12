
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: "Payment configuration is missing." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const reference =
      typeof body.reference === "string" ? body.reference.trim() : "";

    if (!/^[A-Za-z0-9_-]{8,100}$/.test(reference)) {
      return NextResponse.json(
        { error: "A valid payment reference is required." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok || result.status !== true || !result.data) {
      return NextResponse.json(
        { error: "Could not verify this payment." },
        { status: 502 }
      );
    }

    const payment = result.data;

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

    if (payment.currency !== "GHS") {
      return NextResponse.json(
        { error: "The payment currency does not match." },
        { status: 400 }
      );
    }

    // IMPORTANT:
    // Before accepting this payment, the server must also look up
    // the reference in your database and compare the expected amount,
    // currency, customer, and payment purpose.
    //
    // Do not activate an advertisement or release an order here until
    // that database verification and secure status update are implemented.

    return NextResponse.json({
      success: true,
      status: "success",
      reference: payment.reference,
      amountPesewas: payment.amount,
      currency: payment.currency,
      message: "Paystack confirms this transaction succeeded.",
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      { error: "An unexpected verification error occurred." },
      { status: 500 }
    );
  }
}
