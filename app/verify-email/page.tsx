
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabaseBrowser } from "@/supabase-browser";

function VerifyEmailForm() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError("Email address is missing. Please register again.");
      return;
    }

    if (!/^\d{6}$/.test(token)) {
      setError("Please enter the six-digit code sent to your email.");
      return;
    }

    try {
      setLoading(true);

      const { error: verifyError } =
        await supabase.auth.verifyOtp({
          email,
          token,
          type: "signup",
        });

      if (verifyError) {
        throw verifyError;
      }

      setMessage("Email verified successfully. Redirecting...");

      router.replace("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setError("");
    setMessage("");

    if (!email) {
      setError("Email address is missing. Please register again.");
      return;
    }

    try {
      setResending(true);

      const { error: resendError } =
        await supabase.auth.resend({
          type: "signup",
          email,
        });

      if (resendError) {
        throw resendError;
      }

      setMessage("A new verification code has been sent to your email.");
      setToken("");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to resend verification code."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">

        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-xl font-extrabold text-blue-700"
          >
            BEST SALES GHANA
          </Link>

          <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
            ✉️
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Verify Your Email
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            We have sent a six-digit verification code to:
          </p>

          <p className="mt-2 break-all font-semibold text-blue-700">
            {email || "Email address unavailable"}
          </p>
        </div>

        {message && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label
              htmlFor="otp"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Six-Digit Verification Code
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={token}
              onChange={(event) =>
                setToken(
                  event.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              placeholder="000000"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading || token.length !== 6 || !email}
            className="w-full rounded-xl bg-blue-600 px-5 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Did not receive your code?
          </p>

          <button
            type="button"
            onClick={resendCode}
            disabled={resending || !email}
            className="mt-2 font-semibold text-blue-600 hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend Code"}
          </button>
        </div>

        <div className="mt-6 border-t pt-5 text-center">
          <Link
            href="/register"
            className="text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            Back to Registration
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">
            Loading verification...
          </p>
        </main>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
