
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!secretKey || !siteUrl) {
      return NextResponse.json(
        { error: "Payment configuration is missing." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim() : "";

    // Never accept an arbitrary amount from the browser.
    // The server must calculate the amount from a trusted
    // advertisement or order stored in your database.
    const amountPesewas = body.amountPesewas;
    const reference =
      typeof body.reference === "string" ? body.reference.trim() : "";

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !Number.isSafeInteger(amountPesewas) ||
      amountPesewas <= 0 ||
      !/^[A-Za-z0-9_-]{8,100}$/.test(reference)
    ) {
      return NextResponse.json(
        { error: "Valid email, amount, and payment reference are required." },
        { status: 400 }
      );
    }

    const callbackUrl = `${siteUrl.replace(/\/+$/, "")}/payment/callback`;

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amountPesewas,
          currency: "GHS",
          reference,
          callback_url: callbackUrl,
        }),
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok || result.status !== true) {
      console.error("Paystack initialization failed:", result.message);

      return NextResponse.json(
        { error: "Could not start payment. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorizationUrl: result.data.authorization_url,
      reference: result.data.reference,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);

    return NextResponse.json(
      { error: "An unexpected payment error occurred." },
      { status: 500 }
    );
  }
}
