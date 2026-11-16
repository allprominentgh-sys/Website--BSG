
import type { ReactNode } from "react";
import Link from "next/link";
import NotificationBell from "@/components/dashboard/NotificationBell";

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
        {children}
      </main>
    </div>
  );
}
