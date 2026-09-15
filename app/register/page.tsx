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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

          <Link href="/" className="block">
            <div className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              BEST SALES GHANA
            </div>

            <div className="text-sm font-medium text-slate-500">
              Buy • Sell • Advertise • Connect
            </div>
          </Link>

          <Link
            href="/login"
            className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-md hover:bg-blue-800"
          >
            Sign In
          </Link>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-700 to-cyan-500 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">

          <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-100">
            Join Our Marketplace
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Create an account
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/90">
            Join BEST SALES GHANA and start buying, selling and connecting.
          </p>

        </div>
      </section>

      {/* FORM */}
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"
        >

          {/* STATUS */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
              {message}
            </div>
          )}

          {/* BASIC INFORMATION */}
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Account Information
            </h2>

            <p className="mt-2 text-slate-500">
              Enter your information accurately.
            </p>
          </div>

          {/* FULL NAME */}
          <div className="mt-8">
            <label className="text-sm font-black text-slate-700">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* EMAIL */}
          <div className="mt-6">
            <label className="text-sm font-black text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* PHONE */}
          <div className="mt-6">
            <label className="text-sm font-black text-slate-700">
              Phone Number
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 024 000 0000"
              autoComplete="tel"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* ACCOUNT TYPE */}
          <div className="mt-6">
            <label className="text-sm font-black text-slate-700">
              Account Type
            </label>

            <select
              value={accountType}
              onChange={(e) =>
                setAccountType(
                  e.target.value as AccountType
                )
              }
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select account type
              </option>

              <option value="buyer">
                Buyer — Registered Buyer
              </option>

              <option value="seller">
                Seller — Individual
              </option>

              <option value="business">
                Business / Company
              </option>
            </select>
          </div>

          {/* DELIVERY */}
          <div className="mt-10">

            <h2 className="text-2xl font-black text-slate-900">
              Delivery Preference
            </h2>

            <p className="mt-2 text-slate-500">
              Select exactly how you want your purchases
              to be delivered or collected.
            </p>

            <div className="mt-5 space-y-4">

              {/* BEST SALES DELIVERY */}
              <button
                type="button"
                onClick={() =>
                  setDeliveryOption(
                    "best-sales-delivery"
                  )
                }
                className={`w-full rounded-2xl border-2 p-5 text-left transition ${
                  deliveryOption ===
                  "best-sales-delivery"
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="flex items-start gap-4">

                  <div className="text-3xl">
                    🚚
                  </div>

                  <div className="flex-1">

                    <div className="flex items-center justify-between gap-3">

                      <h3 className="text-lg font-black text-slate-900">
                        BEST SALES GHANA Delivery
                      </h3>

                      {deliveryOption ===
                        "best-sales-delivery" && (
                        <span className="rounded-full bg-blue-700 px-3 py-1 text-xs font-black text-white">
                          SELECTED
                        </span>
                      )}

                    </div>

                    <p className="mt-2 leading-6 text-slate-600">
                      Our delivery system will collect
                      and deliver the item to the buyer.
                    </p>

                    <p className="mt-3 font-bold text-blue-700">
                      ✓ Buyer can track delivery
                    </p>

                  </div>
                </div>
              </button>

              {/* SELLER DELIVERY */}
              <button
                type="button"
                onClick={() =>
                  setDeliveryOption("seller-delivery")
                }
                className={`w-full rounded-2xl border-2 p-5 text-left transition ${
                  deliveryOption === "seller-delivery"
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="flex items-start gap-4">

                  <div className="text-3xl">
                    🏪
                  </div>

                  <div className="flex-1">

                    <div className="flex items-center justify-between gap-3">

                      <h3 className="text-lg font-black text-slate-900">
                        Seller Handles Delivery
                      </h3>

                      {deliveryOption ===
                        "seller-delivery" && (
                        <span className="rounded-full bg-blue-700 px-3 py-1 text-xs font-black text-white">
                          SELECTED
                        </span>
                      )}

                    </div>

                    <p className="mt-2 leading-6 text-slate-600">
                      The seller or company will arrange
                      delivery directly with the buyer.
                    </p>

                  </div>
                </div>
              </button>

              {/* BUYER PICKUP */}
              <button
                type="button"
                onClick={() =>
                  setDeliveryOption("buyer-pickup")
                }
                className={`w-full rounded-2xl border-2 p-5 text-left transition ${
                  deliveryOption === "buyer-pickup"
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="flex items-start gap-4">

                  <div className="text-3xl">
                    🤝
                  </div>

                  <div className="flex-1">

                    <div className="flex items-center justify-between gap-3">

                      <h3 className="text-lg font-black text-slate-900">
                        Buyer Pickup
                      </h3>

                      {deliveryOption ===
                        "buyer-pickup" && (
                        <span className="rounded-full bg-blue-700 px-3 py-1 text-xs font-black text-white">
                          SELECTED
                        </span>
                      )}

                    </div>

                    <p className="mt-2 leading-6 text-slate-600">
                      Buyer collects the item directly
                      from the seller.
                    </p>

                  </div>
                </div>
              </button>

            </div>

            {/* SELECTED DELIVERY CONFIRMATION */}
            {deliveryOption && (
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">

                <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                  Your Selected Delivery Option
                </p>

                <p className="mt-2 text-lg font-black text-slate-900">
                  {getDeliveryName()}
                </p>

                {deliveryOption ===
                  "best-sales-delivery" && (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Your delivery can be tracked after
                    BEST SALES GHANA receives the item
                    and generates a tracking number.
                  </p>
                )}

                {deliveryOption ===
                  "seller-delivery" && (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The seller or company will arrange
                    delivery directly with you.
                  </p>
                )}

                {deliveryOption ===
                  "buyer-pickup" && (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    You will collect the item directly
                    from the seller.
                  </p>
                )}

              </div>
            )}

          </div>

          {/* BUYER VERIFICATION */}
          {accountType === "buyer" && (
            <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">

              <h3 className="text-xl font-black text-slate-900">
                Buyer Verification
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Registered buyers must provide a valid
                phone number and passport picture for
                account verification.
              </p>

              <div className="mt-5">

                <label className="text-sm font-black text-slate-700">
                  Passport Picture
                </label>

                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Upload a clear recent passport-size
                  photograph.
                </p>

              </div>

            </div>
          )}

          {/* INDIVIDUAL SELLER VERIFICATION */}
          {accountType === "seller" && (
            <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">

              <h3 className="text-xl font-black text-slate-900">
                Individual Seller Verification
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Individual sellers must verify their
                identity before selling on BEST SALES GHANA.
              </p>

              <div className="mt-5">

                <label className="text-sm font-black text-slate-700">
                  Identification Type
                </label>

                <select className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 outline-none">
                  <option value="">
                    Select identification type
                  </option>

                  <option value="ghana-card">
                    Ghana Card / NIA
                  </option>

                  <option value="passport">
                    Passport
                  </option>
                </select>

              </div>

              <div className="mt-5">

                <label className="text-sm font-black text-slate-700">
                  Upload Identification Document
                </label>

                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm"
                />

              </div>

              <div className="mt-5">

                <label className="text-sm font-black text-slate-700">
                  Passport Picture
                </label>

                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm"
                />

              </div>

              <div className="mt-5 rounded-xl bg-white p-4 text-sm text-slate-600">
                <strong>Important:</strong>{" "}
                Individual sellers are subject to identity
                verification and do not receive direct
                platform payouts.
              </div>

            </div>
          )}

          {/* BUSINESS VERIFICATION */}
          {accountType === "business" && (
            <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">

              <h3 className="text-xl font-black text-slate-900">
                Business / Company Verification
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Registered businesses and companies must
                provide valid corporate credentials before
                receiving platform payment privileges.
              </p>

              {/* BUSINESS NAME */}
              <div className="mt-5">

                <label className="text-sm font-black text-slate-700">
                  Registered Business / Company Name
                </label>

                <input
                  type="text"
                  placeholder="Enter registered company name"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 outline-none focus:border-blue-600"
                />

              </div>

              {/* CERTIFICATE */}
              <div className="mt-5">

                <label className="text-sm font-black text-slate-700">
                  Business Registration Certificate
                </label>

                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm"
                />

              </div>

              {/* TAX */}
              <div className="mt-5">

                <label className="text-sm font-black text-slate-700">
                  Tax Identification Details
                </label>

                <input
                  type="text"
                  placeholder="Enter tax identification details"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 outline-none focus:border-blue-600"
                />

              </div>

              {/* REPRESENTATIVE */}
              <div className="mt-5">

                <label className="text-sm font-black text-slate-700">
                  Authorized Representative
                </label>

                <input
                  type="text"
                  placeholder="Name of authorized representative"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 outline-none focus:border-blue-600"
                />

              </div>

              {/* REPRESENTATIVE ID */}
              <div className="mt-5">

                <label className="text-sm font-black text-slate-700">
                  Representative Identification
                </label>

                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm"
                />

              </div>

              {/* SUPPORTING DOCUMENTS */}
              <div className="mt-5">

                <label className="text-sm font-black text-slate-700">
                  Company Credentials / Supporting Documents
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Upload relevant company credentials
                  required for verification.
                </p>

              </div>

              {/* PAYMENT NOTICE */}
              <div className="mt-6 rounded-xl border border-blue-200 bg-white p-5">

                <h4 className="font-black text-blue-700">
                  Platform Payment Eligibility
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Verified registered businesses and
                  companies are eligible to receive client
                  payments through the BEST SALES GHANA
                  platform.
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  A 2.15% platform processing fee is
                  automatically deducted from eligible
                  transactions before the seller&apos;s
                  net amount enters the payout process.
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Eligible payouts are subject to the
                  applicable five (5) business-day
                  processing period and any active dispute,
                  compliance or verification review.
                </p>

              </div>

            </div>
          )}

          {/* PASSWORD */}
          <div className="mt-8">

            <label className="text-sm font-black text-slate-700">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Create a password"
                autoComplete="new-password"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-5 py-4 pr-20 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 font-bold text-slate-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

            <p className="mt-2 text-xs text-slate-400">
              Password must contain at least 8 characters.
            </p>

          </div>

          {/* CONFIRM PASSWORD */}
          <div className="mt-6">

            <label className="text-sm font-black text-slate-700">
              Confirm Password
            </label>

            <div className="relative">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm your password"
                autoComplete="new-password"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-5 py-4 pr-20 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 font-bold text-slate-500"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>

          {/* TERMS */}
          <div className="mt-8 flex items-start gap-3">

            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) =>
                setAgreeTerms(e.target.checked)
              }
              className="mt-1 h-5 w-5 rounded border-slate-300"
            />

            <label
              htmlFor="terms"
              className="text-sm leading-6 text-slate-600"
            >
              I agree to the{" "}

              <Link
                href="/terms"
                className="font-bold text-blue-700 hover:underline"
              >
                Terms & Conditions
              </Link>{" "}

              and{" "}

              <Link
                href="/privacy"
                className="font-bold text-blue-700 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </label>

          </div>

          {/* CREATE ACCOUNT */}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-blue-700 px-6 py-5 text-lg font-black text-white shadow-lg transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

          {/* SOCIAL LOGIN */}
          <div className="my-8 flex items-center gap-4">

            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-sm font-bold text-slate-400">
              OR
            </span>

            <div className="h-px flex-1 bg-slate-200" />

          </div>

          {/* GOOGLE */}
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={
              googleLoading ||
              appleLoading ||
              loading
            }
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-4 font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >

            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.95h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.25Z"
              />

              <path
                fill="#34A853"
                d="M12 21.7c2.63 0 4.84-.87 6.45-2.37l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.7Z"
              />

              <path
                fill="#FBBC05"
                d="M6.54 13.77A5.86 5.86 0 0 1 6.23 12c0-.61.1-1.2.31-1.77V7.7H3.29A9.72 9.72 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.3l3.25-2.53Z"
              />

              <path
                fill="#EA4335"
                d="M12 6.2c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.28 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.71 5.4l3.25 2.53C7.31 7.92 9.46 6.2 12 6.2Z"
              />
            </svg>

            {googleLoading
              ? "Connecting to Google..."
              : "Continue with Google"}

          </button>

          {/* APPLE */}
          <button
            type="button"
            onClick={signInWithApple}
            disabled={
              appleLoading ||
              googleLoading ||
              loading
            }
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-5 py-4 font-black text-white transition hover:bg-slate-800 disabled:opacity-60"
          >

            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.09.8 1.19-.24 2.33-.93 3.6-.84 1.53.12 2.68.73 3.44 1.8-3.16 1.89-2.41 6.03.49 7.19-.58 1.53-1.34 3.04-2.62 4.02zM12.03 7.25C11.88 4.97 13.73 3.1 15.87 3c.3 2.63-2.39 4.59-3.84 4.25z" />
            </svg>

            {appleLoading
              ? "Connecting to Apple..."
              : "Continue with Apple"}

          </button>

          {/* LOGIN */}
          <p className="mt-8 text-center text-sm text-slate-500">

            Already have an account?{" "}

            <Link
              href="/login"
              className="font-black text-blue-700 hover:underline"
            >
              Sign In
            </Link>

          </p>

        </form>

      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white">

        <div className="mx-auto max-w-7xl px-4 py-10 text-center">

          <div className="text-xl font-black">
            BEST SALES GHANA
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Buy • Sell • Advertise • Connect
          </p>

          <p className="mt-6 text-sm text-slate-500">
            © 2026 All Prominent Ghana Limited.
            All rights reserved.
          </p>

        </div>

      </footer>

    </main>
  );
}
