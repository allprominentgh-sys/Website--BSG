
"use client";

import Link from "next/link";

export default function AdminSettingsPage() {
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
