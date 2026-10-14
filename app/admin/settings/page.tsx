
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Settings = {
  idle_timeout_minutes: number;
  warning_minutes: number;
  apply_to_all_staff: boolean;
  allow_remember_me_extension: boolean;
  updated_at?: string;
};

const initialSettings: Settings = {
  idle_timeout_minutes: 15,
  warning_minutes: 2,
  apply_to_all_staff: true,
  allow_remember_me_extension: false,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/security-settings", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load security settings.");
        }

        if (!cancelled) setSettings(data.settings);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load security settings."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveSettings() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/security-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idle_timeout_minutes: 15,
          warning_minutes: settings.warning_minutes,
          apply_to_all_staff: true,
          allow_remember_me_extension: false,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save settings.");
      }

      setSettings(data.settings);
      setMessage("Security settings saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin"
          className="inline-flex rounded-xl border border-blue-700 px-4 py-2 font-bold text-blue-700 hover:bg-blue-700 hover:text-white"
        >
          ← Back to Admin Dashboard
        </Link>

        <header className="mt-6 rounded-3xl bg-gradient-to-r from-blue-800 to-cyan-600 p-8 text-white">
          <p className="text-sm font-bold uppercase tracking-widest">
            Administrator
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Marketplace Settings
          </h1>
          <p className="mt-3 leading-7 text-white/90">
            Manage the main settings and configuration areas for Best Sales
            Ghana.
          </p>
        </header>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="text-3xl" aria-hidden="true">🔐</div>
            <div>
              <h2 className="text-xl font-black">Staff Session Security</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Configure inactivity logout for the administrator and all staff
                departments.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="mt-6 text-slate-500">Loading security settings...</p>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-bold text-blue-900">
                  Automatic logout after inactivity
                </p>
                <p className="mt-1 text-2xl font-black text-blue-800">
                  15 minutes
                </p>
                <p className="mt-1 text-sm text-blue-900">
                  Required security policy. Staff cannot extend this limit using
                  “Keep me signed in”.
                </p>
              </div>

              <div>
                <label
                  htmlFor="warning-minutes"
                  className="block text-sm font-bold text-slate-800"
                >
                  Warn before logout
                </label>
                <select
                  id="warning-minutes"
                  value={settings.warning_minutes}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      warning_minutes: Number(event.target.value),
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                >
                  <option value={0}>No warning</option>
                  <option value={1}>1 minute before logout</option>
                  <option value={2}>2 minutes before logout</option>
                  <option value={3}>3 minutes before logout</option>
                  <option value={5}>5 minutes before logout</option>
                </select>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                <p className="font-bold">Policy coverage</p>
                <p className="text-sm text-slate-600">
                  <span className="font-bold text-emerald-700">Enabled</span>
                  {" — "}Apply to all staff departments.
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-bold text-emerald-700">Disabled</span>
                  {" — "}“Keep me signed in” cannot bypass inactivity logout.
                </p>
              </div>

              {message && (
                <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                  {message}
                </p>
              )}
              {error && (
                <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Security Settings"}
              </button>
            </div>
          )}
        </section>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Link
            href="/admin/advertising"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-lg"
          >
            <div className="text-3xl">📢</div>
            <h2 className="mt-4 text-xl font-black">Advertising Settings</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Configure individual promotion prices, company advertising
              packages, free-ad limits and advertising duration.
            </p>
            <span className="mt-5 inline-block font-bold text-blue-700">
              Open Advertising →
            </span>
          </Link>

          <a
            href="/admin#currency-management"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-lg"
          >
            <div className="text-3xl">💱</div>
            <h2 className="mt-4 text-xl font-black">Currency Settings</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Return to the admin dashboard to manage exchange rates and
              currency adjustment settings.
            </p>
            <span className="mt-5 inline-block font-bold text-blue-700">
              Open Currency Control →
            </span>
          </a>

          <Link
            href="/admin/revenue"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-lg"
          >
            <div className="text-3xl">💰</div>
            <h2 className="mt-4 text-xl font-black">Revenue & Settlements</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Open the existing revenue dashboard to manage platform finance
              and seller settlements.
            </p>
            <span className="mt-5 inline-block font-bold text-blue-700">
              Open Revenue →
            </span>
          </Link>

          <Link
            href="/admin/refund-policy"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-lg"
          >
            <div className="text-3xl">↩️</div>
            <h2 className="mt-4 text-xl font-black">Refund Policy</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Open the existing refund policy and refund-management area.
            </p>
            <span className="mt-5 inline-block font-bold text-blue-700">
              Open Refund Policy →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
