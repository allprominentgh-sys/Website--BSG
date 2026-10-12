
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/supabase-browser";

type SupportMessage = {
  id: string;
  user_id: string;
  sender_role?: string | null;
  subject?: string | null;
  message?: string | null;
  content?: string | null;
  status?: string | null;
  created_at?: string | null;
  assigned_agent_id?: string | null;
  referred_to_admin?: boolean;
};

type SupportAgent = {
  id: string;
  slot_number: number | null;
  display_name: string;
  user_id: string | null;
  is_active: boolean;
};

export default function AdminSupportPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [savingId, setSavingId] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = supabaseBrowser();
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError) throw authError;

      if (!session?.access_token) {
        setError("Please sign in with your administrator account.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/support", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            `Support API returned HTTP ${response.status}.`
        );
      }

      setMessages(result.messages ?? []);
      setAgents(result.agents ?? []);
    } catch (err) {
      console.error("Support CMS:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the support inbox."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function updateMessage(
    messageId: string,
    changes: Record<string, unknown>
  ) {
    setSavingId(messageId);
    setError("");
    setNotice("");

    try {
      const supabase = supabaseBrowser();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Please sign in again.");
      }

      const response = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageId, ...changes }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to update request.");
      }

      setNotice("Support request updated.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Update failed."
      );
    } finally {
      setSavingId("");
    }
  }

  const openCount = messages.filter(
    (m) => (m.status || "open").toLowerCase() === "open"
  ).length;

  const pendingCount = messages.filter(
    (m) => (m.status || "open").toLowerCase() === "pending"
  ).length;

  const closedCount = messages.filter(
    (m) => (m.status || "open").toLowerCase() === "closed"
  ).length;

  const unassignedCount = messages.filter(
    (m) => !m.assigned_agent_id
  ).length;

  const referredCount = messages.filter(
    (m) => m.referred_to_admin
  ).length;

  const visibleMessages = messages.filter((m) => {
    const status = (m.status || "open").toLowerCase();
    const term = search.trim().toLowerCase();

    if (filter === "open" && status !== "open") return false;
    if (filter === "pending" && status !== "pending") return false;
    if (filter === "closed" && status !== "closed") return false;
    if (filter === "unassigned" && m.assigned_agent_id) return false;
    if (filter === "referred" && !m.referred_to_admin) return false;

    if (term) {
      const text = [
        m.id,
        m.user_id,
        m.subject,
        m.message,
        m.content,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!text.includes(term)) return false;
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">
            BestsalesGH Customer Service
          </h1>

          <p className="mt-2 text-slate-600">
            Manage customer chats, assign support staff and refer
            difficult cases to the administrator.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold"
            >
              Back to Admin Dashboard
            </Link>

            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Loading..." : "Refresh Inbox"}
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 break-words rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
          >
            <p className="font-bold">Support system notice</p>
            <p className="mt-1">{error}</p>
            <p className="mt-2 text-sm">
              If this is a 404, check that
              app/api/admin/support/route.ts exists and is deployed.
              If it says administrator access required, the API
              authentication must be corrected.
            </p>
          </div>
        )}

        {notice && (
          <p className="mb-5 rounded-lg bg-green-50 p-3 text-green-800">
            {notice}
          </p>
        )}

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            ["Total Messages", messages.length],
            ["Open", openCount],
            ["Pending", pendingCount],
            ["Closed", closedCount],
            ["Unassigned", unassignedCount],
          ].map(([label, count]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold">{count}</p>
            </div>
          ))}
        </section>

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold">Support Team</h2>
          <p className="mt-1 text-sm text-slate-500">
            Five initial staff positions, expandable as the company grows.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((slot) => {
              const agent = agents.find(
                (a) => a.slot_number === slot
              );

              return (
                <div
                  key={slot}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800">
                    {slot}
                  </div>
                  <p className="mt-3 font-semibold">
                    {agent?.display_name || `Support Agent ${slot}`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {agent
                      ? agent.is_active
                        ? "Active"
                        : "Inactive"
                      : "Not configured"}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Active agents returned by the API:{" "}
            {agents.filter((a) => a.is_active).length}
          </p>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Support Inbox</h2>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800">
                Admin referrals: {referredCount}
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer ID or message"
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
              >
                <option value="all">All requests</option>
                <option value="open">Open requests</option>
                <option value="pending">Pending requests</option>
                <option value="closed">Closed requests</option>
                <option value="unassigned">Unassigned requests</option>
                <option value="referred">Referred to admin</option>
              </select>
            </div>
          </div>

          {loading && messages.length === 0 && (
            <p className="p-6 text-slate-500">
              Loading support messages...
            </p>
          )}

          {!loading && !error && visibleMessages.length === 0 && (
            <p className="p-8 text-center text-slate-500">
              No matching support messages.
            </p>
          )}

          <div className="divide-y divide-slate-200">
            {visibleMessages.map((m) => {
              const status = (m.status || "open").toLowerCase();

              return (
                <article key={m.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold">
                        {m.subject || "Customer Support Request"}
                      </h3>
                      <p className="mt-1 break-all text-xs text-slate-500">
                        Customer ID: {m.user_id}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {m.created_at
                          ? new Date(m.created_at).toLocaleString()
                          : "Date unavailable"}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                      {status}
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6">
                    {m.message || m.content || "No message text"}
                  </p>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="text-sm font-medium">
                      Assign to staff
                      <select
                        value={m.assigned_agent_id || ""}
                        disabled={savingId === m.id}
                        onChange={(e) =>
                          void updateMessage(m.id, {
                            assignedAgentId: e.target.value || null,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
                      >
                        <option value="">Unassigned</option>
                        {agents
                          .filter((a) => a.is_active)
                          .map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.display_name}
                            </option>
                          ))}
                      </select>
                    </label>

                    <label className="text-sm font-medium">
                      Update status
                      <select
                        value={status}
                        disabled={savingId === m.id}
                        onChange={(e) =>
                          void updateMessage(m.id, {
                            status: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
                      >
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                      </select>
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={savingId === m.id}
                      onClick={() =>
                        void updateMessage(m.id, {
                          referredToAdmin: !m.referred_to_admin,
                        })
                      }
                      className="rounded-lg border border-purple-300 px-4 py-2 font-medium text-purple-800 disabled:opacity-60"
                    >
                      {m.referred_to_admin
                        ? "Remove Admin Referral"
                        : "Refer to Admin"}
                    </button>

                    <button
                      type="button"
                      disabled={savingId === m.id}
                      onClick={() =>
                        void updateMessage(m.id, {
                          status: status === "closed" ? "open" : "closed",
                        })
                      }
                      className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60"
                    >
                      {savingId === m.id
                        ? "Saving..."
                        : status === "closed"
                          ? "Reopen Request"
                          : "Close Request"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
