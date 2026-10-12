
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

type PaymentResult = {
  success?: boolean;
  status?: string;
  message?: string;
  error?: string;
};

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      if (!reference) {
        setResult({
          success: false,
          message: "No payment reference was provided.",
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
          cache: "no-store",
        });

        const data = await response.json();

        if (!cancelled) {
          setResult({
            success: response.ok && data.success === true,
            status: data.status,
            message:
              data.message ??
              data.error ??
              "We could not confirm this payment.",
          });
        }
      } catch {
        if (!cancelled) {
          setResult({
            success: false,
            message:
              "We could not check your payment. Please try again later.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
        {loading ? (
          <>
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-700" />
            <h1 className="text-2xl font-bold text-gray-900">
              Checking your payment
            </h1>
            <p className="mt-3 text-gray-600">
              Please wait while we confirm your transaction with Paystack.
            </p>
          </>
        ) : result?.success ? (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Payment confirmed
            </h1>
            <p className="mt-3 text-gray-600">
              Paystack reports that your payment was successful.
            </p>
            {reference && (
              <p className="mt-4 break-all text-sm text-gray-500">
                Reference: {reference}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-3xl text-amber-700">
              !
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Payment not confirmed
            </h1>
            <p className="mt-3 text-gray-600">
              {result?.message ??
                "Please check your payment status before trying again."}
            </p>
            {reference && (
              <p className="mt-4 break-all text-sm text-gray-500">
                Reference: {reference}
              </p>
            )}
          </>
        )}

        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Return to BestSalesGH
        </Link>

        <p className="mt-5 text-xs text-gray-500">
          If money was deducted but your payment is not confirmed, contact
          support before paying again.
        </p>
      </div>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="p-10 text-center">Loading payment status…</main>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
