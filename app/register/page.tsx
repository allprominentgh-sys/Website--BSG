"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type AccountType = "buyer" | "seller" | "business" | "";

type DeliveryOption =
  | "best-sales-delivery"
  | "seller-delivery"
  | "buyer-pickup"
  | "";

export default function RegisterPage() {
  const supabase = supabaseBrowser();

  const [accountType, setAccountType] = useState<AccountType>("");
  const [deliveryOption, setDeliveryOption] =
    useState<DeliveryOption>("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!accountType) {
      setError("Please select an account type.");
      return;
    }

    if (!deliveryOption) {
      setError("Please select your preferred delivery option.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError(
        "You must agree to the Terms & Conditions and Privacy Policy."
      );
      return;
    }

    try {
      setLoading(true);

      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo:
              `${window.location.origin}/auth/callback`,

            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
              account_type: accountType,
              delivery_option: deliveryOption,
            },
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user && !data.session) {
        setMessage(
          "Account created successfully. Please check your email to confirm your account."
        );
      } else if (data.session) {
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to create your account.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setError("");
    setMessage("");
    setGoogleLoading(true);

    try {
      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo:
              `${window.location.origin}/auth/callback`,
          },
        });

      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Google sign-in could not be started.";

      setError(errorMessage);
      setGoogleLoading(false);
    }
  }

  async function signInWithApple() {
    setError("");
    setMessage("");
    setAppleLoading(true);

    try {
      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "apple",
          options: {
            redirectTo:
              `${window.location.origin}/auth/callback`,
          },
        });

      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Apple sign-in could not be started.";

      setError(errorMessage);
      setAppleLoading(false);
    }
  }

  function getDeliveryName() {
    if (deliveryOption === "best-sales-delivery") {
      return "🚚 BEST SALES GHANA Delivery";
    }

    if (deliveryOption === "seller-delivery") {
      return "🏪 Seller Handles Delivery";
    }

    if (deliveryOption === "buyer-pickup") {
      return "🤝 Buyer Pickup";
    }

    return "";
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-blue-700"
          >
            BEST SALES GHANA
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            Login
          </Link>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-700 to-sky-500 px-4 py-12 text-white">
        <div className="mx-auto max-w-4xl text-center">

          <h1 className="text-3xl font-extrabold md:text-5xl">
            Create Your BEST SALES GHANA Account
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-blue-50 md:text-lg">
            Join Ghana's marketplace to buy products, sell products,
            advertise your business and connect with customers.
          </p>

        </div>
      </section>

      {/* REGISTRATION */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-3xl">

          <div className="rounded-2xl bg-white p-6 shadow-lg md:p-10">

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">
                Create Account
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Complete the form below to create your account.
              </p>
            </div>

            {/* SUCCESS */}
            {message && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                {message}
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* FULL NAME */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name *
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address *
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone Number *
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 024 123 4567"
                  autoComplete="tel"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* ACCOUNT TYPE */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  Account Type *
                </label>

                <div className="grid gap-3 md:grid-cols-3">

                  <button
                    type="button"
                    onClick={() => setAccountType("buyer")}
                    className={`rounded-xl border p-4 text-left transition ${
                      accountType === "buyer"
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-300 hover:border-blue-400"
                    }`}
                  >
                    <div className="text-lg">🛒</div>

                    <div className="mt-1 font-bold">
                      Buyer
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Buy products and contact sellers.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType("seller")}
                    className={`rounded-xl border p-4 text-left transition ${
                      accountType === "seller"
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-300 hover:border-blue-400"
                    }`}
                  >
                    <div className="text-lg">🏪</div>

                    <div className="mt-1 font-bold">
                      Seller
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Sell products as an individual.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType("business")}
                    className={`rounded-xl border p-4 text-left transition ${
                      accountType === "business"
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-300 hover:border-blue-400"
                    }`}
                  >
                    <div className="text-lg">🏢</div>

                    <div className="mt-1 font-bold">
                      Business / Company
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Sell products as a registered business.
                    </div>
                  </button>

                </div>
              </div>

              {/* DELIVERY */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  Preferred Delivery Option *
                </label>

                <div className="space-y-3">

                  <button
                    type="button"
                    onClick={() =>
                      setDeliveryOption("best-sales-delivery")
                    }
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      deliveryOption === "best-sales-delivery"
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-300 hover:border-blue-400"
                    }`}
                  >
                    <div className="font-bold">
                      🚚 BEST SALES GHANA Delivery
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Delivery arranged through BEST SALES GHANA.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDeliveryOption("seller-delivery")
                    }
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      deliveryOption === "seller-delivery"
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-300 hover:border-blue-400"
                    }`}
                  >
                    <div className="font-bold">
                      🏪 Seller Handles Delivery
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Delivery is handled directly by the seller.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDeliveryOption("buyer-pickup")
                    }
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      deliveryOption === "buyer-pickup"
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-300 hover:border-blue-400"
                    }`}
                  >
                    <div className="font-bold">
                      🤝 Buyer Pickup
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Buyer collects the item from the agreed location.
                    </div>
                  </button>

                </div>

                {deliveryOption && (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    Selected:{" "}
                    <span className="font-semibold">
                      {getDeliveryName()}
                    </span>
                  </div>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password *
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm Password *
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* TERMS */}
              <div className="rounded-xl bg-slate-50 p-4">
                <label className="flex items-start gap-3 text-sm text-slate-600">

                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) =>
                      setAgreeTerms(e.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                  />

                  <span>
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>

                </label>
              </div>

              {/* REGISTER */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-6 py-4 font-bold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>

            </form>

            {/* DIVIDER */}
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-sm text-slate-400">
                OR
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* GOOGLE */}
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={googleLoading || appleLoading}
              className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-lg">G</span>

              {googleLoading
                ? "Connecting..."
                : "Continue with Google"}
            </button>

            {/* APPLE */}
            <button
              type="button"
              onClick={signInWithApple}
              disabled={appleLoading || googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-lg"></span>

              {appleLoading
                ? "Connecting..."
                : "Continue with Apple"}
            </button>

            {/* LOGIN */}
            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-blue-600 hover:underline"
              >
                Login here
              </Link>
            </p>

          </div>
        </div>
      </section>

      {/* SECURITY NOTICE */}
      <section className="px-4 pb-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex gap-3">

            <div className="text-xl">
              🔐
            </div>

            <div>
              <h3 className="font-bold text-blue-900">
                Your account security matters
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                BEST SALES GHANA uses account security and marketplace
                controls to help protect buyers and sellers. Additional
                seller or business verification may be required before
                certain marketplace activities.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-white px-4 py-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-slate-500">

          <p>
            © {new Date().getFullYear()} BEST SALES GHANA.
            All rights reserved.
          </p>

          <div className="mt-3 flex justify-center gap-5">
            <Link
              href="/terms"
              className="hover:text-blue-600"
            >
              Terms
            </Link>

            <Link
              href="/privacy"
              className="hover:text-blue-600"
            >
              Privacy
            </Link>

            <Link
              href="/contact"
              className="hover:text-blue-600"
            >
              Contact
            </Link>
          </div>

        </div>
      </footer>

    </main>
  );
}
