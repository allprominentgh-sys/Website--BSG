
"use client";

import Link from "next/link";

const paymentFeatures = [
  {
    title: "Purchase payments",
    description: "Review payments associated with your purchases and orders.",
    icon: "💳",
  },
  {
    title: "Invoices and receipts",
    description: "Access invoices and receipts when they are available for your orders.",
    icon: "🧾",
  },
  {
    title: "Seller payouts",
    description:
      "View payout information and the status of payments awaiting admin approval.",
    icon: "🏦",
  },
  {
    title: "Payout account",
    description:
      "Manage your preferred payout destination through the verified account settings.",
    icon: "🔐",
  },
];

export default function PaymentsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline dark:text-sky-400"
        >
          ← Back to Dashboard
        </Link>

        <header className="rounded-2xl bg-blue-800 p-6 text-white sm:p-8">
          <p className="text-sm font-medium text-blue-100">
            BESTSALESGH FINANCIAL CENTRE
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Payments and Invoices
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
            Manage purchase records, invoices, payout information and
            payment status from one place.
          </p>

          <div className="mt-5 rounded-xl border border-white/20 bg-white/10 p-4">
            <p className="text-sm text-blue-100">
              Marketplace platform fee
            </p>
            <p className="mt-1 text-3xl font-bold">2.15%</p>
            <p className="mt-2 text-xs text-blue-100">
              Applied according to the platform's applicable transaction
              rules.
            </p>
          </div>
        </header>

        <section className="mt-8">
          <h2 className="text-xl font-bold">Payment management</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Select a section to see the information it is intended to manage.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {paymentFeatures.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="text-3xl" aria-hidden="true">
                  {feature.icon}
                </div>

                <h3 className="mt-4 font-bold">{feature.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
          <h2 className="font-bold text-amber-900 dark:text-amber-200">
            Payment records and payout status
          </h2>
          <p className="mt-2 text-sm leading-6 text-amber-900 dark:text-amber-100">
            Transaction records, invoices and payout statuses will appear
            here once this page is connected to the existing payment
            database. No payment is processed or marked as paid by this
            page alone.
          </p>
        </section>

        <footer className="mt-8 text-center text-xs text-slate-500">
          BestSalesGH · Secure marketplace payment management
        </footer>
      </div>
    </main>
  );
}
