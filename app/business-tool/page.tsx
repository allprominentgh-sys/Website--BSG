
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/supabase-browser";

type AccessState = "checking" | "allowed" | "denied" | "error";

export default function BusinessToolPage() {
  const router = useRouter();
  const [access, setAccess] = useState<AccessState>("checking");
  const [message, setMessage] = useState(
    "Checking your Business Tools access..."
  );

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabaseBrowser.auth.getUser();

        if (authError || !user) {
          if (!cancelled) {
            setAccess("denied");
            setMessage("Please sign in to access Business Tools.");
          }
          return;
        }

        const now = new Date().toISOString();

        const { data, error: entitlementError } = await supabaseBrowser
          .from("btool_entitlements")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .gt("expires_at", now)
          .limit(1);

        if (entitlementError) {
          console.error(
            "Business Tools entitlement check failed:",
            entitlementError
          );

          if (!cancelled) {
            setAccess("error");
            setMessage(
              "We could not verify your Business Tools access. Please try again."
            );
          }
          return;
        }

        if (!data || data.length === 0) {
          if (!cancelled) {
            setAccess("denied");
            setMessage(
              "Business Tools requires an active BTool add-on purchased with an advertising package."
            );
          }
          return;
        }

        if (!cancelled) {
          setAccess("allowed");
          setMessage("");
        }
      } catch (error) {
        console.error("Business Tools access check error:", error);

        if (!cancelled) {
          setAccess("error");
          setMessage(
            "An unexpected error occurred while checking your access."
          );
        }
      }
    }

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, []);

  if (access === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" />
          <h1 className="text-xl font-bold text-gray-900">
            Business Tools
          </h1>
          <p className="mt-3 text-sm text-gray-600">{message}</p>
        </div>
      </main>
    );
  }

  if (access === "denied" || access === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
            {access === "denied" ? "🔒" : "⚠️"}
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Business Tools
          </h1>

          <p className="mt-3 text-gray-600">{message}</p>

          {access === "denied" ? (
            <div className="mt-6 space-y-3">
              <Link
                href="/dashboard/promote"
                className="block w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
              >
                Choose an Advertising Package
              </Link>

              <Link
                href="/dashboard"
                className="block w-full rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Return to Dashboard
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => router.refresh()}
              className="mt-6 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Retry
            </button>
          )}
        </div>
      </main>
    );
  }

  // Access is granted. Keep your existing Business Tools interface here.
  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              BEST SALES GHANA Business Tools
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your business documents and sales.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>

        <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Your BTool access is active
          </h2>
          <p className="mt-2 text-gray-600">
            Your account has an active Business Tools entitlement.
          </p>

          <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
            Important: insert your existing invoice, receipt, and sales
            interface here. This access-checking replacement does not
            recreate those existing features.
          </div>
        </section>
      </div>
    </main>
  );
}
