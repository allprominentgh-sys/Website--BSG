
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type SupportMessage = {
  id: string;
  user_id: string;
  sender_role: string | null;
  message: string;
  created_at: string;
};

export default function SupportCMSPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const loadCMS = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = supabaseBrowser();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const accountType = (
        profile?.account_type ?? ""
      ).toLowerCase();

      if (!["admin", "administrator"].includes(accountType)) {
        setIsAdmin(false);
        setMessages([]);
        setError(
          "Administrator access required. Please sign in with an authorized administrator account."
        );
        return;
      }

      setIsAdmin(true);

      const { data, error: messageError } = await supabase
        .from("support_messages")
        .select(
          "id, user_id, sender_role, message, created_at"
        )
        .order("created_at", { ascending: false });

      if (messageError) throw messageError;

      setMessages((data ?? []) as SupportMessage[]);
    } catch (err) {
      console.error("Support CMS error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the support dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCMS();
  }, [loadCMS]);

  useEffect(() => {
    if (!isAdmin) return;

    const supabase = supabaseBrowser();

    const channel = supabase
      .channel("cms-support-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_messages",
        },
        () => {
          void loadCMS();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isAdmin, loadCMS]);

  const customerMessages = messages.filter(
    (item) =>
      (item.sender_role ?? "customer").toLowerCase() !==
      "admin"
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <p className="text-sm font-bold text-blue-700">
            BESTSALESGH ADMINISTRATION
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Customer Service CMS
          </h1>

          <p className="mt-2 text-slate-600">
            Manage customer conversations and access
            support administration.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold"
            >
              Back to Admin
            </Link>

            <button
              type="button"
              onClick={() => void loadCMS()}
              disabled={loading}
              className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"
          >
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Messages",
              value: messages.length,
            },
            {
              label: "Customer Messages",
              value: customerMessages.length,
            },
            {
              label: "Administrator Messages",
              value: messages.filter(
                (item) =>
                  (item.sender_role ?? "").toLowerCase() ===
                  "admin"
              ).length,
            },
            {
              label: "Support Access",
              value: isAdmin ? "Authorized" : "Restricted",
            },
          ].map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                {stat.label}
              </p>
              <p className="mt-3 break-words text-2xl font-black">
                {loading ? "…" : stat.value}
              </p>
            </article>
          ))}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">
            Support Team Administration
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Support agents must have individual authenticated
            accounts and authorized staff roles. Agent accounts,
            assignments and permissions must be configured in
            the database before agents can use this dashboard.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-blue-200 px-4 py-3 font-bold text-blue-700"
            >
              Admin Dashboard
            </Link>

            <Link
              href="/customer-service"
              className="rounded-xl border border-blue-200 px-4 py-3 font-bold text-blue-700"
            >
              Customer Service
            </Link>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-black">
              Customer Support Inbox
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Messages stored in the support_messages table.
            </p>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">
              Loading support messages...
            </p>
          ) : !isAdmin ? (
            <p className="p-6 text-slate-600">
              Sign in with an authorized administrator account
              to access customer conversations.
            </p>
          ) : messages.length === 0 ? (
            <p className="p-6 text-slate-600">
              No support messages found.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {messages.map((item) => (
                <article key={item.id} className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-bold">
                      Customer Conversation
                    </h3>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {item.sender_role || "Customer"}
                    </span>
                  </div>

                  <p className="mt-2 break-all text-xs text-slate-500">
                    Customer ID: {item.user_id}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(
                      item.created_at
                    ).toLocaleString("en-GH")}
                  </p>

                  <p className="mt-4 whitespace-pre-wrap break-words leading-6">
                    {item.message}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
