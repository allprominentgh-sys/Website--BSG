"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [currency, setCurrency] = useState("GHS");

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div
        className="mx-auto flex max-w-7xl items-center justify-between px-5"
        style={{
          minHeight: "70px",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        {/* LOGO */}
        <Link
          href="/"
          style={{
            fontSize: "22px",
            fontWeight: 900,
            color: "#087443",
            whiteSpace: "nowrap",
          }}
        >
          ALL PROMINENT GHANA
        </Link>

        {/* NAVIGATION */}
        <nav
          className="hidden md:flex"
          style={{
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/listings"
            className="font-semibold text-gray-700 hover:text-[#087443]"
          >
            Marketplace
          </Link>

          <Link
            href="/ads"
            className="font-semibold text-gray-700 hover:text-[#087443]"
          >
            Advertise
          </Link>

          <Link
            href="/dashboard"
            className="font-semibold text-gray-700 hover:text-[#087443]"
          >
            My Account
          </Link>
        </nav>

        {/* CURRENCY + POST */}
        <div
          className="flex items-center"
          style={{
            gap: "10px",
          }}
        >
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            aria-label="Select currency"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold"
          >
            <option value="GHS">GH₵ GHS</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
            <option value="CNY">¥ CNY</option>
          </select>

          <Link
            href="/ads/new"
            className="rounded-lg bg-[#087443] px-4 py-2 font-bold text-white transition hover:bg-[#065c35]"
          >
            + Post Ad
          </Link>
        </div>
      </div>
    </header>
  );
}