
"use client";

import Link from "next/link";

const adminSections = [
  {
    title: "Direct Sales",
    description:
      "Manage products owned and sold directly by Best Sales Ghana.",
    icon: "🛒",
    href: "/admin/products",
    button: "Manage Products",
  },
  {
    title: "Marketplace Listings",
    description:
      "Review, search and manage listings posted by marketplace sellers. Delete unwanted listings.",
    icon: "📋",
    href: "/admin/listings",
    button: "View Listings",
  },
  {
    title: "Sellers",
    description:
      "Manage seller accounts, verification and seller activity.",
    icon: "👥",
    href: "/admin/sellers",
    button: "Manage Sellers",
  },
  {
    title: "Customers",
    description:
      "View customer accounts and review customer information.",
    icon: "🧑‍💼",
    href: "/admin/customers",
    button: "Manage Customers",
  },
  {
    title: "Orders",
    description:
      "Review orders, payment information and order status.",
    icon: "📦",
    href: "/admin/orders",
    button: "Manage Orders",
  },
  {
    title: "CMS Support",
    description:
      "Manage customer support cases, messages and disputes.",
    icon: "💬",
    href: "/admin/cms",
    button: "Manage Support",
  },
  {
    title: "Refunds",
    description:
      "Review refund requests and access the refund approval workflow.",
    icon: "💳",
    href: "/admin/refunds",
    button: "Review Refunds",
  },
  {
    title: "Delivery",
    description:
      "Review delivery operations and delivery-related issues.",
    icon: "🚚",
    href: "/admin/delivery",
    button: "Manage Delivery",
  },
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-blue-700">
            BestSalesGH Administration
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Admin Dashboard
          </h1>

          <p className="mt-3 text-base leading-7 text-slate-600">
            Manage marketplace listings, customers, sellers, orders and
            platform operations from one place.
          </p>
        </header>

        <section
          aria-label="Admin management sections"
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {adminSections.map((section) => (
            <article
              key={section.href}
              className={`flex flex-col rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                section.href === "/admin/listings"
                  ? "border-blue-400 ring-1 ring-blue-200"
                  : "border-slate-200"
              }`}
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-4xl">
                <span aria-hidden="true">{section.icon}</span>
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight">
                {section.title}
              </h2>

              <p className="mt-3 flex-1 text-base leading-7 text-slate-600">
                {section.description}
              </p>

              <div className="mt-6">
                <Link
                  href={section.href}
                  className="inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded-xl border-2 border-blue-600 px-5 py-3 font-bold text-blue-700 transition hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  <span>{section.button}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-5 text-sm text-slate-500">
          BestSalesGH Admin Dashboard
        </footer>
      </div>
    </main>
  );
}
