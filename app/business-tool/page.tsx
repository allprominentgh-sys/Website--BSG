
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/supabase-browser";

type AccessState = "checking" | "allowed" | "denied" | "error";

export default function BusinessToolPage() {
  const [access, setAccess] = useState<AccessState>("checking");
  const [message, setMessage] = useState(
    "Checking your Business Tools access..."
  );

  const checkAccess = useCallback(async () => {
    setAccess("checking");
    setMessage("Checking your Business Tools access...");

    try {
      // Your helper exports a function, so call it first.
      const supabase = supabaseBrowser();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setAccess("denied");
        setMessage("Please sign in to access Business Tools.");
        return;
      }

      const { data, error } = await supabase
        .from("btool_entitlements")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .limit(1);

      if (error) {
        console.error("BTool access check failed:", error);
        setAccess("error");
        setMessage(
          "We could not verify your access. Please try again."
        );
        return;
      }

      if (!data || data.length === 0) {
        setAccess("denied");
        setMessage(
          "Business Tools requires an active BTool add-on purchased with an advertising package."
        );
        return;
      }

      setAccess("allowed");
      setMessage("");
    } catch (error) {
      console.error("Business Tools access error:", error);
      setAccess("error");
      setMessage(
        "An unexpected error occurred while checking access."
      );
    }
  }, []);

  useEffect(() => {
    void checkAccess();
  }, [checkAccess]);

  if (access === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" />
          <h1 className="text-xl font-bold text-gray-900">
            BEST SALES GHANA Business Tools
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
          <h1 className="text-2xl font-bold text-gray-900">
            Business Tools
          </h1>

          <p className="mt-3 text-gray-600">{message}</p>

          {access === "denied" ? (
            <div className="mt-6 space-y-3">
              <Link
                href="/dashboard/promote"
                className="block rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
              >
                Choose an Advertising Package
              </Link>

              <Link
                href="/dashboard"
                className="block rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Return to Dashboard
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void checkAccess()}
              className="mt-6 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Retry
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            BEST SALES GHANA Business Tools
          </h1>

          <p className="mt-3 text-gray-600">
            Your BTool entitlement is active.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Your existing invoice, receipt, and sales interface needs
            to be retained in this section when integrating this
            access check into the full Business Tools page.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
