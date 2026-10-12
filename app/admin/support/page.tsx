
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/supabase-browser";

type SupportMessage = {
  id: string;
  user_id: string;
  sender_role: string;
  subject?: string | null;
  message?: string | null;
  content?: string | null;
  status?: string | null;
  created_at?: string | null;
  conversation_id?: string | null;
  assigned_agent_id?: string | null;
  referred_to_admin?: boolean;
  referred_at?: string | null;
  updated_at?: string | null;
};

type SupportAgent = {
  id: string;
  slot_number: number | null;
  display_name: string;
  user_id: string | null;
  is_active: boolean;
  created_at: string;
};

type FilterType =
  | "all"
  | "unassigned"
  | "open"
  | "pending"
  | "closed"
  | "referred";

export default function AdminSupportPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [addingAgent, setAddingAgent] = useState(false);

  const getToken = useCallback(async () => {
    const supabase = supabaseBrowser();
    const { data, error: authError } = await supabase.auth.getSession();

    if (authError || !data.session?.access_token) {
      window.location.href = "/login";
      throw new Error("Please sign in again.");
    }

    return data.session.access_token;
  }, []);

  const loadMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");

    try {
      const token = await getToken();

      const response = await fetch("/api/admin/support", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load support data.");
      }

      setMessages(result.messages ?? []);
      setAgents(result.agents ?? []);
    } catch (err) {
      console.error("Support CMS load error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load support data."
      );
    } finally {
      if (!silent) setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void loadMessages();

    const supabase = supabaseBrowser();

    const channel = supabase
      .channel("admin-support-cms-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_messages",
        },
        () => {
          void loadMessages(true);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_agents",
        },
        () => {
          void loadMessages(true);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadMessages]);

  async function updateMessage(
    messageId: string,
    changes: {
      status?: "open" | "pending" | "closed";
      assignedAgentId?: string | null;
      referredToAdmin?: boolean;
    },
    successMessage: string
  ) {
    setSaving(messageId);
    setError("");
    setNotice("");

    try {
      const token = await getToken();

      const response = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageId, ...changes }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Update failed.");
      }

      setNotice(successMessage);
      await loadMessages(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update request."
      );
    } finally {
      setSaving(null);
    }
  }

  async function addAgent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddingAgent(true);
    setError("");
    setNotice("");

    try {
      const token = await getToken();

      const response = await fetch("/api/admin/support", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: agentName.trim(),
          email: agentEmail.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to add agent.");
      }

      setAgentName("");
      setAgentEmail("");
      setShowAddAgent(false);
      setNotice("Staff invitation sent successfully.");
      await loadMessages(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to add agent."
      );
    } finally {
      setAddingAgent(false);
    }
  }

  const activeAgents = useMemo(
    () => agents.filter((agent) => agent.is_active),
    [agents]
  );

  const openCount = messages.filter(
    (message) => (message.status || "open").toLowerCase() === "open"
  ).length;

  const pendingCount = messages.filter(
    (message) => (message.status || "open").toLowerCase() === "pending"
  ).length;

  const closedCount = messages.filter(
    (message) => (message.status || "open").toLowerCase() === "closed"
  ).length;

  const unassignedCount = messages.filter(
    (message) => !message.assigned_agent_id
  ).length;

  const referredCount = messages.filter(
    (message) => message.referred_to_admin
  ).length;

  const filteredMessages = useMemo(() => {
    const term = search.trim().toLowerCase();

    return messages.filter((message) => {
      const status = (message.status || "open").toLowerCase();

      if (filter === "unassigned" && message.assigned_agent_id) {
        return false;
      }
      if (filter === "open" && status !== "open") return false;
      if (filter === "pending" && status !== "pending") return false;
      if (filter === "closed" && status !== "closed") return false;
      if (filter === "referred" && !message.referred_to_admin) {
        return false;
      }

      if (
        agentFilter !== "all" &&
        message.assigned_agent_id !== agentFilter
      ) {
        return false;
      }

      if (term) {
        const searchable = [
          message.subject,
          message.message,
          message.content,
          message.user_id,
          message.id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(term)) return false;
      }

      return true;
    });
  }, [messages, filter, agentFilter, search]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              BestsalesGH Support CMS
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage customer conversations, support staff and referrals.
            </p>
            <p className="mt-2 text-xs font-medium text-green-700">
              Live updates enabled
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
            >
              Back to Admin
            </Link>

            <button
              type="button"
              onClick={() => void loadMessages()}
              disabled={loading}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { label: "Total Messages", value: messages.length },
            { label: "Open", value: openCount },
            { label: "Pending", value: pendingCount },
            { label: "Closed", value: closedCount },
            { label: "Unassigned", value: unassignedCount },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Support Team</h2>
              <p className="mt-1 text-sm text-slate-500">
                Five initial staff slots, with room to grow.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddAgent((value) => !value)}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              {showAddAgent ? "Cancel" : "+ Add Support Agent"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-800">
                    {agent.slot_number ?? "＋"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {agent.display_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {agent.user_id
                        ? "Account linked"
                        : "Awaiting account invitation"}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  {agent.is_active ? "Active" : "Inactive"}
                </p>
              </div>
            ))}
          </div>

          {agents.length === 0 && !loading && (
            <p className="mt-4 text-sm text-slate-500">
              No support agents returned by the API.
            </p>
          )}

          {showAddAgent && (
            <form
              onSubmit={addAgent}
              className="mt-5 grid gap-4 rounded-lg bg-slate-50 p-4 md:grid-cols-3"
            >
              <label className="text-sm font-medium">
                Agent display name
                <input
                  required
                  maxLength={100}
                  value={agentName}
                  onChange={(event) => setAgentName(event.target.value)}
                  placeholder="e.g. Customer Care 6"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal"
                />
              </label>

              <label className="text-sm font-medium">
                Staff email
                <input
                  required
                  type="email"
                  value={agentEmail}
                  onChange={(event) => setAgentEmail(event.target.value)}
                  placeholder="agent@example.com"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal"
                />
              </label>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={addingAgent}
                  className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {addingAgent ? "Sending invitation..." : "Invite Agent"}
                </button>
              </div>

              <p className="text-xs text-slate-500 md:col-span-3">
                An invitation email is sent by Supabase Auth. This adds the
                staff record but does not, by itself, grant agent dashboard
                permissions. Those must be enforced by the agent API.
              </p>
            </form>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Support Inbox</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Admin referral queue: {referredCount}
                </p>
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                {filteredMessages.length} shown
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search message, customer ID..."
                className="rounded-lg border border-slate-300 px-3 py-3 text-sm md:col-span-1"
              />

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as FilterType)
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
              >
                <option value="all">All messages</option>
                <option value="unassigned">Unassigned</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
                <option value="referred">Referred to admin</option>
              </select>

              <select
                value={agentFilter}
                onChange={(event) => setAgentFilter(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
              >
                <option value="all">All agents</option>
                {activeAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.slot_number
                      ? `Agent ${agent.slot_number}: `
                      : ""}
                    {agent.display_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && messages.length === 0 && (
            <p className="p-6 text-slate-500">Loading support messages...</p>
          )}

          {!loading && filteredMessages.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-semibold">No matching messages</p>
              <p className="mt-2 text-sm text-slate-500">
                Try another filter or refresh the inbox.
              </p>
            </div>
          )}

          <div className="divide-y divide-slate-200">
            {filteredMessages.map((message) => {
              const status = (message.status || "open").toLowerCase();
              const assignedAgent = agents.find(
                (agent) => agent.id === message.assigned_agent_id
              );

              return (
                <article key={message.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold">
                        {message.subject || "Customer Support Request"}
                      </h3>
                      <p className="mt-1 break-all text-xs text-slate-500">
                        Customer ID: {message.user_id}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {message.created_at
                          ? new Date(message.created_at).toLocaleString()
                          : "Date unavailable"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Sender: {message.sender_role}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          status === "closed"
                            ? "bg-slate-100 text-slate-700"
                            : status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {status}
                      </span>

                      {message.referred_to_admin && (
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
                          Admin referral
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                    {message.message || message.content || "No message text"}
                  </p>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="text-sm font-medium">
                      Assign conversation
                      <select
                        value={message.assigned_agent_id || ""}
                        disabled={saving === message.id}
                        onChange={(event) => {
                          const value = event.target.value;
                          void updateMessage(
                            message.id,
                            { assignedAgentId: value || null },
                            "Assignment updated."
                          );
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal"
                      >
                        <option value="">Unassigned</option>
                        {activeAgents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.slot_number
                              ? `Agent ${agent.slot_number}: `
                              : ""}
                            {agent.display_name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm font-medium">
                      Request status
                      <select
                        value={status}
                        disabled={saving === message.id}
                        onChange={(event) => {
                          const value = event.target.value as
                            | "open"
                            | "pending"
                            | "closed";
                          void updateMessage(
                            message.id,
                            { status: value },
                            "Status updated."
                          );
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal"
                      >
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                      </select>
                    </label>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Assigned to: {assignedAgent?.display_name || "No agent"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={saving === message.id}
                      onClick={() =>
                        void updateMessage(
                          message.id,
                          {
                            referredToAdmin: !message.referred_to_admin,
                          },
                          message.referred_to_admin
                            ? "Admin referral removed."
                            : "Conversation referred to admin."
                        )
                      }
                      className="rounded-lg border border-purple-200 px-3 py-2 text-sm font-medium text-purple-800 hover:bg-purple-50 disabled:opacity-60"
                    >
                      {message.referred_to_admin
                        ? "Remove Referral"
                        : "Refer to Admin"}
                    </button>

                    <button
                      type="button"
                      disabled={saving === message.id}
                      onClick={() =>
                        void updateMessage(
                          message.id,
                          {
                            status: status === "closed" ? "open" : "closed",
                          },
                          status === "closed"
                            ? "Request reopened."
                            : "Request closed."
                        )
                      }
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                    >
                      {saving === message.id
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

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Live monitoring depends on Supabase Realtime being enabled and
          authorized. This admin page manages message records; customer-facing
          conversation threading and agent replies require their own connected
          pages and secure APIs.
        </p>
      </div>
    </main>
  );
}
