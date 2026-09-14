"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    alert("Registration system will be connected in the next phase.");
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="BEST SALES GHANA Home"
          >

            {/* ANIMATED LOGO */}
            <div className="logo-mark">
              <div className="logo-ring">
                <div className="logo-person">
                  <span className="logo-head" />
                  <span className="logo-arm logo-arm-left" />
                  <span className="logo-arm logo-arm-right" />
                  <span className="logo-body" />
                </div>
              </div>
            </div>

            <div>
              <div className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                BEST SALES GHANA
              </div>

              <div className="text-xs font-medium text-slate-500 sm:text-sm">
                Buy • Sell • Advertise • Connect
              </div>
            </div>

          </Link>

          <Link
            href="/login"
            className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-800"
          >
            Sign In
          </Link>

        </div>
      </header>


      {/* REGISTER SECTION */}
      <section className="relative flex items-center justify-center overflow-hidden px-4 py-12 sm:py-16">

        {/* BACKGROUND DECORATION */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-100/60" />

        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-cyan-100/60" />


        <div className="relative z-10 w-full max-w-2xl">

          {/* CARD */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 lg:p-10">

            {/* TITLE */}
            <div className="mb-8 text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 shadow-lg">

                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>

              </div>

              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">
                Join Our Marketplace
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Create an account
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Join BEST SALES GHANA and start buying, selling and connecting.
              </p>

            </div>


            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* FULL NAME */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>


              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>


              {/* PHONE */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="e.g. 024 000 0000"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>


              {/* ACCOUNT TYPE */}
              <div>
                <label
                  htmlFor="accountType"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Account Type
                </label>

                <select
                  id="accountType"
                  name="accountType"
                  defaultValue=""
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="" disabled>
                    Select account type
                  </option>

                  <option value="buyer">
                    Buyer
                  </option>

                  <option value="seller">
                    Seller
                  </option>

                  <option value="business">
                    Business
                  </option>
                </select>
              </div>


              {/* PASSWORD */}
              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="Create a password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-20 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Password must contain at least 8 characters.
                </p>

              </div>


              {/* CONFIRM PASSWORD */}
              <div>

                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Confirm Password
                </label>

                <div className="relative">

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="Confirm your password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-20 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>


              {/* TERMS */}
              <div className="flex items-start gap-3 pt-2">

                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                />

                <label
                  htmlFor="terms"
                  className="text-sm leading-6 text-slate-600"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="font-bold text-blue-700 hover:text-blue-900"
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-bold text-blue-700 hover:text-blue-900"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>

              </div>


              {/* CREATE ACCOUNT */}
              <button
                type="submit"
                className="w-full rounded-xl bg-blue-700 px-5 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl"
              >
                Create Account
              </button>

            </form>


            {/* DIVIDER */}
            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-sm font-bold text-slate-400">
                OR
              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>


            {/* GOOGLE */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50 hover:shadow-md"
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

              Continue with Google

            </button>


            {/* LOGIN LINK */}
            <div className="mt-8 border-t border-slate-200 pt-7 text-center">

              <p className="text-sm text-slate-500">
                Already have an account?
              </p>

              <Link
                href="/login"
                className="mt-2 inline-block font-black text-blue-700 hover:text-blue-900"
              >
                Sign in to your account
              </Link>

            </div>


            {/* BACK HOME */}
            <Link
              href="/"
              className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-700"
            >
              ← Back to BEST SALES GHANA
            </Link>

          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-950 px-4 py-6 text-center text-sm text-slate-400">

        © 2026 All Prominent Ghana Limited. All rights reserved.

      </footer>

    </main>
  );
}
