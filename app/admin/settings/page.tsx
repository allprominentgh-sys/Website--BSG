
import Link from "next/link";

const settingsSections = [
  {
    icon: "📢",
    title: "Advertising Settings",
    description:
      "Manage individual seller promotion prices, company advertising packages, free-ad limits and promotion duration.",
    href: "/admin/advertising",
    action: "Configure Advertising",
  },
  {
    icon: "💱",
    title: "Currency Settings",
    description:
      "Manage currency exchange rates and automatic adjustment preferences.",
    href: "/admin#currency-management",
    action: "Manage Currencies",
  },
  {
    icon: "💰",
    title: "Revenue & Payments",
    description:
      "Review platform transaction fees, held funds and settlement controls.",
    href: "/admin/revenue",
    action: "Open Revenue",
  },
  {
    icon: "↩️",
    title: "Refund Policy",
    description:
      "Manage refund conditions and review customer refund requests.",
    href: "/admin/refund-policy",
    action: "Manage Refunds",
  },
  {
    icon: "🎧",
    title: "Customer Service",
    description:
      "Open customer enquiries, complaints and support tickets.",
    href: "/admin/support",
    action: "Open Support",
  },
];

export default function AdminSettingsPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin"
          className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Admin Dashboard
        </Link>

        <header className="mt-8 rounded-3xl bg-gradient-to-r from-blue-800 to-cyan-600 p-7 text-white sm:p-10">
          <p className="text-sm font-black uppercase tracking-widest text-cyan-100">
            Administrator Controls
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            BestSalesGH Settings
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-white/90">
            Access the available marketplace configuration pages from one
            central location.
          </p>
        </header>

        <section className="mt-8 grid gap-5 sm:grid-cols-2">
          {settingsSections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                {section.icon}
              </div>

              <h2 className="mt-5 text-xl font-black">{section.title}</h2>

              <p className="mt-3 min-h-16 leading-6 text-slate-600">
                {section.description}
              </p>

              <Link
                href={section.href}
                className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
              >
                {section.action} →
              </Link>
            </article>
          ))}
        </section>

        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <strong>Security:</strong> Keep administrator settings protected by
          server-side authorization. This page provides navigation; it does
          not independently authorize sensitive changes.
        </p>
      </div>
    </main>
  );
}
