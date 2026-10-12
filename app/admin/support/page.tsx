
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/supabase-browser";

type SupportMessage = {
  id: string;
  user_id: string;
  subject?: string | null;
  message?: string | null;
  content?: string | null;
  status?: string | null;
  created_at?: string | null;
};

export default function AdminSupportPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Create the Supabase client before using auth or database methods.
      const supabase = supabaseBrowser();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.href = "/login";
        return;
      }

      // IMPORTANT: Server-side/RLS policies must restrict this data to admins.
      const { data, error: queryError } = await supabase
        .from("support_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (queryError) {
        throw queryError;
      }

      setMessages((data ?? []) as SupportMessage[]);
    } catch (err) {
      console.error("ADMIN SUPPORT LOAD ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customer support messages."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  async function updateStatus(id: string, status: "open" | "closed") {
    setError("");
    setUpdatingId(id);

    try {
      const supabase = supabaseBrowser();

      const { error: updateError } = await supabase
        .from("support_messages")
        .update({ status })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }

      await loadMessages();
    } catch (err) {
      console.error("ADMIN SUPPORT UPDATE ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the support request."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const openCount = messages.filter(
    (message) => (message.status || "open").toLowerCase() !== "closed"
  ).length;

  const closedCount = messages.length - openCount;

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              Customer Service Center
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              View and manage customer support requests.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Back to Admin Dashboard
          </Link>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Messages</p>
            <p className="mt-2 text-3xl font-bold">{messages.length}</p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Open Messages</p>
            <p className="mt-2 text-3xl font-bold">{openCount}</p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Closed Messages</p>
            <p className="mt-2 text-3xl font-bold">{closedCount}</p>
          </div>
        </div>

        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="text-lg font-semibold">Support Inbox</h2>

            <button
              type="button"
              onClick={() => void loadMessages()}
              disabled={loading}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <p className="font-semibold">Support request error</p>
              <p className="mt-1 break-words">{error}</p>
              <p className="mt-2">
                Check that the support_messages table, its columns, and the
                appropriate Supabase permissions are configured.
              </p>
            </div>
          )}

          {loading && messages.length === 0 && (
            <p className="p-6 text-slate-500">Loading messages...</p>
          )}

          {!loading && !error && messages.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-medium">No support messages found.</p>
              <p className="mt-2 text-sm text-slate-500">
                Customer messages will appear here when they are available
                to the administrator.
              </p>
            </div>
          )}

          {messages.length > 0 && (
            <div className="divide-y">
              {messages.map((message) => {
                const status = (message.status || "open").toLowerCase();
                const isClosed = status === "closed";
                const isUpdating = updatingId === message.id;

                return (
                  <article key={message.id} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold">
                          {message.subject || "Customer Support Request"}
                        </h3>

                        <p className="mt-1 break-all text-xs text-slate-500">
                          Customer ID: {message.user_id}
                        </p>

                        {message.created_at && (
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        )}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isClosed
                            ? "bg-slate-100 text-slate-700"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {status.replaceAll("_", " ")}
                      </span>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                      {message.message ||
                        message.content ||
                        "No message text"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {isClosed ? (
                        <button
                          type="button"
                          onClick={() =>
                            void updateStatus(message.id, "open")
                          }
                          disabled={isUpdating}
                          className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
                        >
                          {isUpdating ? "Updating..." : "Reopen"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            void updateStatus(message.id, "closed")
                          }
                          disabled={isUpdating}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-60"
                        >
                          {isUpdating ? "Updating..." : "Close Request"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
