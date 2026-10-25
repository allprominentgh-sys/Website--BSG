"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@bestsalesgh.com");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsSuccess(false);

    if (!email.trim() || !password) {
      setMessage("Please enter your administrator email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          rememberMe,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || data?.success !== true) {
        setMessage(
          data?.message ||
            "Login failed. Please check your credentials and try again."
        );
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      setMessage("Login accepted. Checking administrator access...");

      // Only allow redirects to local administrator pages.
      const params = new URLSearchParams(window.location.search);
      const requestedPath = params.get("redirect");

      const destination =
        requestedPath &&
        requestedPath.startsWith("/admin") &&
        !requestedPath.startsWith("//") &&
        requestedPath !== "/admin/login"
          ? requestedPath
          : "/admin";

      // Perform a full navigation so the browser sends the new cookie.
      window.location.replace(destination);
    } catch (error) {
      console.error("Administrator login request failed.");

      setMessage(
        "Unable to connect to the login system. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-2xl shadow-md">
              ⭐
            </div>
            <div>
              <div className="text-lg font-black tracking-tight sm:text-xl">
                BEST SALES GHANA
              </div>
              <div className="text-xs text-slate-500">
                Administration Portal
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ← Website
          </Link>
        </div>
      </header>

      <section className="flex min-h-[calc(100vh-150px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-700 text-4xl shadow-xl">
              🔐
            </div>

            <p className="mt-7 text-sm font-black uppercase tracking-[0.25em] text-blue-700">
              Administrator Access
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Admin Sign In
            </h1>

            <p className="mt-3 text-slate-500">
              Sign in to manage BEST SALES GHANA.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-black text-slate-800"
                >
                  Admin Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@bestsalesgh.com"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-base outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-black text-slate-800"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-base outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  disabled={loading}
                  className="h-5 w-5 rounded accent-blue-700"
                />
                <span className="text-sm font-semibold text-slate-600">
                  Keep me signed in
                </span>
              </label>

              {message && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`rounded-xl border p-4 text-sm font-bold ${
                    isSuccess
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-700 px-5 py-4 text-base font-black text-white shadow-lg transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In to Admin"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <div className="flex gap-3">
                <div className="text-xl">🛡️</div>
                <div>
                  <p className="text-sm font-black text-slate-800">
                    Administrator Area
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    This area is for authorized BEST SALES GHANA
                    administrators only.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-bold text-slate-500 hover:text-blue-700"
            >
              Return to BEST SALES GHANA
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-7 text-center sm:px-6 lg:px-8">
          <p className="font-black text-white">BEST SALES GHANA</p>
          <p className="mt-2 text-xs text-slate-500">
            © {new Date().getFullYear()} All Prominent Ghana Limited.
            All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
