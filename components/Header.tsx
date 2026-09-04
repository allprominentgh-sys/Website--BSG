"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [currency, setCurrency] = useState("GHS");
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="header-inner">

        <Link
          href="/"
          className="brand"
          onClick={closeMenu}
        >
          <span className="brand-name">
            ALL PROMINENT GHANA
          </span>

          <span className="brand-tagline">
            Buy • Sell • Advertise • Connect
          </span>
        </Link>

        <nav
          className="desktop-nav"
          aria-label="Main navigation"
        >
          <Link href="/">Home</Link>

          <Link href="/listings">
            Marketplace
          </Link>

          <Link href="/post-ad">
            Advertise
          </Link>

          <Link
            href="/supermarket"
            className="supermarket-link"
          >
            Supermarket
          </Link>

          <Link href="/account">
            My Account
          </Link>
        </nav>

        <div className="header-actions">

          <select
            value={currency}
            onChange={(e) =>
              setCurrency(e.target.value)
            }
            aria-label="Currency"
          >
            <option value="GHS">
              GH₵ GHS
            </option>

            <option value="USD">
              $ USD
            </option>

            <option value="EUR">
              € EUR
            </option>

            <option value="GBP">
              £ GBP
            </option>

            <option value="CNY">
              ¥ CNY
            </option>
          </select>

          <Link
            href="/post-ad"
            className="sell-button"
          >
            + Sell an Item
          </Link>

        </div>

        <button
          type="button"
          className="menu-button"
          onClick={() =>
            setMenuOpen((value) => !value)
          }
          aria-label={
            menuOpen
              ? "Close menu"
              : "Open menu"
          }
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

      </div>

      {menuOpen && (
        <div className="mobile-menu">

          <Link href="/" onClick={closeMenu}>
            🏠 Home
          </Link>

          <Link
            href="/listings"
            onClick={closeMenu}
          >
            🛍️ Marketplace
          </Link>

          <Link
            href="/post-ad"
            onClick={closeMenu}
          >
            📢 Advertise
          </Link>

          <Link
            href="/supermarket"
            onClick={closeMenu}
          >
            🛒 Supermarket
          </Link>

          <Link
            href="/account"
            onClick={closeMenu}
          >
            👤 My Account
          </Link>

          <select
            value={currency}
            onChange={(e) =>
              setCurrency(e.target.value)
            }
            aria-label="Mobile currency"
          >
            <option value="GHS">
              GH₵ GHS
            </option>

            <option value="USD">
              $ USD
            </option>

            <option value="EUR">
              € EUR
            </option>

            <option value="GBP">
              £ GBP
            </option>

            <option value="CNY">
              ¥ CNY
            </option>
          </select>

          <Link
            href="/post-ad"
            className="mobile-sell"
            onClick={closeMenu}
          >
            + Sell an Item
          </Link>

        </div>
      )}
    </header>
  );
}
