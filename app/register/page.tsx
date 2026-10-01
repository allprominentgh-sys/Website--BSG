"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/supabase-browser";

type AccountType = "buyer" | "seller" | "business" | "";

type DeliveryOption =
  | "best-sales-delivery"
  | "seller-delivery"
  | "buyer-pickup"
  | "";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [accountType, setAccountType] = useState<AccountType>("");
  const [deliveryOption, setDeliveryOption] =
    useState<DeliveryOption>("");

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanEmail || !cleanPhone) {
      setError("Please complete all required fields.");
      return;
    }

    if (!accountType) {
      setError("Please select an account type.");
      return;
    }

    if (!deliveryOption) {
      setError("Please select a delivery option.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms and Conditions.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: cleanName,
              phone: cleanPhone,
              account_type: accountType,
              delivery_option: deliveryOption,
            },
          },
        });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        router.replace("/dashboard");
        return;
      }

      if (data.user) {
        router.push(
          `/verify-email?email=${encodeURIComponent(cleanEmail)}`
        );
        return;
      }

      setError(
        "We could not complete your registration. Please try again."
      );
    } catch {
      setError(
        "Something went wrong. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setMessage("");
    setGoogleLoading(true);

    try {
      const { error: oauthError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

      if (oauthError) {
        setError(oauthError.message);
        setGoogleLoading(false);
      }
    } catch {
      setError("Google sign-in could not be started.");
      setGoogleLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-3xl font-extrabold tracking-tight text-blue-800"
          >
            BESTSALESGH
          </Link>

          <p className="mt-2 text-sm text-slate-600">
            Create your account and start shopping or selling.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Join BestSalesGH as a buyer, seller, or business.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-800">
                Choose your account type
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(
                  [
                    {
                      value: "buyer",
                      title: "Buyer",
                      description: "Shop products and services.",
                    },
                    {
                      value: "seller",
                      title: "Seller",
                      description: "List products for sale.",
                    },
                    {
                      value: "business",
                      title: "Business",
                      description: "Grow your business online.",
                    },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAccountType(option.value)}
                    aria-pressed={accountType === option.value}
                    className={`rounded-xl border p-4 text-left transition ${
                      accountType === option.value
                        ? "border-blue-700 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <span className="block font-semibold text-slate-900">
                      {option.title}
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>

                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Phone number
                </label>

                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 024 000 0000"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Re-enter your password"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-800">
                Preferred delivery option
              </label>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-blue-300">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="best-sales-delivery"
                    checked={
                      deliveryOption === "best-sales-delivery"
                    }
                    onChange={() =>
                      setDeliveryOption("best-sales-delivery")
                    }
                    className="mt-1 accent-blue-700"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      BestSalesGH Delivery
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Delivery arranged through BestSalesGH, subject
                      to availability and applicable charges.
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-blue-300">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="seller-delivery"
                    checked={deliveryOption === "seller-delivery"}
                    onChange={() =>
                      setDeliveryOption("seller-delivery")
                    }
                    className="mt-1 accent-blue-700"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Seller Delivery
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      The seller arranges delivery directly.
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-blue-300">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="buyer-pickup"
                    checked={deliveryOption === "buyer-pickup"}
                    onChange={() =>
                      setDeliveryOption("buyer-pickup")
                    }
                    className="mt-1 accent-blue-700"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Buyer Pickup
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Collect your order from the agreed pickup
                      location.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                id="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 accent-blue-700"
              />

              <label
                htmlFor="agreeTerms"
                className="text-sm leading-6 text-slate-600"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-medium text-blue-700 hover:underline"
                >
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  className="font-medium text-blue-700 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full rounded-lg bg-blue-800 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating your account..."
                : "Create account"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">
              OR
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              viewBox="0 0 48 48"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                transform="translate(0 4)"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.88 46.98 31.78 46.98 24.55Z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"
                transform="translate(0 0)"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.9 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
              />
            </svg>

            {googleLoading
              ? "Connecting to Google..."
              : "Continue with Google"}
          </button>

          <p className="mt-7 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-700 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} BestSalesGH. All rights
          reserved.
        </p>
      </div>
    </main>
  );
}
