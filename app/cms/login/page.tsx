"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CMSLoginPage() {
  const router = useRouter();

  const [companyId, setCompanyId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/cms/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          company_id: companyId.trim().toUpperCase(),
          staff_id: staffId.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success !== true) {
        setError(
          result.error || "Login failed. Check your staff details."
        );
        return;
      }

      router.replace("/cms");
      router.refresh();
    } catch (err) {
      console.error("CMS login request failed:", err);
      setError(
        "Unable to connect to the login service. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 text-2xl font-black text-white">
            B
          </div>

          <h1 className="mt-5 text-3xl font-black">
            BestSalesGH CMS
          </h1>

          <p className="mt-2 text-slate-600">
            Authorized staff and customer service login
          </p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black">Staff Sign In</h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter the Company ID and Staff ID issued by your
            administrator, together with your staff password.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="companyId"
                className="mb-2 block text-sm font-bold"
              >
                Company ID
              </label>

              <input
                id="companyId"
                type="text"
                autoComplete="organization"
                value={companyId}
                onChange={(event) =>
                  setCompanyId(event.target.value.toUpperCase())
                }
                placeholder="e.g. BSGH-CS-0001"
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="staffId"
                className="mb-2 block text-sm font-bold"
              >
                Staff ID
              </label>

              <input
                id="staffId"
                type="text"
                autoComplete="username"
                value={staffId}
                onChange={(event) => setStaffId(event.target.value)}
                placeholder="Enter your Staff ID"
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold"
              >
                Password
              </label>

              <div className="flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-blue-600">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="min-w-0 flex-1 px-4 py-3 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="px-3 text-sm font-bold text-blue-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-700 px-5 py-4 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying account..." : "Sign In to CMS"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-sm text-slate-500">
              Need access? Contact your CMS administrator.
            </p>

            <Link
              href="/"
              className="mt-4 inline-block font-bold text-blue-700 hover:underline"
            >
              ← Return to BestSalesGH
            </Link>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          BestSalesGH · Authorized personnel only
        </p>
      </div>
    </main>
  );
}
