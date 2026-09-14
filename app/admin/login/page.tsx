"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Invalid admin login.");
        return;
      }

      window.location.href = "/admin";
    } catch {
      setMessage(
        "Unable to connect to the admin login system. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* HEADER */}
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
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100"
          >
            ← Website
          </Link>

        </div>
      </header>

      {/* LOGIN */}
      <section className="flex min-h-[calc(100vh-90px)] items-center justify-center px-4 py-12">

        <div className="w-full max-w-md">

          {/* LOGIN CARD */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9">

            {/* ICON */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
              🔐
            </div>

            {/* TITLE */}
            <div className="mt-6 text-center">

              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                Secure Access
              </p>

              <h1 className="mt-2 text-3xl font-black">
                Admin Login
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to manage Best Sales Ghana marketplace
                administration.
              </p>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* EMAIL */}
              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-black"
                >
                  Admin Email
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="admin@bestsalesgh.com"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

              </div>

              {/* PASSWORD */}
              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-black"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your admin password"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

              </div>

              {/* ERROR / MESSAGE */}
              {message && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                  {message}
                </div>
              )}

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-700 px-5 py-4 font-black text-white shadow-lg transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In to Admin"}
              </button>

            </form>

            {/* SECURITY INFORMATION */}
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">

              <div className="flex gap-3">

                <div className="text-xl">
                  🛡️
                </div>

                <div>

                  <h2 className="font-black text-blue-900">
                    Administrator Access
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-blue-800">
                    This area is restricted to authorized Best Sales
                    Ghana administrators.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* FOOTER */}
          <div className="mt-6 text-center">

            <Link
              href="/"
              className="text-sm font-bold text-blue-700 hover:underline"
            >
              Return to Best Sales Ghana
            </Link>

            <p className="mt-3 text-xs text-slate-400">
              © {new Date().getFullYear()} All Prominent Ghana Limited
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}
