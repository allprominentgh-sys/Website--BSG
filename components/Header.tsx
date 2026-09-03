"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Header.module.css";

export default function Header() {
  const [currency, setCurrency] = useState("GHS");
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>

        {/* LOGO */}
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <div className={styles.logoTitle}>
            ALL PROMINENT GHANA
          </div>
          <div className={styles.logoTagline}>
            Buy • Sell • Advertise • Connect
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className={styles.desktopNav}>
          <Link href="/" className={styles.activeLink}>
            Home
          </Link>

          <Link href="/listings" className={styles.navLink}>
            Marketplace
          </Link>

          <Link href="/post-ad" className={styles.navLink}>
            Advertise
          </Link>

          <Link href="/account" className={styles.navLink}>
            My Account
          </Link>
        </nav>

        {/* DESKTOP RIGHT SIDE */}
        <div className={styles.desktopRight}>

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            aria-label="Select currency"
            className={styles.currency}
          >
            <option value="GHS">GH₵ GHS</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
            <option value="CNY">¥ CNY</option>
          </select>

          <Link href="/post-ad" className={styles.sellButton}>
            + Sell an Item
          </Link>
        </div>

        {/* MOBILE BUTTON */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className={styles.menuButton}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className={styles.mobileMenu}>

          <Link
            href="/"
            onClick={closeMenu}
            className={`${styles.mobileLink} ${styles.mobileActive}`}
          >
            🏠 Home
          </Link>

          <Link
            href="/listings"
            onClick={closeMenu}
            className={styles.mobileLink}
          >
            🛍️ Marketplace
          </Link>

          <Link
            href="/post-ad"
            onClick={closeMenu}
            className={styles.mobileLink}
          >
            📢 Advertise
          </Link>

          <Link
            href="/account"
            onClick={closeMenu}
            className={styles.mobileLink}
          >
            👤 My Account
          </Link>

          <div className={styles.mobileCurrency}>
            <span>Currency</span>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={styles.mobileSelect}
            >
              <option value="GHS">GH₵ GHS</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
              <option value="CNY">¥ CNY</option>
            </select>
          </div>

          <Link
            href="/post-ad"
            onClick={closeMenu}
            className={styles.mobileSell}
          >
            + Sell an Item
          </Link>

        </div>
      )}
    </header>
  );
}
