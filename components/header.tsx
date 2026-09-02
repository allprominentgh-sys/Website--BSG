"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [currency, setCurrency] = useState("GHS");

  return (
    <header className="bg-white border-b">
      <div className="container">
        <div
          style={{
            minHeight: "70px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
          }}
        >
          <Link href="/" style={{ fontWeight: 900, fontSize: "22px" }}>
            ALL PROMINENT GHANA
          </Link>

          <nav style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <Link href="/listings">Marketplace</Link>
            <Link href="/ads">Advertise</Link>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Currency"
            >
              <option value="GHS">GH₵ GHS</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
              <option value="CNY">¥ CNY</option>
            </select>

            <Link href="/login">Login</Link>

            <Link href="/post" className="btn btn-primary">
              Post an Ad
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
