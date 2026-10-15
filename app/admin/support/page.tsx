"use client";

import { useState } from "react";
import { supabaseBrowser } from "../../../lib/supabase";

export default function AdminSupportPage() {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function checkAdminAccess() {
    setChecking(true);
    setMessage("");
    setSuccess(false);

    try {
      const supabase = supabaseBrowser();

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.access_token) {
        setMessage("Please sign in to your administrator account first.");
        return;
      }

      const response = await fetch("/api/admin/support", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.error || "Administrator access could not be verified."
        );
        return;
      }

      setSuccess(true);
      setMessage(
        result.message || "Administrator access verified successfully."
      );
    } catch (error) {
      console.error("Admin Support error:", error);
      setMessage("Unable to connect to the support service. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            BestSalesGH Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold">Admin Support</h1>

          <p className="mt-2 text-gray-600">
            Support administration and access verification.
          </p>
        </header>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold">Administrator access</h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Check whether your signed-in account has administrator
            permission to access the support API.
          </p>

          <button
            type="button"
            onClick={checkAdminAccess}
            disabled={checking}
            className="mt-6 w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {checking ? "Checking..." : "Check Admin Access"}
          </button>

          {message && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-5 rounded-lg border p-4 text-sm ${
                success
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-gray-200 bg-gray-50 text-gray-800"
              }`}
            >
              {message}
            </div>
          )}
        </section>

        <footer className="mt-6 text-sm text-gray-500">
          BestSalesGH Admin Portal
        </footer>
      </div>
    </main>
  );
}
