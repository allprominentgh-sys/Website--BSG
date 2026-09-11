"use client";

import Link from "next/link";
import { useState } from "react";

export default function AccountPage() {
  const [phone, setPhone] = useState("");

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              AP
            </div>

            <div>
              <div className="font-extrabold text-blue-700">
                ALL PROMINENT
              </div>
              <div className="text-xs text-slate-500">
                GHANA LIMITED
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="font-semibold text-blue-600"
          >
            ← Home
          </Link>

        </div>
      </header>

      {/* ACCOUNT AREA */}
      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">

        <div className="w-full max-w-md">

          {/* BRAND */}
          <div className="mb-8 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-extrabold text-white shadow-lg">
              AP
            </div>

            <h1 className="mt-5 text-3xl font-extrabold">
              Welcome back
            </h1>

            <p className="mt-2 text-slate-500">
              Sign in to buy, sell and manage your account.
            </p>

          </div>

          {/* CARD */}
          <div className="rounded-3xl border bg-white p-6 shadow-lg md:p-8">

            {/* GOOGLE */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <span className="text-xl">G</span>
              Continue with Google
            </button>

            {/* APPLE */}
            <button
              type="button"
              className="mt-3 flex w-full items-center justify-center gap-3 rounded-xl bg-black px-5 py-4 font-bold text-white transition hover:bg-slate-800"
            >
              <span className="text-xl"></span>
              Continue with Apple
            </button>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-sm text-slate-400">
                OR
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* PHONE */}
            <label className="text-sm font-bold text-slate-700">
              Phone number
            </label>

            <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50">

              <div className="flex items-center border-r bg-white px-4 font-semibold text-slate-600">
                🇬🇭 +233
              </div>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="24 000 0000"
                className="min-w-0 flex-1 bg-transparent px-4 py-4 outline-none"
              />

            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-xl bg-blue-600 px-5 py-4 font-bold text-white transition hover:bg-blue-700"
            >
              Continue with Phone
            </button>

            {/* CREATE ACCOUNT */}
            <div className="mt-7 border-t pt-6 text-center">

              <p className="text-sm text-slate-500">
                Don't have an account?
              </p>

              <button
                type="button"
                className="mt-2 font-bold text-blue-600 hover:text-blue-700"
              >
                Create a new account
              </button>

            </div>

          </div>

          {/* BENEFITS */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">

            <div className="rounded-xl bg-white p-3 shadow-sm">
              <div>🛒</div>
              <p className="mt-1 text-xs font-semibold">
                Buy
              </p>
            </div>

            <div className="rounded-xl bg-white p-3 shadow-sm">
              <div>📢</div>
              <p className="mt-1 text-xs font-semibold">
                Sell
              </p>
            </div>

            <div className="rounded-xl bg-white p-3 shadow-sm">
              <div>🚚</div>
              <p className="mt-1 text-xs font-semibold">
                Delivery
              </p>
            </div>

          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            By continuing, you agree to the All Prominent Ghana
            terms and privacy policy.
          </p>

        </div>

      </section>

    </main>
  );
}
