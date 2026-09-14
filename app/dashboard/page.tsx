"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

          <Link href="/" className="block">
            <div className="text-xl font-black text-slate-900 sm:text-2xl">
              BEST SALES GHANA
            </div>

            <div className="text-sm font-medium text-slate-500">
              Buy • Sell • Advertise • Connect
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/sell"
              className="hidden rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-md transition hover:bg-blue-800 sm:block"
            >
              Post an Ad
            </Link>

            <button className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-black text-blue-700">
              AP
            </button>
          </div>

        </div>
      </header>

      {/* DASHBOARD */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* WELCOME */}
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-widest text-blue-700">
            My Account
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            Welcome back
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your listings, messages, payments and account.
          </p>
        </div>

        {/* QUICK STATS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-bold text-slate-500">
              My Listings
            </div>

            <div className="mt-3 text-3xl font-black text-slate-900">
              0
            </div>

            <Link
              href="/dashboard/listings"
              className="mt-4 inline-block text-sm font-bold text-blue-700"
            >
              View listings →
            </Link>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-bold text-slate-500">
              Active Ads
            </div>

            <div className="mt-3 text-3xl font-black text-slate-900">
              0
            </div>

            <p className="mt-4 text-sm text-slate-400">
              No active advertisements
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-bold text-slate-500">
              Messages
            </div>

            <div className="mt-3 text-3xl font-black text-slate-900">
              0
            </div>

            <Link
              href="/dashboard/messages"
              className="mt-4 inline-block text-sm font-bold text-blue-700"
            >
              Open messages →
            </Link>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-bold text-slate-500">
              Payments
            </div>

            <div className="mt-3 text-3xl font-black text-slate-900">
              GH₵0
            </div>

            <Link
              href="/dashboard/payments"
              className="mt-4 inline-block text-sm font-bold text-blue-700"
            >
              Payment history →
            </Link>
          </div>

        </div>

        {/* MAIN DASHBOARD */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* ACCOUNT MENU */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="text-xl font-black text-slate-900">
              My Account
            </h2>

            <div className="mt-5 space-y-2">

              <Link
                href="/dashboard"
                className="block rounded-xl bg-blue-50 px-4 py-3 font-bold text-blue-700"
              >
                🏠 Dashboard
              </Link>

              <Link
                href="/dashboard/profile"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                👤 My Profile
              </Link>

              <Link
                href="/dashboard/listings"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                📦 My Listings
              </Link>

              <Link
                href="/dashboard/messages"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                💬 Messages
              </Link>

              <Link
                href="/dashboard/payments"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                💳 Payments
              </Link>

              <Link
                href="/dashboard/favourites"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                ❤️ Favourites
              </Link>

              <Link
                href="/dashboard/settings"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                ⚙️ Settings
              </Link>

            </div>
          </div>

          {/* SELL */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-500 p-7 text-white shadow-lg lg:col-span-2">

            <p className="text-sm font-black uppercase tracking-widest text-cyan-100">
              Start Selling
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Have something to sell?
            </h2>

            <p className="mt-4 max-w-xl text-white/90">
              Post your product, vehicle, property, machinery, equipment or
              service and connect with buyers across Ghana.
            </p>

            <Link
              href="/sell"
              className="mt-7 inline-flex rounded-xl bg-white px-7 py-4 font-black text-blue-700 shadow-lg transition hover:-translate-y-1"
            >
              Create a Listing →
            </Link>

          </div>

        </div>

        {/* RECENT ACTIVITY */}
        <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest marketplace activity will appear here.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center">
            <div className="text-4xl">📋</div>

            <h3 className="mt-3 font-black text-slate-800">
              No activity yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Start by creating your first listing.
            </p>

            <Link
              href="/sell"
              className="mt-5 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white"
            >
              Post Your First Ad
            </Link>
          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="mt-10 border-t bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">

          <div className="font-black">
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
