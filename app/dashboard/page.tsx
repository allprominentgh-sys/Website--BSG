"use client";

import Link from "next/link";
import { useState } from "react";

const stats = [
  {
    title: "Total Users",
    value: "2,458",
    change: "+12.5%",
    icon: "👥",
  },
  {
    title: "Active Listings",
    value: "1,284",
    change: "+8.2%",
    icon: "🛍️",
  },
  {
    title: "Orders",
    value: "386",
    change: "+15.4%",
    icon: "📦",
  },
  {
    title: "Revenue",
    value: "GH₵128,450",
    change: "+18.7%",
    icon: "💰",
  },
];

const recentListings = [
  {
    name: "iPhone 15 Pro",
    seller: "Tech Ghana",
    category: "Phones",
    price: "GH₵12,500",
    status: "Approved",
  },
  {
    name: "Toyota Camry",
    seller: "Ghana Auto",
    category: "Vehicles",
    price: "GH₵185,000",
    status: "Pending",
  },
  {
    name: "3 Bedroom House",
    seller: "Prominent Properties",
    category: "Property",
    price: "GH₵950,000",
    status: "Approved",
  },
  {
    name: "Premium Laptop",
    seller: "Tech World",
    category: "Electronics",
    price: "GH₵8,500",
    status: "Review",
  },
];

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b bg-white">

        <div className="flex h-16 items-center justify-between px-4 md:px-6">

          <div className="flex items-center gap-3">

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            >
              ☰
            </button>

            <Link href="/" className="flex items-center gap-2">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-white">
                AP
              </div>

              <div className="hidden sm:block">
                <p className="font-extrabold text-blue-700">
                  ALL PROMINENT
                </p>
                <p className="text-[10px] font-semibold text-slate-400">
                  ADMINISTRATION
                </p>
              </div>

            </Link>

          </div>

          <div className="flex items-center gap-4">

            <button className="relative rounded-xl p-3 hover:bg-slate-100">
              🔔
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                A
              </div>

              <div>
                <p className="text-sm font-bold">
                  Administrator
                </p>
                <p className="text-xs text-slate-400">
                  Super Admin
                </p>
              </div>
            </div>

          </div>

        </div>

      </header>

      <div className="flex">

        {/* SIDEBAR */}
        <aside
          className={`${
            menuOpen ? "block" : "hidden"
          } fixed inset-y-16 left-0 z-30 w-64 border-r bg-white lg:static lg:block`}
        >

          <div className="p-4">

            <p className="mb-3 px-3 text-xs font-bold uppercase text-slate-400">
              Main Menu
            </p>

            <nav className="space-y-1">

              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 font-bold text-blue-700"
              >
                📊
                Dashboard
              </Link>

              <Link
                href="/listings"
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold hover:bg-slate-50"
              >
                🛍️
                Listings
              </Link>

              <Link
                href="/account"
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold hover:bg-slate-50"
              >
                👥
                Users
              </Link>

              <Link
                href="/post-ad"
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold hover:bg-slate-50"
              >
                📢
                Advertisements
              </Link>

              <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold hover:bg-slate-50">
                💳
                Payments
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold hover:bg-slate-50">
                🚚
                Delivery
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold hover:bg-slate-50">
                ✓
                Verification
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold hover:bg-slate-50">
                🏪
                Businesses
              </button>

            </nav>

            <p className="mb-3 mt-8 px-3 text-xs font-bold uppercase text-slate-400">
              System
            </p>

            <nav className="space-y-1">

              <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold hover:bg-slate-50">
                ⚙️
                Settings
              </button>

              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold hover:bg-slate-50"
              >
                🌐
                View Website
              </Link>

            </nav>

          </div>

        </aside>

        {/* MAIN CONTENT */}
        <section className="min-w-0 flex-1">

          <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">

            {/* PAGE TITLE */}
            <div className="mb-7">

              <p className="font-bold text-blue-600">
                ADMINISTRATION
              </p>

              <h1 className="mt-1 text-3xl font-extrabold">
                Dashboard
              </h1>

              <p className="mt-1 text-slate-500">
                Manage your marketplace, sellers, customers and orders.
              </p>

            </div>

            {/* STATS */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {stats.map((stat) => (
                <div
                  key={stat.title}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-sm font-semibold text-slate-500">
                        {stat.title}
                      </p>

                      <p className="mt-2 text-2xl font-extrabold">
                        {stat.value}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                      {stat.icon}
                    </div>

                  </div>

                  <p className="mt-4 text-sm font-bold text-green-600">
                    {stat.change}{" "}
                    <span className="font-normal text-slate-400">
                      this month
                    </span>
                  </p>

                </div>
              ))}

            </div>

            {/* QUICK ACTIONS */}
            <div className="mt-8">

              <h2 className="text-xl font-extrabold">
                Quick Actions
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <Link
                  href="/post-ad"
                  className="rounded-2xl bg-blue-600 p-5 text-white shadow-sm transition hover:bg-blue-700"
                >
                  <div className="text-3xl">📢</div>
                  <h3 className="mt-3 font-bold">
                    Create Advertisement
                  </h3>
                  <p className="mt-1 text-sm text-blue-100">
                    Create and manage promoted ads.
                  </p>
                </Link>

                <Link
                  href="/listings"
                  className="rounded-2xl border bg-white p-5 shadow-sm hover:border-blue-300"
                >
                  <div className="text-3xl">🛍️</div>
                  <h3 className="mt-3 font-bold">
                    Manage Listings
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Review marketplace products.
                  </p>
                </Link>

                <div className="rounded-2xl border bg-white p-5 shadow-sm hover:border-blue-300">
                  <div className="text-3xl">✓</div>
                  <h3 className="mt-3 font-bold">
                    Verify Businesses
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Review business verification requests.
                  </p>
                </div>

                <div className="rounded-2xl border bg-white p-5 shadow-sm hover:border-blue-300">
                  <div className="text-3xl">🚚</div>
                  <h3 className="mt-3 font-bold">
                    Delivery
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Manage orders and deliveries.
                  </p>
                </div>

              </div>

            </div>

            {/* RECENT LISTINGS */}
            <div className="mt-8 rounded-2xl border bg-white shadow-sm">

              <div className="flex items-center justify-between border-b p-5">

                <div>
                  <h2 className="text-xl font-extrabold">
                    Recent Listings
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest products submitted by sellers.
                  </p>
                </div>

                <Link
                  href="/listings"
                  className="font-bold text-blue-600"
                >
                  View all →
                </Link>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px] text-left">

                  <thead className="bg-slate-50 text-sm text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">
                        Product
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Seller
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Category
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Price
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {recentListings.map((item) => (
                      <tr
                        key={item.name}
                        className="border-t"
                      >

                        <td className="px-5 py-4 font-bold">
                          {item.name}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {item.seller}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {item.category}
                        </td>

                        <td className="px-5 py-4 font-bold">
                          {item.price}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              item.status === "Approved"
                                ? "bg-green-50 text-green-700"
                                : item.status === "Pending"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {item.status}
                          </span>

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

            </div>

            {/* PLATFORM FEATURES */}
            <div className="mt-8 grid gap-5 md:grid-cols-3">

              <div className="rounded-2xl border bg-white p-6">

                <div className="text-3xl">💳</div>

                <h3 className="mt-4 font-extrabold">
                  Payment Gateway
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Payment integration will allow customers
                  to pay sellers and manage marketplace orders.
                </p>

                <span className="mt-4 inline-block rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">
                  Coming next
                </span>

              </div>

              <div className="rounded-2xl border bg-white p-6">

                <div className="text-3xl">📍</div>

                <h3 className="mt-4 font-extrabold">
                  Delivery Tracking
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Customers will be able to pin their
                  delivery location and track orders.
                </p>

                <span className="mt-4 inline-block rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">
                  Coming next
                </span>

              </div>

              <div className="rounded-2xl border bg-white p-6">

                <div className="text-3xl">🤖</div>

                <h3 className="mt-4 font-extrabold">
                  AI Marketing
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  AI tools will help sellers create
                  descriptions and marketing content.
                </p>

                <span className="mt-4 inline-block rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">
                  Coming next
                </span>

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}
