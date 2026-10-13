"use client";

import Link from "next/link";
import { useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

const settingsLinks = [
  {
    title: "My Profile",
    description: "Manage your name, email and personal information.",
    href: "/dashboard/profile",
    icon: "♙",
  },
  {
    title: "Company Profile",
    description: "Manage your business information.",
    href: "/dashboard/company",
    icon: "▤",
  },
  {
    title: "My Listings",
    description: "View and manage your advertisements.",
    href: "/dashboard/listings",
    icon: "▣",
  },
  {
    title: "Promote Ads",
    description: "Manage advertising and promotion options.",
    href: "/dashboard/promote",
    icon: "★",
  },
  {
    title: "Messages",
    description: "Open your buyer and seller conversations.",
    href: "/dashboard/messages",
    icon: "✉",
  },
  {
    title: "Payments",
    description: "View your payment information.",
    href: "/dashboard/payments",
    icon: "₵",
  },
  {
    title: "Help & Support",
    description: "Get assistance with your account.",
    href: "/dashboard/support",
    icon: "?",
  },
];

export default function SettingsPage() {
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      const supabase = supabaseBrowser();
      const { error: logoutError } = await supabase.auth.signOut();

      if (logoutError) {
        setError(logoutError.message);
        setLoggingOut(false);
        return;
      }

      window.location.replace("/login");
    } catch {
      setError("Unable to log out. Please try again.");
      setLoggingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f7fb] px-4 py-6 text-[#15365d] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#12345b] text-lg font-black text-white">
              BS
            </div>

            <div>
              <p className="text-xs font-black tracking-widest text-slate-500">
                BEST SALES GHANA
              </p>
              <h1 className="mt-1 text-2xl font-black">
                More & Settings
              </h1>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl bg-[#12345b] px-4 py-3 text-sm font-bold text-white hover:bg-blue-900"
          >
            ← Back to Dashboard
          </Link>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <section className="mb-6 rounded-2xl bg-[#12345b] p-6 text-white sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
            Seller Centre
          </p>

          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Manage your account
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
            Access your profile, company details, listings, promotions,
            messages, payments and support from one place.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {settingsLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-w-0 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl font-black text-blue-700 group-hover:bg-blue-100">
                {item.icon}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-black text-[#12345b]">
                  {item.title}
                </span>

                <span className="mt-1 block text-sm leading-5 text-slate-500">
                  {item.description}
                </span>

                <span className="mt-3 block text-sm font-bold text-blue-700">
                  Open →
                </span>
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <h2 className="font-black text-slate-800">Sign out</h2>

          <p className="mt-1 text-sm text-slate-500">
            Sign out of your BestSalesGH account on this device.
          </p>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-4 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loggingOut ? "Signing out..." : "Logout"}
          </button>
        </section>

        <footer className="py-7 text-center text-xs text-slate-500">
          © 2026 All Prominent Ghana Limited. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
