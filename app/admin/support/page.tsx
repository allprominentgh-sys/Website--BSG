"use client";

import { useState } from "react";
import { supabaseBrowser } from "../../../lib/supabase";

export default function AdminSupportPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function checkAdminAccess() {
    setLoading(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const supabase = supabaseBrowser();

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setMessage("Unable to check your login. Please sign in again.");
        return;
      }

      if (!session?.access_token) {
        setMessage(
          "You are not signed in. Please sign in with your administrator account."
        );
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

      setIsSuccess(true);
      setMessage(
        result.message || "Administrator access verified successfully."
      );
    } catch (error) {
      console.error("Admin Support access check failed:", error);
      setMessage(
        "Could not connect to the support service. Please try again."
      );
    } finally {
      setLoading(false);
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
            Administrator access and support service.
          </p>
        </header>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold">
            Support administration
          </h2>

          <p className="mt-3 leading-7 text-gray-600">
            Verify that your signed-in account has administrator
            permission to access the support service.
          </p>

          <button
            type="button"
            onClick={checkAdminAccess}
            disabled={loading}
            className="mt-6 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Checking access..." : "Check Admin Access"}
          </button>

          {message && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-5 rounded-lg border p-4 text-sm ${
                isSuccess
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-gray-200 bg-gray-50 text-gray-800"
              }`}
            >
              {message}
            </div>
          )}
        </section>

        <footer className="mt-8 text-sm text-gray-500">
          BestSalesGH Admin Portal
        </footer>
      </div>
    </main>
  );
}
