"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Listing = {
  id: string | number;
  title: string | null;
  price: number | null;
  currency_code: string | null;
  currency: string | null;
  category: string | null;
  subcategory: string | null;
  status: string | null;
  created_at: string | null;
  location: string | null;
};

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "My Orders", href: "/dashboard/orders", icon: "📦" },
  { label: "My Listings", href: "/dashboard/listings", icon: "🛒" },
  { label: "Post an Ad", href: "/sell", icon: "➕" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "📊" },
  { label: "Website Visits", href: "/dashboard/visits", icon: "👁️" },
  { label: "Messages", href: "/dashboard/messages", icon: "💬" },
  { label: "Favourites", href: "/dashboard/favourites", icon: "❤️" },
  { label: "Payments", href: "/dashboard/payments", icon: "💳" },
  { label: "Promote Ads", href: "/dashboard/promote", icon: "⭐" },
  { label: "My Profile", href: "/dashboard/profile", icon: "👤" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
  { label: "Help & Support", href: "/dashboard/support", icon: "❓" },
];

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setErrorMessage("");

    try {
      const supabase = supabaseBrowser();

      // ---------------------------------------------
      // GET CURRENT USER
      // ---------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      setUserEmail(user.email || "");

      // ---------------------------------------------
      // GET SELLER LISTINGS
      // ---------------------------------------------

      const {
        data,
        error,
      } = await supabase
        .from("listings")
        .select(
          `
            id,
            title,
            price,
            currency_code,
            currency,
            category,
            subcategory,
            status,
            created_at,
            location
          `
        )
        .eq("seller_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "DASHBOARD LISTINGS ERROR:",
          error
        );

        setErrorMessage(error.message);
        return;
      }

      setListings((data || []) as Listing[]);
    } catch (error) {
      console.error(
        "DASHBOARD ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    const supabase = supabaseBrowser();

    await supabase.auth.signOut();

    window.location.href = "/login";
  }

  const activeListings = listings.filter(
    (listing) =>
      String(listing.status || "").toLowerCase() ===
      "active"
  );

  const totalListings = listings.length;

  const currencyFor = (listing: Listing) =>
    listing.currency_code ||
    listing.currency ||
    "GHS";

  function formatPrice(listing: Listing) {
    if (listing.price === null || listing.price === undefined) {
      return "Price not available";
    }

    const currency = currencyFor(listing);

    const symbols: Record<string, string> = {
      GHS: "GH₵",
      USD: "$",
      EUR: "€",
      GBP: "£",
      CNY: "¥",
    };

    const symbol =
      symbols[currency] || currency;

    return `${symbol}${Number(
      listing.price
    ).toLocaleString()}`;
  }

  const stats = [
    {
      title: "My Listings",
      value: String(totalListings),
      icon: "📦",
      href: "/dashboard/listings",
    },
    {
      title: "Active Ads",
      value: String(activeListings.length),
      icon: "🟢",
      href: "/dashboard/listings",
    },
    {
      title: "Listing Views",
      value: "0",
      icon: "👁️",
      href: "/dashboard/analytics",
    },
    {
      title: "Website Visits",
      value: "0",
      icon: "🌐",
      href: "/dashboard/visits",
    },
    {
      title: "Messages",
      value: "0",
      icon: "💬",
      href: "/dashboard/messages",
    },
    {
      title: "Favourites",
      value: "0",
      icon: "❤️",
      href: "/dashboard/favourites",
    },
    {
      title: "Orders",
      value: "0",
      icon: "🛍️",
      href: "/dashboard/orders",
    },
    {
      title: "Payments",
      value: "GH₵0",
      icon: "💳",
      href: "/dashboard/payments",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* MOBILE TOP BAR */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm lg:hidden">

        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 font-black text-white">
            AP
          </div>

          <div>
            <div className="text-sm font-black text-blue-700">
              BEST SALES GHANA
            </div>

            <div className="text-[10px] font-bold text-slate-500">
              BUY • SELL • ADVERTISE
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(
              !mobileMenuOpen
            )
          }
          className="rounded-xl border bg-white px-4 py-2 text-xl"
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[65px] z-40 max-h-[80vh] overflow-y-auto border-b bg-white p-4 shadow-xl lg:hidden">

          <nav className="space-y-1">

            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              >
                <span className="text-xl">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>
              </Link>
            ))}

            <div className="mt-4 border-t pt-4">

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-red-600"
              >
                <span className="text-xl">
                  🚪
                </span>

                Logout
              </button>

            </div>

          </nav>

        </div>
      )}

      <div className="flex min-h-screen">

        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-64 shrink-0 bg-[#082b52] text-white lg:block">

          <div className="sticky top-0 flex h-screen flex-col">

            {/* LOGO */}
            <div className="border-b border-white/10 px-5 py-6">

              <Link
                href="/"
                className="flex items-center gap-3"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-xl font-black">
                  AP
                </div>

                <div>

                  <div className="font-black tracking-wide">
                    BEST SALES GHANA
                  </div>

                  <div className="text-xs font-bold text-blue-200">
                    GHANA
                  </div>

                  <div className="text-[9px] font-semibold text-blue-300">
                    Buy • Sell • Advertise • Connect
                  </div>

                </div>

              </Link>

            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 overflow-y-auto px-3 py-5">

              <p className="px-3 pb-3 text-[10px] font-black uppercase tracking-widest text-blue-300">
                My Account
              </p>

              <div className="space-y-1">

                {menuItems.map(
                  (item, index) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        index === 0
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-blue-50 hover:bg-white/10"
                      }`}
                    >

                      <span className="w-6 text-center text-lg">
                        {item.icon}
                      </span>

                      <span>
                        {item.label}
                      </span>

                    </Link>
                  )
                )}

              </div>

            </nav>

            {/* LOGOUT */}
            <div className="border-t border-white/10 p-4">

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-blue-100 hover:bg-white/10"
              >

                <span className="text-lg">
                  🚪
                </span>

                Logout

              </button>

            </div>

          </div>

        </aside>

        {/* MAIN AREA */}
        <div className="min-w-0 flex-1">

          {/* TOP HEADER */}
          <header className="hidden border-b bg-white lg:block">

            <div className="flex items-center justify-between gap-6 px-8 py-4">

              <div className="flex max-w-2xl flex-1 items-center rounded-xl border bg-slate-50 px-4 py-3">

                <span className="mr-3 text-xl text-slate-400">
                  🔍
                </span>

                <input
                  type="text"
                  placeholder="Search products, machines, inks, parts..."
                  className="w-full bg-transparent text-sm outline-none"
                />

              </div>

              <div className="flex items-center gap-5">

                <button
                  type="button"
                  className="flex items-center gap-2 font-bold text-slate-700"
                >
                  🇬🇭 GHS
                  <span className="text-xs">
                    ▼
                  </span>
                </button>

                <Link
                  href="/dashboard/orders"
                  className="relative text-2xl"
                >
                  🛒

                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                    0
                  </span>

                </Link>

                <button
                  type="button"
                  className="relative text-2xl"
                >
                  🔔

                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                    0
                  </span>

                </button>

                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3"
                >

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-black text-white">
                    AP
                  </div>

                  <div className="hidden xl:block">

                    <div className="text-sm font-black">
                      My Account
                    </div>

                    <div className="max-w-[180px] truncate text-xs text-slate-500">
                      {userEmail ||
                        "Client"}
                    </div>

                  </div>

                  <span className="text-slate-500">
                    ▼
                  </span>

                </Link>

              </div>

            </div>

          </header>

          {/* CONTENT */}
          <section className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

            {/* PAGE TITLE */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                  My Account
                </p>

                <h1 className="mt-1 text-3xl font-black text-slate-900 sm:text-4xl">
                  Dashboard
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Manage your marketplace activity, listings, orders and account.
                </p>

              </div>

              <Link
                href="/sell"
                className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-6 py-3 font-black text-white shadow-md transition hover:bg-blue-800"
              >
                ➕ Post an Ad
              </Link>

            </div>

            {/* ERROR */}
            {errorMessage && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
                Unable to load your listings:
                <div className="mt-1">
                  {errorMessage}
                </div>
              </div>
            )}

            {/* QUICK STATISTICS */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {stats.map((stat) => (
                <Link
                  key={stat.title}
                  href={stat.href}
                  className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm font-bold text-slate-500">
                        {stat.title}
                      </p>

                      <p className="mt-3 text-3xl font-black text-slate-900">
                        {loading
                          ? "..."
                          : stat.value}
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                      {stat.icon}
                    </div>

                  </div>

                  <p className="mt-4 text-xs font-bold text-blue-700 opacity-0 transition group-hover:opacity-100">
                    View details →
                  </p>

                </Link>
              ))}

            </div>

            {/* MAIN DASHBOARD GRID */}
            <div className="mt-6 grid gap-6 xl:grid-cols-3">

              {/* SELLING CARD */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-sky-500 p-7 text-white shadow-lg xl:col-span-2">

                <p className="text-xs font-black uppercase tracking-widest text-blue-100">
                  Start Selling
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  Grow your business on BEST SALES GHANA
                </h2>

                <p className="mt-4 max-w-2xl leading-7 text-blue-50">
                  List products, machinery, vehicles, property, equipment,
                  printing supplies and services and connect with customers
                  across Ghana.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">

                  <Link
                    href="/sell"
                    className="rounded-xl bg-white px-6 py-3 font-black text-blue-700 shadow-md"
                  >
                    ➕ Create Listing
                  </Link>

                  <Link
                    href="/dashboard/listings"
                    className="rounded-xl border border-white/40 px-6 py-3 font-bold text-white"
                  >
                    📦 My Listings
                  </Link>

                </div>

              </div>

              {/* PROFILE CARD */}
              <div className="rounded-2xl border bg-white p-6 shadow-sm">

                <div className="flex items-center gap-4">

                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-black text-white">
                    AP
                  </div>

                  <div>

                    <h2 className="font-black text-slate-900">
                      My Account
                    </h2>

                    <p className="truncate text-sm text-slate-500">
                      {userEmail ||
                        "Client / Seller"}
                    </p>

                  </div>

                </div>

                <div className="mt-6 space-y-3">

                  <Link
                    href="/dashboard/profile"
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold"
                  >
                    <span>
                      👤 My Profile
                    </span>
                    <span>
                      →
                    </span>
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold"
                  >
                    <span>
                      ⚙️ Settings
                    </span>
                    <span>
                      →
                    </span>
                  </Link>

                </div>

              </div>

            </div>

            {/* MY LISTINGS PREVIEW */}
            <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                    Seller Centre
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    My Recent Listings
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your latest advertisements.
                  </p>

                </div>

                <Link
                  href="/dashboard/listings"
                  className="text-sm font-black text-blue-700"
                >
                  View all listings →
                </Link>

              </div>

              {loading ? (
                <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center">

                  <div className="text-3xl">
                    ⏳
                  </div>

                  <p className="mt-3 font-bold text-slate-600">
                    Loading your listings...
                  </p>

                </div>
              ) : listings.length === 0 ? (
                <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center">

                  <div className="text-4xl">
                    📦
                  </div>

                  <h3 className="mt-3 font-black text-slate-800">
                    No listings yet
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Create your first advertisement to start selling.
                  </p>

                  <Link
                    href="/sell"
                    className="mt-5 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-black text-white"
                  >
                    ➕ Post Your First Ad
                  </Link>

                </div>
              ) : (
                <div className="mt-6 space-y-4">

                  {listings
                    .slice(0, 5)
                    .map((listing) => (
                      <div
                        key={String(
                          listing.id
                        )}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                      >

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                          <div className="min-w-0">

                            <h3 className="truncate text-lg font-black text-slate-900">
                              {listing.title ||
                                "Untitled Listing"}
                            </h3>

                            <p className="mt-1 text-lg font-black text-blue-700">
                              {formatPrice(
                                listing
                              )}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">

                              {listing.category && (
                                <span className="rounded-full bg-white px-3 py-1">
                                  {listing.category}
                                </span>
                              )}

                              {listing.subcategory && (
                                <span className="rounded-full bg-white px-3 py-1">
                                  {listing.subcategory}
                                </span>
                              )}

                              {listing.status && (
                                <span className="rounded-full bg-white px-3 py-1">
                                  {listing.status}
                                </span>
                              )}

                            </div>

                            {listing.location && (
                              <p className="mt-2 truncate text-sm text-slate-500">
                                📍 {listing.location}
                              </p>
                            )}

                          </div>

                          <div className="flex shrink-0 flex-wrap gap-2">

                            <Link
                              href={`/listings/${listing.id}`}
                              className="rounded-xl border border-blue-700 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
                            >
                              View
                            </Link>

                            <Link
                              href="/dashboard/listings"
                              className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800"
                            >
                              Manage
                            </Link>

                          </div>

                        </div>

                      </div>
                    ))}

                </div>
              )}

            </div>

            {/* ANALYTICS PREVIEW */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">

              {/* VISITS */}
              <Link
                href="/dashboard/visits"
                className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                      Website Analytics
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      Website Visits
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Track visitors coming to your marketplace.
                    </p>

                  </div>

                  <div className="text-3xl">
                    🌐
                  </div>

                </div>

                <div className="mt-6 rounded-xl bg-slate-50 p-6">

                  <div className="text-3xl font-black">
                    0
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Total visits
                  </p>

                </div>

              </Link>

              {/* LISTING ANALYTICS */}
              <Link
                href="/dashboard/analytics"
                className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                      Seller Analytics
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      Listing Performance
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Monitor views, favourites and customer interest.
                    </p>

                  </div>

                  <div className="text-3xl">
                    📊
                  </div>

                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xl font-black">
                      0
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Views
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xl font-black">
                      0
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Favourites
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xl font-black">
                      0
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Messages
                    </div>
                  </div>

                </div>

              </Link>

            </div>

            {/* RECENT ACTIVITY */}
            <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                    Activity
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    Recent Activity
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your latest marketplace activity will appear here.
                  </p>

                </div>

                <Link
                  href="/dashboard/analytics"
                  className="text-sm font-black text-blue-700"
                >
                  View analytics →
                </Link>

              </div>

              {listings.length > 0 ? (
                <div className="mt-6 space-y-3">

                  {listings
                    .slice(0, 3)
                    .map((listing) => (
                      <div
                        key={`activity-${String(
                          listing.id
                        )}`}
                        className="flex items-center gap-4 rounded-xl bg-slate-50 p-4"
                      >

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl">
                          📦
                        </div>

                        <div className="min-w-0">

                          <p className="truncate font-bold text-slate-800">
                            {listing.title}
                          </p>

                          <p className="text-xs text-slate-500">
                            Advertisement created
                          </p>

                        </div>

                      </div>
                    ))}

                </div>
              ) : (
                <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center">

                  <div className="text-4xl">
                    📋
                  </div>

                  <h3 className="mt-3 font-black text-slate-800">
                    No activity yet
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Your listings, views, messages and orders will appear here.
                  </p>

                </div>
              )}

            </div>

            {/* FOOTER */}
            <footer className="mt-8 border-t py-8 text-center">

              <div className="font-black text-slate-800">
                BEST SALES GHANA
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Buy • Sell • Advertise • Connect
              </p>

              <p className="mt-4 text-xs text-slate-400">
                © 2026 All Prominent Ghana Limited. All rights reserved.
              </p>

            </footer>

          </section>

        </div>

      </div>

    </main>
  );
}
