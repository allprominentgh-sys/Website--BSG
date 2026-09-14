"use client";

import Link from "next/link";

const adminSections = [
  {
    title: "Direct Sales",
    description:
      "Manage products owned and sold directly by Best Sales Ghana.",
    icon: "🛒",
    href: "/admin/direct-sales",
    action: "Manage Products",
  },
  {
    title: "Marketplace Listings",
    description:
      "Review and manage listings posted by marketplace sellers.",
    icon: "📋",
    href: "/listings",
    action: "View Listings",
  },
  {
    title: "Sellers",
    description:
      "Manage seller accounts, verification and seller activity.",
    icon: "👥",
    href: "#",
    action: "Manage Sellers",
  },
  {
    title: "Customers",
    description:
      "View and manage customer accounts.",
    icon: "👤",
    href: "#",
    action: "Manage Customers",
  },
  {
    title: "Orders",
    description:
      "Monitor customer orders and order activity.",
    icon: "📦",
    href: "#",
    action: "View Orders",
  },
  {
    title: "Delivery & Tracking",
    description:
      "Manage deliveries and marketplace tracking.",
    icon: "🚚",
    href: "#",
    action: "Manage Delivery",
  },
  {
    title: "Payments",
    description:
      "Monitor marketplace payments and transactions.",
    icon: "💳",
    href: "#",
    action: "View Payments",
  },
  {
    title: "Revenue & Payments",
    description:
      "Monitor the 2.15% platform revenue, seller settlements, held funds, delivery payments and Top Priority fee exemptions.",
    icon: "💰",
    href: "/admin/revenue",
    action: "Manage Revenue",
  },
  {
    title: "Advertising",
    description:
      "Manage advertising placements and promotional content.",
    icon: "📢",
    href: "#",
    action: "Manage Advertising",
  },
  {
    title: "Settings",
    description:
      "Configure marketplace and administrator settings.",
    icon: "⚙️",
    href: "#",
    action: "Open Settings",
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <Link href="/" className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-2xl shadow-md">
              ⭐
            </div>

            <div>
              <div className="text-lg font-black tracking-tight sm:text-xl">
                BEST SALES GHANA
              </div>

              <div className="text-xs text-slate-500">
                Administration Portal
              </div>
            </div>

          </Link>

          <div className="flex items-center gap-2">

            <Link
              href="/"
              className="hidden rounded-xl px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-100 sm:block"
            >
              View Website
            </Link>

            <button
              type="button"
              className="rounded-xl bg-slate-950 px-4 py-2.5 font-bold text-white hover:bg-slate-800"
            >
              Admin
            </button>

          </div>

        </div>
      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* PAGE TITLE */}
        <div className="mb-8">

          <p className="text-sm font-black uppercase tracking-widest text-blue-700">
            Administration
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            Admin Dashboard
          </h1>

          <p className="mt-3 max-w-3xl text-slate-500">
            Manage Best Sales Ghana, your direct-sales products,
            marketplace sellers, customers, orders, deliveries,
            payments, revenue and advertising.
          </p>

        </div>

        {/* SUMMARY CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* DIRECT SALES */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <span className="text-sm font-bold text-slate-500">
                Direct Sales
              </span>

              <span className="text-2xl">
                🛒
              </span>

            </div>

            <div className="mt-4 text-3xl font-black">
              0
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Products published
            </p>

          </div>

          {/* MARKETPLACE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <span className="text-sm font-bold text-slate-500">
                Marketplace
              </span>

              <span className="text-2xl">
                📋
              </span>

            </div>

            <div className="mt-4 text-3xl font-black">
              0
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Seller listings
            </p>

          </div>

          {/* ORDERS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <span className="text-sm font-bold text-slate-500">
                Orders
              </span>

              <span className="text-2xl">
                📦
              </span>

            </div>

            <div className="mt-4 text-3xl font-black">
              0
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Orders received
            </p>

          </div>

          {/* CUSTOMERS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <span className="text-sm font-bold text-slate-500">
                Customers
              </span>

              <span className="text-2xl">
                👤
              </span>

            </div>

            <div className="mt-4 text-3xl font-black">
              0
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Registered customers
            </p>

          </div>

        </div>

        {/* REVENUE SUMMARY */}
        <section className="mt-8">

          <div className="mb-5">

            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Platform Finance
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Revenue & Payment Overview
            </h2>

            <p className="mt-2 max-w-3xl text-slate-500">
              Monitor marketplace payment activity, platform revenue,
              seller funds and settlement status.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* PLATFORM RATE */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">

              <div className="flex items-center justify-between">

                <span className="text-sm font-bold text-blue-700">
                  Platform Revenue
                </span>

                <span className="text-2xl">
                  📊
                </span>

              </div>

              <div className="mt-4 text-3xl font-black text-blue-900">
                2.15%
              </div>

              <p className="mt-1 text-sm text-blue-700">
                Standard marketplace payment fee
              </p>

            </div>

            {/* SELLER FUNDS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <span className="text-sm font-bold text-slate-500">
                  Seller Funds Held
                </span>

                <span className="text-2xl">
                  🔒
                </span>

              </div>

              <div className="mt-4 text-3xl font-black">
                GH₵0
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Awaiting settlement
              </p>

            </div>

            {/* REVENUE */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <span className="text-sm font-bold text-slate-500">
                  Platform Revenue
                </span>

                <span className="text-2xl">
                  💰
                </span>

              </div>

              <div className="mt-4 text-3xl font-black">
                GH₵0
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Revenue collected
              </p>

            </div>

            {/* SETTLEMENT */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <span className="text-sm font-bold text-slate-500">
                  Pending Settlement
                </span>

                <span className="text-2xl">
                  ⏳
                </span>

              </div>

              <div className="mt-4 text-3xl font-black">
                GH₵0
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Scheduled for release
              </p>

            </div>

          </div>

        </section>

        {/* DIRECT SALES FEATURE */}
        <section className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-500 p-7 text-white shadow-xl sm:p-10">

          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

            <div>

              <p className="text-sm font-black uppercase tracking-widest text-cyan-100">
                Your Products
              </p>

              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Direct Sales Products
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-white/85">
                Add and manage products owned by Best Sales Ghana.
                You decide when a product is published. Direct-sales
                products will appear normally together with other
                marketplace listings and will not be pinned.
              </p>

            </div>

            <Link
              href="/admin/direct-sales"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-4 font-black text-blue-800 shadow-lg transition hover:-translate-y-1"
            >
              Manage Direct Sales →
            </Link>

          </div>

        </section>

        {/* REVENUE & PAYMENT FEATURE */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">

          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

            <div>

              <p className="text-sm font-black uppercase tracking-widest text-blue-700">
                Financial Control
              </p>

              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Revenue & Payments
              </h2>

              <p className="mt-3 max-w-3xl leading-7 text-slate-500">
                View customer payments, automatically calculate the
                2.15% platform revenue, monitor seller funds and manage
                settlement releases.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">

                <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-black text-blue-700">
                  2.15% PLATFORM REVENUE
                </span>

                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-700">
                  SELLER FUNDS HELD
                </span>

                <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-black text-green-700">
                  DELIVERY RELEASE
                </span>

                <span className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-black text-purple-700">
                  5-DAY SETTLEMENT
                </span>

              </div>

            </div>

            <Link
              href="/admin/revenue"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-950 px-6 py-4 font-black text-white shadow-lg transition hover:-translate-y-1 hover:bg-blue-700"
            >
              Open Revenue Dashboard →
            </Link>

          </div>

        </section>

        {/* ADMIN SECTIONS */}
        <section className="mt-10">

          <div className="mb-6">

            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Management
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Marketplace Administration
            </h2>

          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {adminSections.map((section) => (

              <div
                key={section.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >

                <div className="flex items-start justify-between gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                    {section.icon}
                  </div>

                  {section.title === "Direct Sales" && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                      YOUR PRODUCTS
                    </span>
                  )}

                  {section.title === "Revenue & Payments" && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                      2.15%
                    </span>
                  )}

                </div>

                <h3 className="mt-5 text-xl font-black">
                  {section.title}
                </h3>

                <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-500">
                  {section.description}
                </p>

                <Link
                  href={section.href}
                  className="mt-5 inline-flex rounded-xl border border-blue-700 px-4 py-3 font-bold text-blue-700 transition hover:bg-blue-700 hover:text-white"
                >
                  {section.action}
                </Link>

              </div>

            ))}

          </div>

        </section>

        {/* DIRECT SALES CONTROL */}
        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-black">
            Direct Sales Control
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">

            <div className="rounded-xl bg-slate-50 p-5">

              <div className="text-2xl">
                📷
              </div>

              <h3 className="mt-3 font-black">
                Product Pictures
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Upload and replace product images whenever necessary.
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-5">

              <div className="text-2xl">
                💵
              </div>

              <h3 className="mt-3 font-black">
                Price Management
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Change product prices from the admin area without
                changing website code.
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-5">

              <div className="text-2xl">
                📦
              </div>

              <h3 className="mt-3 font-black">
                Stock Management
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Control stock quantities and whether products are
                available.
              </p>

            </div>

          </div>

        </section>

        {/* PAYMENT RULES */}
        <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">

          <div className="flex gap-4">

            <div className="text-2xl">
              💳
            </div>

            <div>

              <h2 className="text-xl font-black text-blue-900">
                Marketplace Payment Structure
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-3">

                <div className="rounded-xl bg-white p-4">

                  <p className="text-xs font-black uppercase tracking-wider text-blue-700">
                    Standard Marketplace
                  </p>

                  <p className="mt-2 text-2xl font-black">
                    2.15%
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Platform revenue automatically calculated
                    from eligible platform payments.
                  </p>

                </div>

                <div className="rounded-xl bg-white p-4">

                  <p className="text-xs font-black uppercase tracking-wider text-amber-700">
                    Settlement
                  </p>

                  <p className="mt-2 text-2xl font-black">
                    5 Days
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Seller funds can remain held for the settlement
                    period.
                  </p>

                </div>

                <div className="rounded-xl bg-white p-4">

                  <p className="text-xs font-black uppercase tracking-wider text-green-700">
                    Delivery
                  </p>

                  <p className="mt-2 text-2xl font-black">
                    Successful
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Funds can be released after successful delivery
                    according to the payment rules.
                  </p>

                </div>

              </div>

              <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50 p-4">

                <p className="text-sm leading-6 text-purple-900">

                  <strong>Top Priority advertising:</strong>{" "}
                  Sellers who purchase the Top Priority advertising
                  package are not charged the 2.15% platform payment
                  revenue on payments covered by that specific
                  arrangement. Top Priority advertising includes Best
                  Sales Ghana delivery and tracking.

                </p>

              </div>

            </div>

          </div>

        </section>

        {/* SECURITY NOTICE */}
        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">

          <div className="flex gap-3">

            <div className="text-xl">
              🔐
            </div>

            <div>

              <h3 className="font-black text-amber-900">
                Admin security
              </h3>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                This page is currently the dashboard interface.
                The next stage will connect it to a proper admin
                login and protected database so ordinary marketplace
                users cannot access these controls.
              </p>

            </div>

          </div>

        </section>

      </section>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-200 bg-slate-950">

        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">

          <p className="font-black text-white">
            BEST SALES GHANA — ADMINISTRATION
          </p>

          <p className="mt-2 text-sm text-slate-500">
            © {new Date().getFullYear()} All Prominent Ghana Limited.
            All rights reserved.
          </p>

        </div>

      </footer>

    </main>
  );
}
