
"use client";

import Link from "next/link";

const individualPackages = [
  { name: "Premium", price: 160, duration: "30 days" },
  { name: "Priority", price: 420, duration: "30 days" },
  { name: "Top Priority", price: 790, duration: "30 days" },
];

const rules = [
  {
    title: "Individual sellers",
    icon: "👤",
    items: [
      "First 3 ads are free.",
      "Additional ads require a paid advertising package.",
      "Individual sellers collect sales payments independently.",
    ],
  },
  {
    title: "Company accounts",
    icon: "🏢",
    items: [
      "First 3 ads are free.",
      "Ads 4–12 receive Priority placement after company details are completed.",
      "From ad 13 onward, the company package is GH₵630 per month for Top Priority advertising across company ads.",
    ],
  },
  {
    title: "Business transactions",
    icon: "💳",
    items: [
      "The platform transaction fee is 2.15% of eligible transaction amounts.",
      "The fee is deducted before the remaining balance is remitted to the business.",
      "Individual seller payments are excluded from this business transaction-fee rule.",
    ],
  },
];

export default function AdminAdvertisingPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin"
          className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Admin Dashboard
        </Link>

        <header className="mt-7 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 to-sky-600 p-7 text-white sm:p-10">
          <p className="text-sm font-black uppercase tracking-widest text-sky-200">
            BestSalesGH Administration
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            Advertising Management
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-blue-50">
            Review individual seller packages, company advertising
            allowances, Top Priority pricing, and business transaction
            fee rules in one place.
          </p>

          <div className="mt-6 inline-flex rounded-full border border-amber-200/50 bg-amber-300/15 px-4 py-2 text-sm font-bold text-amber-100">
            Configuration reference — database controls not connected
          </div>
        </header>

        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-2xl font-black">
              Individual Seller Packages
            </h2>
            <p className="mt-2 text-slate-600">
              The first 3 ads are free. Each additional ad requires
              a paid promotion package.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {individualPackages.map((item) => (
              <article
                key={item.name}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-black uppercase tracking-wider text-blue-700">
                  {item.name}
                </p>

                <p className="mt-4 text-4xl font-black">
                  GH₵{item.price}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Per ad · {item.duration}
                </p>

                <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-900">
                  Individual seller advertising
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-black">
            Advertising and Payment Rules
          </h2>

          <div className="grid gap-5 lg:grid-cols-3">
            {rules.map((rule) => (
              <article
                key={rule.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  {rule.icon}
                </div>

                <h3 className="mt-4 text-xl font-black">
                  {rule.title}
                </h3>

                <ul className="mt-4 space-y-3">
                  {rule.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm leading-6 text-slate-600"
                    >
                      <span className="font-black text-blue-700">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-xl font-black text-amber-950">
            Next implementation stage
          </h2>

          <p className="mt-3 leading-7 text-amber-900">
            These values are currently displayed in this page only.
            They are not saved as editable database settings, and
            this page does not process payments, verify company
            eligibility, activate promotions, or enforce ad limits.
            Those functions must be connected securely before this
            page can control live advertising.
          </p>
        </section>

        <footer className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
          >
            Admin Dashboard
          </Link>

          <Link
            href="/dashboard/promote"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
          >
            View Current Promotion Page
          </Link>
        </footer>
      </div>
    </main>
  );
}
