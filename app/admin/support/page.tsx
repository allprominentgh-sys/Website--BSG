"use client";
import { useEffect, useState } from "react";
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
  async function loadMessages() {
    setLoading(true);
    setError("");
    try {
      // Verify the signed-in user first.
      const {
        data: { user },
        error: authError,
      } = await supabaseBrowser.auth.getUser();
      if (authError || !user) {
        window.location.href = "/login";
        return;
      }
      /*
       * IMPORTANT:
       * This assumes your support table is named "support_messages".
       * Your database must also have an admin authorization policy.
       */
      const { data, error: queryError } = await supabaseBrowser
        .from("support_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (queryError) {
        throw queryError;
      }
      setMessages((data ?? []) as SupportMessage[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customer support messages."
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void loadMessages();
  }, []);
  async function updateStatus(id: string, status: string) {
    setError("");
    const { error: updateError } = await supabaseBrowser
      .from("support_messages")
      .update({ status })
      .eq("id", id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await loadMessages();
  }
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
            <p className="mt-2 text-3xl font-bold">
              {messages.filter((m) => m.status !== "closed").length}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Closed Messages</p>
            <p className="mt-2 text-3xl font-bold">
              {messages.filter((m) => m.status === "closed").length}
            </p>
          </div>
        </div>
        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="text-lg font-semibold">Support Inbox</h2>
            <button
              onClick={() => void loadMessages()}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Refresh
            </button>
          </div>
          {loading && (
            <p className="p-6 text-slate-500">Loading messages...</p>
          )}
          {!loading && error && (
            <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
              <p className="mt-2">
                If the table does not exist, we need to match this page to
                your existing Supabase support table.
              </p>
            </div>
          )}
          {!loading && !error && messages.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-medium">No support messages found.</p>
              <p className="mt-2 text-sm text-slate-500">
                Customer messages will appear here once the database connection
                is configured correctly.
              </p>
            </div>
          )}
          {!loading && !error && messages.length > 0 && (
            <div className="divide-y">
              {messages.map((message) => (
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
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                      {message.status || "open"}
                    </span>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {message.message || message.content || "No message text"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => void updateStatus(message.id, "open")}
                      className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      Reopen
                    </button>
                    <button
                      onClick={() => void updateStatus(message.id, "closed")}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700"
                    >
                      Close Request
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
