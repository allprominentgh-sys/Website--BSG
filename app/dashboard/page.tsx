
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

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "My Listings", href: "/dashboard/listings", icon: "📦" },
  { label: "Post an Ad", href: "/sell", icon: "➕" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "📊" },
  { label: "Messages", href: "/dashboard/messages", icon: "💬" },
  { label: "More", href: "/dashboard/settings", icon: "☰" },
];

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setErrorMessage("");

    try {
      const supabase = supabaseBrowser();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      setUserEmail(user.email || "");

      const { data, error } = await supabase
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
        .order("created_at", { ascending: false });

      if (error) {
        console.error("DASHBOARD LISTINGS ERROR:", error);
        setErrorMessage(error.message);
        return;
      }

      setListings((data || []) as Listing[]);
    } catch (error) {
      console.error("DASHBOARD ERROR:", error);

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
      String(listing.status || "").toLowerCase() === "active"
  );

  function formatPrice(listing: Listing) {
    if (listing.price === null || listing.price === undefined) {
      return "Price not available";
    }

    const currency =
      listing.currency_code || listing.currency || "GHS";

    const symbols: Record<string, string> = {
      GHS: "GH₵",
      USD: "$",
      EUR: "€",
      GBP: "£",
      CNY: "¥",
    };

    return `${symbols[currency] || currency}${Number(
      listing.price
    ).toLocaleString()}`;
  }

  const stats = [
    {
      title: "My Listings",
      value: String(listings.length),
      icon: "📦",
      href: "/dashboard/listings",
      color: "bg-blue-50",
    },
    {
      title: "Active Ads",
      value: String(activeListings.length),
      icon: "🟢",
      href: "/dashboard/listings",
      color: "bg-green-50",
    },
    {
      title: "Listing Views",
      value: "0",
      icon: "👁️",
      href: "/dashboard/analytics",
      color: "bg-purple-50",
    },
    {
      title: "Website Visits",
      value: "0",
      icon: "🌐",
      href: "/dashboard/visits",
      color: "bg-orange-50",
    },
  ];

  const quickActions = [
    {
      title: "Post an Ad",
      description: "Create a new product or service listing",
      icon: "➕",
      href: "/sell",
      color: "bg-blue-50",
    },
    {
      title: "My Listings",
      description: "View and manage your advertisements",
      icon: "📦",
      href: "/dashboard/listings",
      color: "bg-sky-50",
    },
    {
      title: "Messages",
      description: "Connect with interested customers",
      icon: "💬",
      href: "/dashboard/messages",
      color: "bg-purple-50",
    },
    {
      title: "Payments",
      description: "View your payments and transactions",
      icon: "💳",
      href: "/dashboard/payments",
      color: "bg-green-50",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f3f7fb] text-[#15365d]">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#12345b] text-lg font-black text-white">
              AP
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-black tracking-wide text-[#12345b] sm:text-base">
                BEST SALES GHANA
              </div>
              <div className="text-[10px] font-bold tracking-[0.18em] text-slate-500 sm:text-xs">
                BUY • SELL • ADVERTISE
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-4 sm:flex">
            <Link
              href="/dashboard/profile"
              className="hidden max-w-[220px] truncate text-sm font-semibold text-slate-600 md:block"
            >
              {userEmail || "My Account"}
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-[#15365d] transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xl sm:hidden"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white p-3 shadow-sm sm:hidden">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-blue-50"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl px-4 py-3 text-left font-semibold text-red-600"
            >
              🚪 Logout
            </button>
          </nav>
        </div>
      )}

      {/* MAIN NAVIGATION */}
      <div className="bg-[#12345b] text-white">
        <nav className="mx-auto flex max-w-[1500px] gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {navigation.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                index === 0
                  ? "bg-white/15 text-white"
                  : "text-blue-100 hover:bg-white/10"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* PAGE CONTENT */}
      <section className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">

        {/* WELCOME */}
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6d87a3]">
            BEST SALES GHANA
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#12345b] sm:text-4xl">
            My Dashboard
          </h1>

          <p className="mt-3 text-base text-slate-500 sm:text-lg">
            Manage your marketplace activity, listings and customers from one place.
          </p>

          {userEmail && (
            <p className="mt-2 text-sm text-slate-500">
              Welcome back, {userEmail}
            </p>
          )}
        </div>

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            Unable to load your listings:
            <p className="mt-1">{errorMessage}</p>
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.title}
              href={stat.href}
              className="flex items-center gap-4 rounded-2xl border border-[#dce6ef] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${stat.color}`}
              >
                {stat.icon}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7890a8]">
                  {stat.title}
                </p>
                <p className="mt-1 text-3xl font-black text-[#12345b]">
                  {loading ? "..." : stat.value}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div className="mt-8 rounded-3xl border border-[#dce6ef] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7890a8]">
              Quick Actions
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#12345b] sm:text-3xl">
              Manage Your Business
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Access the tools you need to grow your business.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group flex min-h-[170px] flex-col justify-between rounded-2xl border border-[#dce6ef] bg-[#fbfdff] p-6 transition hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-md"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${action.color}`}
                >
                  {action.icon}
                </div>

                <div className="mt-5">
                  <h3 className="text-lg font-black text-[#15365d]">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {action.description}
                  </p>
                </div>

                <div className="mt-4 text-sm font-black text-blue-700">
                  Open section →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* RECENT LISTINGS */}
        <div className="mt-8 rounded-3xl border border-[#dce6ef] bg-white p-5 shadow-sm sm:p-7">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7890a8]">
                Seller Centre
              </p>

              <h2 className="mt-2 text-2xl font-black text-[#12345b] sm:text-3xl">
                Recent Listings
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Your latest advertisements on BEST SALES GHANA.
              </p>
            </div>

            <Link
              href="/dashboard/listings"
              className="inline-flex items-center justify-center rounded-xl border border-blue-200 px-5 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-50"
            >
              View All Listings →
            </Link>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-10 text-center">
              <div className="text-3xl">⏳</div>
              <p className="mt-3 font-bold text-slate-600">
                Loading your listings...
              </p>
            </div>
          ) : listings.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-10 text-center">
              <div className="text-4xl">📦</div>

              <h3 className="mt-3 text-lg font-black text-slate-800">
                No listings yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create your first advertisement to start selling.
              </p>

              <Link
                href="/sell"
                className="mt-5 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-black text-white transition hover:bg-blue-800"
              >
                ➕ Post Your First Ad
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {listings.slice(0, 5).map((listing) => (
                <div
                  key={String(listing.id)}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-[#fbfdff] p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black text-[#15365d]">
                      {listing.title || "Untitled Listing"}
                    </h3>

                    <p className="mt-1 text-lg font-black text-blue-700">
                      {formatPrice(listing)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                      {listing.category && (
                        <span className="rounded-full bg-blue-50 px-3 py-1">
                          {listing.category}
                        </span>
                      )}

                      {listing.subcategory && (
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {listing.subcategory}
                        </span>
                      )}

                      {listing.status && (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
                          {listing.status}
                        </span>
                      )}
                    </div>

                    {listing.location && (
                      <p className="mt-3 truncate text-sm text-slate-500">
                        📍 {listing.location}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="rounded-xl border border-blue-700 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                    >
                      View
                    </Link>

                    <Link
                      href="/dashboard/listings"
                      className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-800"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM HELP CARD */}
        <div className="mt-8 flex flex-col gap-5 rounded-3xl bg-[#12345b] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">
              Need Assistance?
            </p>

            <h2 className="mt-2 text-2xl font-black">
              We are here to help.
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
              Contact our support team if you need help with your account,
              advertisements or payments.
            </p>
          </div>

          <Link
            href="/dashboard/support"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3 font-black text-[#12345b] transition hover:bg-blue-50"
          >
            Help & Support →
          </Link>
        </div>

        {/* FOOTER */}
        <footer className="mt-10 border-t border-slate-200 py-8 text-center">
          <p className="font-black tracking-wide text-[#12345b]">
            BEST SALES GHANA
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Buy • Sell • Advertise • Connect
          </p>

          <p className="mt-4 text-xs text-slate-400">
            © 2026 All Prominent Ghana Limited. All rights reserved.
          </p>
        </footer>

      </section>
    </main>
  );
}
