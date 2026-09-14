"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Login functionality will be connected to Supabase later.
    console.log("Login attempt:", { email, password });
  }

  return (
    <main className="login-page">
      <div className="login-background-circle circle-one" />
      <div className="login-background-circle circle-two" />

      <section className="login-container">
        {/* BRAND */}
        <Link href="/" className="login-brand">
          <div className="login-logo">
            <div className="login-logo-ring">
              <div className="login-logo-person">
                <span className="login-logo-head" />
                <span className="login-logo-arm login-logo-arm-left" />
                <span className="login-logo-arm login-logo-arm-right" />
                <span className="login-logo-body" />
              </div>
            </div>
          </div>

          <div>
            <div className="login-brand-name">
              BEST SALES GHANA
            </div>

            <div className="login-brand-tagline">
              Buy • Sell • Advertise • Connect
            </div>
          </div>
        </Link>

        {/* LOGIN CARD */}
        <div className="login-card">
          <div className="login-heading">
            <h1>Welcome Back</h1>

            <p>
              Sign in to your BEST SALES GHANA account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* EMAIL */}
            <div className="login-field">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="login-field">
              <div className="login-password-header">
                <label htmlFor="password">
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="forgot-password"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* REMEMBER */}
            <label className="remember-me">
              <input type="checkbox" />

              <span>
                Remember me
              </span>
            </label>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="login-button"
            >
              Sign In
            </button>
          </form>

          {/* DIVIDER */}
          <div className="login-divider">
            <span />
            <p>OR</p>
            <span />
          </div>

          {/* SOCIAL / OTHER LOGIN */}
          <button
            type="button"
            className="google-login"
          >
            <span className="google-icon">
              G
            </span>

            Continue with Google
          </button>

          {/* REGISTER */}
          <div className="register-section">
            <p>
              Don't have an account?
            </p>

            <Link
              href="/register"
              className="register-link"
            >
              Create an account
            </Link>
          </div>
        </div>

        {/* BACK HOME */}
        <Link
          href="/"
          className="back-home"
        >
          ← Back to BEST SALES GHANA
        </Link>

        {/* COPYRIGHT */}
        <p className="login-copyright">
          © 2026 All Prominent Ghana Limited. All rights reserved.
        </p>
      </section>
    </main>
  );
}
