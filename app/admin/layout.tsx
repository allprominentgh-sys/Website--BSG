
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // The login page must remain accessible without a session.
    if (isLoginPage) {
      setChecking(false);
      setAuthorized(false);
      return;
    }

    let active = true;

    async function verifyAdminSession() {
      setChecking(true);
      setAuthorized(false);

      try {
        const response = await fetch("/api/admin/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!active) return;

        if (response.ok) {
          const data = await response.json();

          if (active && data?.authenticated === true) {
            setAuthorized(true);
            return;
          }
        }

        router.replace("/admin/login");
      } catch {
        if (active) {
          router.replace("/admin/login");
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    verifyAdminSession();

    return () => {
      active = false;
    };
  }, [isLoginPage, pathname, router]);

  // Never block the login page behind its own authentication check.
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking || !authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-800">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="font-bold">
            Verifying administrator access...
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Please wait.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
