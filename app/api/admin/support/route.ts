"use client";

import { useCallback, useEffect, useState } from "react";

type SupportCheckResult = {
  success?: boolean;
  message?: string;
  error?: string;
  authenticationMethod?: string;
};

export default function AdminSupportPage() {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState(
    "Verifying administrator access..."
  );
  const [authenticationMethod, setAuthenticationMethod] = useState("");

  const checkAccess = useCallback(async () => {
    setChecking(true);
    setAuthorized(false);
    setMessage("Verifying your administrator session...");
    setAuthenticationMethod("");

    try {
      const response = await fetch("/api/admin/support", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const result =
        (await response.json()) as SupportCheckResult;

      if (!response.ok || result.success !== true) {
        setMessage(
          result.error ||
            `Administrator verification failed (HTTP ${response.status}).`
        );
        return;
      }

      setAuthorized(true);

      setAuthenticationMethod(
        result.authenticationMethod === "admin-session"
          ? "Main administrator session"
          : "Supabase administrator session"
      );

      setMessage(
        result.message ||
          "Administrator access verified successfully."
      );
    } catch (error) {
      console.error(
        "Support Centre access check failed:",
        error
      );

      setMessage(
        "Unable to connect to the Support Centre. Please check your internet connection and try again."
      );
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkAccess();
  }, [checkAccess]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="rounded-2xl bg-blue-900 p-6 text-white shadow">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
            BEST SALES GHANA
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Support Centre
          </h1>

          <p className="mt-2 text-sm text-blue-100">
            Administrator access and customer support management.
          </p>
        </header>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Administrator verification
          </h2>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold">
              Authentication method
            </p>

            <p className="mt-2 text-sm text-slate-700">
              {authenticationMethod ||
                "Checking administrator session..."}
            </p>

            <p className="mt-2 text-sm text-slate-600">
              This page verifies your session with the server
              instead of relying on a separate browser login.
            </p>
          </div>

          <div
            className={`mt-4 rounded-xl border p-4 ${
              checking
                ? "border-blue-200 bg-blue-50 text-blue-900"
                : authorized
                  ? "border-green-200 bg-green-50 text-green-900"
                  : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
            role="status"
            aria-live="polite"
          >
            {checking && (
              <p className="font-semibold">
                Checking your administrator session...
              </p>
            )}

            <p className="mt-1 text-sm">{message}</p>
          </div>

          {!checking && !authorized && (
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="/admin/login"
                className="rounded-lg bg-blue-800 px-5 py-3 font-semibold text-white hover:bg-blue-900"
              >
                Administrator sign in
              </a>

              <button
                type="button"
                onClick={() => void checkAccess()}
                className="rounded-lg border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-50"
              >
                Try again
              </button>
            </div>
          )}

          {authorized && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="font-semibold text-green-900">
                Administrator access verified.
              </p>

              <p className="mt-1 text-sm text-green-800">
                Your administrator session is recognized by
                the Support Centre.
              </p>
            </div>
          )}
        </section>

        <div className="mt-6">
          <a
            href="/admin"
            className="font-semibold text-blue-800 hover:underline"
          >
            ← Back to admin dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
