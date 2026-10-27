"use client";

import Link from "next/link";

const adminSections = [
  { title: "Direct Sales", icon: "🛒", href: "/admin/direct-sales" },
  { title: "Marketplace Listings", icon: "📋", href: "/listings" },
  { title: "Sellers", icon: "👥", href: "/admin/sellers" },
  { title: "Customers", icon: "👤", href: "/admin/customers" },
  { title: "Orders", icon: "📦", href: "/admin/orders" },
  { title: "Delivery & Tracking", icon: "🚚", href: "/admin/delivery" },
  { title: "Payments", icon: "💳", href: "/admin/payments" },
  { title: "Revenue & Payments", icon: "💰", href: "/admin/revenue" },
  { title: "Advertising", icon: "📢", href: "/admin/advertising" },
  { title: "Refund Policy", icon: "↩️", href: "/admin/refund-policy" },
  { title: "Customer Service", icon: "🎧", href: "/admin/support" },
  { title: "Content Management", icon: "📝", href: "/admin/cms" },
  { title: "Settings", icon: "⚙️", href: "/admin/settings" },
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="flex min-w-0 items-center gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-xl text-white">
              ⭐
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-sm font-black sm:text-base">
                BEST SALES GHANA
              </strong>
              <span className="text-xs text-slate-500">
                Admin Portal
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold hover:bg-slate-50"
            >
              Website
            </Link>

            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-5 sm:py-7">
        <section className="rounded-2xl bg-gradient-to-r from-blue-800 to-cyan-600 p-5 text-white sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-100">
            Administration
          </p>

          <h1 className="mt-2 text-2xl font-black sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-white/90">
            Manage your marketplace from one place.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/admin/settings"
              className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-blue-800 hover:bg-blue-50"
            >
              ⚙️ Settings
            </Link>

            <Link
              href="/admin/cms"
              className="rounded-lg border border-white/60 px-3 py-2 text-sm font-bold text-white hover:bg-white/10"
            >
              📝 Website Content
            </Link>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black sm:text-xl">
              Management
            </h2>
            <span className="text-xs text-slate-500">
              {adminSections.length} sections
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {adminSections.map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className="group flex min-h-28 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-400 hover:shadow-md active:scale-[0.98] sm:min-h-32 sm:p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  {section.icon}
                </span>

                <span className="mt-3 flex items-center justify-between gap-1">
                  <span className="text-sm font-bold leading-5 group-hover:text-blue-700">
                    {section.title}
                  </span>
                  <span className="shrink-0 text-sm text-blue-700">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-8 border-t border-slate-200 py-5 text-center text-xs text-slate-500">
          <p className="font-bold text-slate-700">
            BEST SALES GHANA
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} All Prominent Ghana Limited.
          </p>
        </footer>
      </div>
    </main>
  );
}
