“use client”;

import Link from “next/link”;
import { FormEvent, Suspense, useState } from “react”;
import { useRouter, useSearchParams } from “next/navigation”;
import { supabaseBrowser } from “@/supabase-browser”;

function VerifyEmailForm() {
const supabase = supabaseBrowser();
const router = useRouter();
const searchParams = useSearchParams();

const email = (searchParams.get(“email”) || “”)
.trim()
.toLowerCase();

const [token, setToken] = useState(””);
const [loading, setLoading] = useState(false);
const [resending, setResending] = useState(false);
const [error, setError] = useState(””);
const [message, setMessage] = useState(””);

async function handleVerify(
event: FormEvent
) {
event.preventDefault();

setError("");
setMessage("");
const cleanToken = token.trim();
if (!email) {
  setError(
    "Email address is missing. Please register again."
  );
  return;
}
if (!/^\d{6}$/.test(cleanToken)) {
  setError(
    "Please enter the six-digit code sent to your email."
  );
  return;
}
setLoading(true);
try {
  const { data, error: verifyError } =
    await supabase.auth.verifyOtp({
      email,
      token: cleanToken,
      type: "signup",
    });
  if (verifyError) {
    throw verifyError;
  }
  if (!data.user) {
    throw new Error(
      "Email verification could not be completed. Please request a new code."
    );
  }
  setMessage(
    "Email verified successfully. Redirecting..."
  );
  if (data.session) {
    router.replace("/dashboard");
    router.refresh();
  } else {
    router.replace("/login?verified=true");
  }
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
setError(””);
setMessage(””);

if (!email) {
  setError(
    "Email address is missing. Please register again."
  );
  return;
}
setResending(true);
try {
  const { error: resendError } =
    await supabase.auth.resend({
      type: "signup",
      email,
    });
  if (resendError) {
    throw resendError;
  }
  setToken("");
  setMessage(
    "If this email has a pending registration, a new verification code has been requested. Check your inbox and spam folder."
  );
} catch (err: unknown) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to resend the verification code. Please try again."
  );
} finally {
  setResending(false);
}

}

return (
BEST SALES GHANA
      <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
        ✉️
      </div>
      <h1 className="mt-5 text-2xl font-bold text-slate-900">
        Verify Your Email
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Enter the six-digit verification code sent to:
      </p>
      <p className="mt-2 break-all font-semibold text-blue-700">
        {email || "Email address unavailable"}
      </p>
    </div>
    {message && (
      <div
        role="status"
        className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
      >
        {message}
      </div>
    )}
    {error && (
      <div
        role="alert"
        className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
      >
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
          name="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={token}
          onChange={(event) =>
            setToken(
              event.target.value
                .replace(/\D/g, "")
                .slice(0, 6)
            )
          }
          placeholder="000000"
          required
          disabled={loading || !email}
          className="w-full rounded-xl border border-slate-300 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
        />
      </div>
      <button
        type="submit"
        disabled={
          loading || token.length !== 6 || !email
        }
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
        disabled={resending || loading || !email}
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
Loading verification…
}
>
);
}
