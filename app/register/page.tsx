"use client";

import Link from "next/link";
import { useState } from "react";

type AccountType = "buyer" | "seller" | "business" | "";

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<AccountType>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">

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
              placeholder="Enter your full name"
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
              placeholder="you@example.com"
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
              placeholder="e.g. 024 000 0000"
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
                setAccountType(e.target.value as AccountType)
              }
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select account type</option>
              <option value="buyer">Buyer — Registered Buyer</option>
              <option value="seller">Seller — Individual</option>
              <option value="business">Business / Company</option>
            </select>
          </div>

          {/* BUYER VERIFICATION */}
          {accountType === "buyer" && (
            <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">

              <h3 className="text-xl font-black text-slate-900">
                Buyer Verification
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Registered buyers must provide a valid phone number and
                passport picture for account verification.
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
                  Upload a clear recent passport-size photograph.
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
                Individual sellers must verify their identity before selling
                on BEST SALES GHANA.
              </p>

              <div className="mt-5">
                <label className="text-sm font-black text-slate-700">
                  Identification Type
                </label>

                <select className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 outline-none">
                  <option value="">Select identification type</option>
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
                <strong>Important:</strong> Individual sellers are subject to
                identity verification and do not receive direct platform
                payouts.
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
                Registered businesses and companies must provide valid
                corporate credentials before receiving platform payment
                privileges.
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

              {/* BUSINESS CERTIFICATE */}
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

              {/* COMPANY CREDENTIALS */}
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
                  Upload relevant company credentials required for verification.
                </p>
              </div>

              {/* PAYMENT NOTICE */}
              <div className="mt-6 rounded-xl border border-blue-200 bg-white p-5">

                <h4 className="font-black text-blue-700">
                  Platform Payment Eligibility
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Verified registered businesses and companies are eligible
                  to receive client payments through the BEST SALES GHANA
                  platform.
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  A 2.15% platform processing fee is automatically deducted
                  from eligible transactions before the seller's net amount
                  enters the payout process.
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Eligible payouts are subject to the applicable five (5)
                  business-day processing period and any active dispute,
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
                placeholder="Create a password"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-5 py-4 pr-20 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-5 py-4 pr-20 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
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
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border-slate-300"
            />

            <p className="text-sm leading-6 text-slate-600">
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
            </p>

          </div>

          {/* CREATE ACCOUNT */}
          <button
            type="button"
            className="mt-8 w-full rounded-2xl bg-blue-700 px-6 py-5 text-lg font-black text-white shadow-lg transition hover:bg-blue-800"
          >
            Create Account
          </button>

          {/* LOGIN */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-black text-blue-700 hover:underline"
            >
              Sign In
            </Link>
          </p>

        </div>
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
            © 2026 All Prominent Ghana Limited. All rights reserved.
          </p>

        </div>
      </footer>

    </main>
  );
}
