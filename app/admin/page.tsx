
"use client";

import Link from "next/link";

const adminSections = [
  {
    title: "Direct Sales",
    description: "Manage products owned and sold directly by Best Sales Ghana.",
    icon: "🛒",
    href: "/admin/direct-sales",
    action: "Manage Products",
  },
  {
    title: "Marketplace Listings",
    description: "Review and manage listings posted by marketplace sellers.",
    icon: "📋",
    href: "/listings",
    action: "View Listings",
  },
  {
    title: "Sellers",
    description: "Manage seller accounts, verification and seller activity.",
    icon: "👥",
    href: "/admin/sellers",
    action: "Manage Sellers",
  },
  {
    title: "Customers",
    description: "View and manage customer accounts.",
    icon: "👤",
    href: "/admin/customers",
    action: "Manage Customers",
  },
  {
    title: "Orders",
    description: "Monitor customer orders and order activity.",
    icon: "📦",
    href: "/admin/orders",
    action: "View Orders",
  },
  {
    title: "Delivery & Tracking",
    description: "Manage deliveries and marketplace tracking.",
    icon: "🚚",
    href: "/admin/delivery",
    action: "Manage Delivery",
  },
  {
    title: "Payments",
    description: "Monitor marketplace payments and transactions.",
    icon: "💳",
    href: "/admin/payments",
    action: "View Payments",
  },
  {
    title: "Revenue & Payments",
    description:
      "Monitor platform revenue, seller settlements, held funds and delivery payments.",
    icon: "💰",
    href: "/admin/revenue",
    action: "Manage Revenue",
  },
  {
    title: "Advertising",
    description:
      "Configure seller promotions, company advertising packages and advertising limits.",
    icon: "📢",
    href: "/admin/advertising",
    action: "Manage Advertising",
  },
  {
    title: "Refund Policy",
    description: "Manage refund conditions and customer refund requests.",
    icon: "↩️",
    href: "/admin/refund-policy",
    action: "Manage Refunds",
  },
  {
    title: "Customer Service",
    description:
      "View customer enquiries, respond to complaints and manage support tickets and staff.",
    icon: "🎧",
    href: "/admin/support",
    action: "Open Customer Service",
  },
  {
    title: "Content Management (CMS)",
    description:
      "Create, edit and publish About Us, Contact Us, Privacy Policy, Terms and Conditions, and Help Centre pages.",
    icon: "📝",
    href: "/admin/cms",
    action: "Manage Website Content",
  },
  {
    title: "Settings",
    description:
      "Configure advertising, currency, revenue and administrator settings.",
    icon: "⚙️",
    href: "/admin/settings",
    action: "Open Settings",
  },
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-2xl text-white">
              ⭐
            </span>
            <span>
              <strong className="block text-lg font-black">
                BEST SALES GHANA
              </strong>
              <span className="text-sm text-slate-500">
                Administration Portal
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-xl border border-slate-300 px-4 py-3 font-bold hover:bg-slate-50"
            >
              View Website
            </Link>

            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="rounded-xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-gradient-to-r from-blue-800 to-cyan-600 p-7 text-white sm:p-10">
          <p className="text-sm font-black uppercase tracking-widest text-cyan-100">
            Administration
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            Admin Dashboard
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-white/90">
            Manage BestSalesGH marketplace operations, products, sellers,
            customers, orders, payments, advertising, refunds, customer
            service, website content and settings.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/settings"
              className="inline-flex rounded-xl bg-white px-5 py-3 font-black text-blue-800 hover:bg-blue-50"
            >
              ⚙️ Open Settings →
            </Link>

            <Link
              href="/admin/cms"
              className="inline-flex rounded-xl border border-white/60 px-5 py-3 font-black text-white hover:bg-white/10"
            >
              📝 Open CMS →
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black">
            Marketplace Administration
          </h2>

          <p className="mt-2 text-slate-500">
            Select a section to open its management page.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {adminSections.map((section) => (
              <article
                key={section.title}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                  {section.icon}
                </div>

                <h3 className="mt-5 text-xl font-black">
                  {section.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
                  {section.description}
                </p>

                <Link
                  href={section.href}
                  className="mt-6 inline-flex w-fit items-center rounded-xl border border-blue-700 px-4 py-3 font-bold text-blue-700 transition hover:bg-blue-700 hover:text-white"
                >
                  {section.action} →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          <p className="font-bold text-slate-700">
            BEST SALES GHANA — ADMINISTRATION
          </p>

          <p className="mt-2">
            © {new Date().getFullYear()} All Prominent Ghana Limited.
            All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
