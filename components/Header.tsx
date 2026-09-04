"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [currency, setCurrency] = useState("GHS");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        <div className="flex min-h-[72px] items-center justify-between gap-4">

          {/* LOGO */}
          <Link
            href="/"
            className="shrink-0"
            onClick={() => setMenuOpen(false)}
          >
            <div className="text-xl font-black tracking-tight text-[#155EEF] sm:text-2xl">
              ALL PROMINENT GHANA
            </div>

            <div className="text-xs font-semibold text-[#667085]">
              Buy • Sell • Advertise • Connect
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-6 lg:flex">

            <Link
              href="/"
              className="font-semibold text-[#155EEF] transition hover:text-[#0F4BC9]"
            >
              Home
            </Link>

            <Link
              href="/listings"
              className="font-semibold text-[#344054] transition hover:text-[#155EEF]"
            >
              Marketplace
            </Link>

            <Link
              href="/post-ad"
              className="font-semibold text-[#344054] transition hover:text-[#155EEF]"
            >
              Advertise
            </Link>

            <Link
              href="/account"
              className="font-semibold text-[#344054] transition hover:text-[#155EEF]"
            >
              My Account
            </Link>

          </nav>

          {/* RIGHT SIDE */}
          <div className="hidden items-center gap-3 sm:flex">

            {/* CURRENCY */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Select currency"
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-[#344054] outline-none transition focus:border-[#155EEF] focus:ring-2 focus:ring-[#DCEBFF]"
            >
              <option value="GHS">GH₵ GHS</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
              <option value="CNY">¥ CNY</option>
            </select>

            {/* SELL BUTTON */}
            <Link
              href="/post-ad"
              className="rounded-xl bg-[#155EEF] px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-blue-100 transition hover:bg-[#0F4BC9]"
            >
              + Sell an Item
            </Link>

          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#155EEF] shadow-sm lg:hidden"
          >
            <span className="text-2xl">
              {menuOpen ? "✕" : "☰"}
            </span>
          </button>

        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="border-t border-gray-100 py-4 lg:hidden">

            <nav className="flex flex-col gap-2">

              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-[#DCEBFF] px-4 py-3 font-bold text-[#155EEF]"
              >
                🏠 Home
              </Link>

              <Link
                href="/listings"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold text-[#344054] hover:bg-[#F5F7FA]"
              >
                🛍️ Marketplace
              </Link>

              <Link
                href="/post-ad"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold text-[#344054] hover:bg-[#F5F7FA]"
              >
                📢 Advertise
              </Link>

              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold text-[#344054] hover:bg-[#F5F7FA]"
              >
                👤 My Account
              </Link>

              {/* MOBILE CURRENCY */}
              <div className="mt-2 flex items-center gap-3 rounded-xl bg-[#F5F7FA] p-3">

                <span className="text-sm font-bold text-[#344054]">
                  Currency
                </span>

                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold outline-none"
                >
                  <option value="GHS">GH₵ GHS</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="GBP">£ GBP</option>
                  <option value="CNY">¥ CNY</option>
                </select>

              </div>

              {/* MOBILE SELL */}
              <Link
                href="/post-ad"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-xl bg-[#155EEF] px-4 py-4 text-center font-extrabold text-white shadow-md"
              >
                + Sell an Item
              </Link>

            </nav>

          </div>
        )}

      </div>
    </header>
  );
}