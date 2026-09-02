"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [currency, setCurrency] = useState("GHS");

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container">
        <div
          style={{
            minHeight: "70px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <Link href="/listings">Marketplace</Link>
            <Link href="/ads">Advertise</Link>
            <Link href="/dashboard">My Account</Link>
          </nav>

          {/* CURRENCY + POST */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Select currency"
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "9px",
                background: "white",
              }}
            >
              <option value="GHS">GH₵ GHS</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
              <option value="CNY">¥ CNY</option>
            </select>

            <Link
              href="/post"
              className="btn btn-primary"
              style={{ whiteSpace: "nowrap" }}
            >
              Post an Ad
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
