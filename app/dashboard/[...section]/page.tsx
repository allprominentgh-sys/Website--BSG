
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pages: Record<
  string,
  { title: string; description: string; icon: string }
> = {
  orders: {
    title: "My Orders",
    description: "View and manage your marketplace orders.",
    icon: "📦",
  },
  analytics: {
    title: "Analytics",
    description: "Monitor the performance of your advertisements.",
    icon: "📊",
  },
  visits: {
    title: "Website Visits",
    description: "Track visitors to your marketplace.",
    icon: "👁️",
  },
  messages: {
    title: "Messages",
    description: "Communicate with buyers and sellers.",
    icon: "💬",
  },
  favourites: {
    title: "Favourites",
    description: "View the products you have saved.",
    icon: "❤️",
  },
  payments: {
    title: "Payments",
    description: "View your payment history and transactions.",
    icon: "💳",
  },
  promote: {
    title: "Promote Ads",
    description: "Explore options for promoting your listings.",
    icon: "⭐",
  },
  profile: {
    title: "My Profile",
    description: "Manage your personal and business information.",
    icon: "👤",
  },
  settings: {
    title: "Settings",
    description: "Manage your account preferences.",
    icon: "⚙️",
  },
  support: {
    title: "Help & Support",
    description: "Get assistance with your account.",
    icon: "❓",
  },
};

export default function DashboardSectionPage() {
  const pathname = usePathname();
  const section = pathname.split("/").filter(Boolean).pop() || "";
  const page = pages[section];

  if (!page) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-black">Page not found</h1>
          <p className="mt-3 text-slate-500">
            This dashboard section does not exist.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-xl bg-blue-700 px-6 py-3 font-bold text-white"
          >
            Return to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 font-bold text-blue-700"
        >
          ← Back to Dashboard
        </Link>

        <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-10">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              {page.icon}
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
                BEST SALES GHANA
              </p>
              <h1 className="mt-1 text-3xl font-black">
                {page.title}
              </h1>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-slate-50 p-6">
            <h2 className="text-lg font-bold">
              Welcome to {page.title}
            </h2>

            <p className="mt-2 leading-7 text-slate-600">
              {page.description}
            </p>

            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <p className="font-bold text-blue-900">
                Your page is now connected.
              </p>
              <p className="mt-2 text-sm leading-6 text-blue-800">
                We will add the full functionality for this section
                step by step, without affecting the rest of your website.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-slate-500">
          © 2026 All Prominent Ghana Limited.
        </footer>
      </div>
    </main>
  );
}
