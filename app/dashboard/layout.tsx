
import type { ReactNode } from "react";
import Link from "next/link";
import NotificationBell from "@/components/dashboard/NotificationBell";
import EnablePushNotifications from "@/components/EnablePushNotifications";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/dashboard"
            className="text-lg font-extrabold tracking-tight text-blue-800"
          >
            BEST SALES GHANA
          </Link>

          <div className="flex items-center gap-3">
            <NotificationBell />

            <Link
              href="/dashboard"
              className="hidden text-sm font-semibold text-slate-600 hover:text-blue-700 sm:block"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <section className="mb-6 rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-blue-900">
            Stay updated with BEST SALES GHANA
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Enable notifications to receive important updates about
            your account, messages, orders and advertisements.
          </p>

          <div className="mt-3">
            <EnablePushNotifications />
          </div>
        </section>

        {children}
      </main>
    </div>
  );
}
