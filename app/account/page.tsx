"use client";

import Link from "next/link";
import { useState } from "react";

export default function AccountPage() {
  const [phone, setPhone] = useState("");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-xl font-extrabold text-blue-700">
            ALL PROMINENT GHANA
          </Link>

          <Link
            href="/listings"
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            Marketplace
          </Link>
        </div>
      </header>

      {/* Account */}
      <section className="px-5 py-12">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
                👤
              </div>

              <h1 className="text-3xl font-extrabold">
                Welcome back
              </h1>

              <p className="mt-2 text-slate-500">
                Sign in to buy, sell and manage your account.
              </p>
            </div>

            {/* Google */}
            <button
              type="button"
              className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-4 font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              <span className="text-xl">G</span>
              Continue with Google
            </button>

            {/* Apple */}
            <button
              type="button"
              className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl bg-black px-4 py-4 font-semibold text-white transition hover:bg-slate-800"
            >
              <span className="text-xl"></span>
              Continue with Apple
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-sm text-slate-400">OR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Phone */}
            <label className="mb-2 block text-sm font-semibold">
              Phone number
            </label>

            <div className="mb-3 flex overflow-hidden rounded-xl border border-slate-300 bg-white">
              <span className="flex items-center bg-slate-100 px-3 font-semibold text-slate-700">
                +233
              </span>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="24 000 0000"
                className="min-w-0 flex-1 px-4 py-4 outline-none"
              />
            </div>

            <button
              type="button"
              className="w-full rounded-xl bg-blue-600 px-4 py-4 font-bold text-white transition hover:bg-blue-700"
            >
              Continue with phone
            </button>

            {/* Account links */}
            <div className="mt-8 space-y-3 text-center text-sm">
              <p className="text-slate-500">
                New to All Prominent Ghana?
              </p>

              <Link
                href="/post-ad"
                className="font-bold text-blue-600 hover:text-blue-800"
              >
                Start selling
              </Link>
            </div>
          </div>

          {/* Trust information */}
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-400 p-5 text-center text-white">
            <h2 className="font-bold">Buy • Sell • Advertise • Connect</h2>
            <p className="mt-1 text-sm text-blue-50">
              Your Ghanaian marketplace for products, brands, property,
              vehicles, jobs and services.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
