"use client";

import Link from "next/link";

export default function ListingsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/dashboard">
            <div className="text-xl font-black text-slate-900 sm:text-2xl">
              BEST SALES GHANA
            </div>

            <div className="text-sm font-medium text-slate-500">
              My Listings
            </div>
          </Link>

          <Link
            href="/sell"
            className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-md hover:bg-blue-800"
          >
            ➕ Post an Ad
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-bold text-blue-700"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">
            My Listings
          </h1>

          <p className="mt-2 text-slate-500">
            Manage and monitor all your advertisements.
          </p>
        </div>

        {/* ACTIONS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/sell"
            className="rounded-2xl bg-blue-700 p-6 text-white shadow-md transition hover:-translate-y-1"
          >
            <div className="text-3xl">➕</div>
            <div className="mt-3 text-xl font-black">
              Post an Ad
            </div>
            <p className="mt-1 text-sm text-blue-100">
              Create a new listing
            </p>
          </Link>

          <Link
            href="/dashboard/monitor"
            className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1"
          >
            <div className="text-3xl">📊</div>
            <div className="mt-3 text-xl font-black text-slate-900">
              Monitor Ads
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Track your advertisement performance
            </p>
          </Link>

          <Link
            href="/dashboard/promote"
            className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1"
          >
            <div className="text-3xl">⭐</div>
            <div className="mt-3 text-xl font-black text-slate-900">
              Promote
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Boost your advertisements
            </p>
          </Link>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-3xl">👁️</div>
            <div className="mt-3 text-xl font-black text-slate-900">
              Total Views
            </div>
            <div className="mt-1 text-2xl font-black text-blue-700">
              0
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white">
              All Listings
            </button>

            <button className="rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700">
              Active
            </button>

            <button className="rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700">
              Pending
            </button>

            <button className="rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700">
              Rejected
            </button>

            <button className="rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700">
              Expired
            </button>
          </div>
        </div>

        {/* LISTINGS */}
        <div className="mt-6 rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="text-5xl">📦</div>

            <h2 className="mt-4 text-2xl font-black text-slate-900">
              No listings yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-500">
              You haven't posted any advertisements yet. Create your first
              listing and start selling on BEST SALES GHANA.
            </p>

            <Link
              href="/sell"
              className="mt-6 inline-flex rounded-xl bg-blue-700 px-7 py-4 font-black text-white shadow-md hover:bg-blue-800"
            >
              ➕ Create Your First Listing
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-10 border-t bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center">
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
