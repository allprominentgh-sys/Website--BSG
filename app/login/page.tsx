"use client";

import { useState } from "react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");

  return (
    <main className="account-page">
      <header className="account-header">
        <a href="/" className="brand">
          ALL PROMINENT GHANA
        </a>

        <p>Buy • Sell • Advertise • Connect</p>
      </header>

      <section className="login-card">
        <div className="login-icon">👤</div>

        <h1>Welcome back</h1>

        <p className="login-subtitle">
          Sign in to buy, sell and manage your account.
        </p>

        <div className="social-buttons">
          <button
            type="button"
            className="social-button"
          >
            <span>G</span>
            Continue with Google
          </button>

          <button
            type="button"
            className="social-button"
          >
            <span>●</span>
            Continue with Apple
          </button>
        </div>

        <div className="or-divider">
          <span>OR</span>
        </div>

        <label htmlFor="phone">
          Phone number
        </label>

        <div className="phone-box">
          <span>+233</span>

          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            placeholder="24 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="phone-button"
        >
          Continue with phone
        </button>

        <div className="signup">
          <p>New to All Prominent Ghana?</p>

          <a href="/sell">
            Start selling
          </a>
        </div>
      </section>

      <section className="account-bottom">
        <h2>
          Buy • Sell • Advertise • Connect
        </h2>

        <p>
          Your Ghanaian marketplace for products,
          brands, property, vehicles, jobs and services.
        </p>
      </section>
    </main>
  );
}
