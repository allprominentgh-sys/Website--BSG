"use client";

import Link from "next/link";

export default function AccountPage() {
  return (
    <main className="account-page">
      <div className="account-header">
        <Link href="/" className="brand">
          ALL PROMINENT GHANA
        </Link>

        <p>Buy • Sell • Advertise • Connect</p>
      </div>

      <section className="login-card">
        <div className="login-icon">👤</div>

        <h1>Welcome back</h1>

        <p className="login-subtitle">
          Sign in to buy, sell and manage your account.
        </p>

        <div className="social-buttons">
          <button className="social-button google">
            <span>G</span>
            Continue with Google
          </button>

          <button className="social-button apple">
            <span>●</span>
            Continue with Apple
          </button>
        </div>

        <div className="or-divider">
          <span>OR</span>
        </div>

        <label htmlFor="phone">Phone number</label>

        <div className="phone-box">
          <span>+233</span>
          <input
            id="phone"
            type="tel"
            placeholder="24 000 0000"
          />
        </div>

        <button className="phone-button">
          Continue with phone
        </button>

        <div className="signup">
          <p>New to All Prominent Ghana?</p>

          <Link href="/post-ad">
            Start selling
          </Link>
        </div>
      </section>

      <section className="account-bottom">
        <h2>Buy • Sell • Advertise • Connect</h2>

        <p>
          Your Ghanaian marketplace for products, brands,
          property, vehicles, jobs and services.
        </p>
      </section>
    </main>
  );
}
