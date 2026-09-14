"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email) return;

    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
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
            href="/register"
            className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-md transition hover:bg-blue-800"
          >
            Create Account
          </Link>

        </div>
      </header>

      {/* PAGE */}
      <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-20">

        {/* Background shapes */}
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-100" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-100" />

        <div className="relative mx-auto max-w-2xl">

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-12">

            {/* ICON */}
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-700 text-white shadow-lg">

              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>

            </div>

            {/* TITLE */}
            <div className="mt-8 text-center">

              <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-700">
                Account Recovery
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                Forgot password?
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-500 sm:text-lg">
                Enter the email address associated with your BEST SALES GHANA
                account and we'll help you reset your password.
              </p>

            </div>

            {/* SUCCESS MESSAGE */}
            {submitted ? (
              <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
                  ✓
                </div>

                <h2 className="mt-4 text-xl font-black text-green-800">
                  Check your email
                </h2>

                <p className="mt-2 text-sm leading-6 text-green-700">
                  If an account exists for{" "}
                  <strong>{email}</strong>, password reset instructions
                  will be sent to that address.
                </p>

                <Link
                  href="/login"
                  className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white shadow-md hover:bg-blue-800"
                >
                  Back to Sign In
                </Link>

              </div>
            ) : (
              /* FORM */
              <form onSubmit={handleSubmit} className="mt-10">

                <label
                  htmlFor="email"
                  className="block text-base font-black text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mt-3 w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="submit"
                  className="mt-6 w-full rounded-2xl bg-blue-700 px-6 py-4 text-lg font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-800"
                >
                  Send Reset Link
                </button>

              </form>
            )}

            {/* LINKS */}
            <div className="mt-8 text-center">

              <p className="text-sm text-slate-500">
                Remember your password?
              </p>

              <Link
                href="/login"
                className="mt-2 inline-block font-black text-blue-700 hover:text-blue-900"
              >
                Sign in to your account →
              </Link>

            </div>

            <div className="my-8 border-t border-slate-200" />

            <Link
              href="/"
              className="block text-center font-bold text-slate-600 hover:text-blue-700"
            >
              ← Back to BEST SALES GHANA
            </Link>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">

          <div className="font-black text-white">
            BEST SALES GHANA
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Buy • Sell • Advertise • Connect
          </p>

          <p className="mt-5 text-sm text-slate-500">
            © 2026 All Prominent Ghana Limited. All rights reserved.
          </p>

        </div>
      </footer>

    </main>
  );
}
