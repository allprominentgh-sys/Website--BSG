
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type SupportMessage = {
  id: string;
  user_id: string;
  sender_role: string;
  message: string;
  created_at: string;
  subject: string | null;
  status: string;
  conversation_id: string;
  assigned_agent_id: string | null;
  referred_to_admin: boolean;
  referred_at: string | null;
  updated_at: string;
};

type SupportAgent = {
  id: string;
  slot_number: number | null;
  display_name: string;
  user_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type InboxResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  messages?: SupportMessage[];
  agents?: SupportAgent[];
  count?: number;
};

type Conversation = {
  id: string;
  messages: SupportMessage[];
  latest: SupportMessage;
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString();
}

function displayStatus(value: string): string {
  return (
    value
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase()) ||
    "Unknown"
  );
}

const inputClass =
  "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100";

const labelClass =
  "mb-1 block text-sm font-semibold text-slate-700";

function SetupNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-900">
      {children}
    </p>
  );
}

export default function AdminSupportPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedConversation, setSelectedConversation] = useState("");

  // Branch fields: blank by default; not connected to the database.
  const [companyId, setCompanyId] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchLocation, setBranchLocation] = useState("");
  const [branchManager, setBranchManager] = useState("");
  const [branchNotice, setBranchNotice] = useState("");

  const loadInbox = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(
        "/api/admin/support/inbox?limit=200",
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          headers: { Accept: "application/json" },
        }
      );

      const result = (await response.json()) as InboxResponse;

      if (response.status === 401 || response.status === 403) {
        setError(
          "Administrator access was not verified. Please sign in through the main BEST SALES GHANA administrator login and try again."
        );
        return;
      }

      if (!response.ok || result.success !== true) {
        setError(
          result.error ||
            result.message ||
            `Unable to load the inbox (HTTP ${response.status}).`
        );
        return;
      }

      setMessages(
        Array.isArray(result.messages) ? result.messages : []
      );
      setAgents(Array.isArray(result.agents) ? result.agents : []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Unable to load Support Centre inbox:", err);
      setError(
        "Could not connect to the Support Centre. Check your connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadInbox();

    const timer = window.setInterval(() => {
      void loadInbox(true);
    }, 30000);

    return () => window.clearInterval(timer);
  }, [loadInbox]);

  const conversations = useMemo((): Conversation[] => {
    const grouped = new Map<string, SupportMessage[]>();

    for (const message of messages) {
      const existing = grouped.get(message.conversation_id) ?? [];
      existing.push(message);
      grouped.set(message.conversation_id, existing);
    }

    const result: Conversation[] = [];

    grouped.forEach((conversationMessages, id) => {
      const sortedMessages = [...conversationMessages].sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );

      const latest = [...sortedMessages].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() -
          new Date(a.updated_at).getTime()
      )[0];

      if (latest) {
        result.push({ id, messages: sortedMessages, latest });
      }
    });

    return result.sort(
      (a, b) =>
        new Date(b.latest.updated_at).getTime() -
        new Date(a.latest.updated_at).getTime()
    );
  }, [messages]);

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();

    return conversations.filter((conversation) => {
      const latest = conversation.latest;

      const matchesSearch =
        !term ||
        conversation.id.toLowerCase().includes(term) ||
        latest.user_id.toLowerCase().includes(term) ||
        (latest.subject ?? "").toLowerCase().includes(term) ||
        conversation.messages.some((message) =>
          message.message.toLowerCase().includes(term)
        );

      const hasAssignment = conversation.messages.some((message) =>
        Boolean(message.assigned_agent_id)
      );

      const hasReferral = conversation.messages.some(
        (message) => message.referred_to_admin
      );

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "referred" && hasReferral) ||
        (statusFilter === "assigned" && hasAssignment) ||
        (statusFilter === "unassigned" && !hasAssignment) ||
        (statusFilter === "open" &&
          !["closed", "resolved"].includes(
            latest.status.toLowerCase()
          ));

      return matchesSearch && matchesStatus;
    });
  }, [conversations, search, statusFilter]);

  const activeAgents = agents.filter(
    (agent) => agent.is_active
  ).length;

  const selected = filteredConversations.find(
    (conversation) => conversation.id === selectedConversation
  );

  function assignedAgentNames(conversation: Conversation): string {
    const ids = Array.from(
      new Set(
        conversation.messages
          .map((message) => message.assigned_agent_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    if (ids.length === 0) return "Unassigned";

    return ids
      .map(
        (id) =>
          agents.find((agent) => agent.id === id)?.display_name ??
          "Agent record not found"
      )
      .join(", ");
  }

  function clearBranchForm() {
    setCompanyId("");
    setBranchName("");
    setBranchCode("");
    setBranchLocation("");
    setBranchManager("");
    setBranchNotice("");
  }

  function prepareBranchForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Intentionally no API or database call.
    setBranchNotice(
      "The form is displayed correctly, but saving is not enabled. No branch has been created and no data has been sent to the database."
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-2xl bg-blue-900 p-6 text-white shadow">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
            BEST SALES GHANA
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Support Centre
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-blue-100">
            Administrator workspace for customer conversations,
            agent monitoring, branch setup and management tools.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href="/admin"
              className="rounded-lg border border-blue-200/40 px-4 py-2 text-sm font-semibold hover:bg-blue-800"
            >
              ← Admin dashboard
            </a>

            <button
              type="button"
              onClick={() => void loadInbox(true)}
              disabled={loading || refreshing}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50 disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh inbox"}
            </button>
          </div>
        </header>

        {error && (
          <section
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
            role="alert"
          >
            <h2 className="font-bold">
              Support Centre could not load
            </h2>
            <p className="mt-1 text-sm">{error}</p>
            <button
              type="button"
              onClick={() => void loadInbox(true)}
              className="mt-3 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold hover:bg-red-100"
            >
              Try again
            </button>
          </section>
        )}

        {/* Overview */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Conversations loaded
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "—" : conversations.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Messages loaded</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "—" : messages.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Maximum 200 messages per refresh
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Active support agents
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "—" : activeAgents}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {loading ? "" : `${agents.length} agent records`}
            </p>
          </div>
        </section>

        {/* Branch Management */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">
                Company administration
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Branch Management
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Prepare branch details as the company expands.
              </p>
            </div>

            <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Setup only
            </span>
          </div>

          <form
            onSubmit={prepareBranchForm}
            className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label htmlFor="company-id" className={labelClass}>
                Company ID
              </label>
              <input
                id="company-id"
                value={companyId}
                onChange={(event) => setCompanyId(event.target.value)}
                placeholder="Enter company ID"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="branch-name" className={labelClass}>
                Branch name
              </label>
              <input
                id="branch-name"
                value={branchName}
                onChange={(event) => setBranchName(event.target.value)}
                placeholder="Enter branch name"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="branch-code" className={labelClass}>
                Branch code
              </label>
              <input
                id="branch-code"
                value={branchCode}
                onChange={(event) => setBranchCode(event.target.value)}
                placeholder="Enter branch code"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="branch-location" className={labelClass}>
                Branch location
              </label>
              <input
                id="branch-location"
                value={branchLocation}
                onChange={(event) =>
                  setBranchLocation(event.target.value)
                }
                placeholder="Enter town or full address"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="branch-manager" className={labelClass}>
                Branch manager
              </label>
              <input
                id="branch-manager"
                value={branchManager}
                onChange={(event) =>
                  setBranchManager(event.target.value)
                }
                placeholder="Enter manager name when appointed"
                className={inputClass}
              />
            </div>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Prepare branch
              </button>

              <button
                type="button"
                onClick={clearBranchForm}
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear fields
              </button>
            </div>

            {branchNotice && (
              <p
                role="status"
                className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900 sm:col-span-2"
              >
                {branchNotice}
              </p>
            )}
          </form>

          <SetupNotice>
            This form is not connected to the database yet. Submitting
            it does not create or save a branch. The fields are blank
            each time the page is opened.
          </SetupNotice>
        </section>

        {/* Staff and Department Management */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-900">
            Staff and Department Management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Planned tools for adding staff, assigning company and staff
            IDs, and creating departments without editing code.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                title: "Staff registration",
                description: "Staff details, job titles and branch membership.",
              },
              {
                title: "Staff ID generator",
                description: "Prepare unique staff identifiers and login setup.",
              },
              {
                title: "Department management",
                description: "Create and maintain company departments.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 p-4"
              >
                <h3 className="font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-5 text-slate-600">
                  {item.description}
                </p>
                <span className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Not connected
                </span>
              </div>
            ))}
          </div>

          <SetupNotice>
            Staff creation and department changes require protected
            server APIs, permission checks and database integration.
            Existing staff records will not be changed by this page.
          </SetupNotice>
        </section>

        {/* Support and Delivery Assignments */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-900">
            Support and Delivery Assignments
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            A future management area for assigning customer conversations
            and delivery tasks to authorised staff.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">
                Customer support assignments
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Assign conversations to support agents and track their
                status.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">
                Delivery assignments
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Allocate deliveries to branches and authorised staff.
              </p>
            </div>
          </div>

          <SetupNotice>
            Assignment controls are not active. This version does not
            modify support messages, agent assignments or delivery
            records.
          </SetupNotice>
        </section>

        {/* Monitoring and Audit */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-900">
            Monitoring and Audit Records
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Planned administrator view for tracking changes, assignments
            and important staff actions.
          </p>

          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-5">
            <p className="font-semibold text-slate-800">
              Audit history integration pending
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The existing support inbox remains available below.
              Connecting audit records will require a protected API
              that reads the existing audit table and checks administrator
              permissions.
            </p>
          </div>
        </section>

        {/* Customer Conversations */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Customer conversations
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Select a conversation to inspect its messages.
              </p>
            </div>

            {lastUpdated && (
              <p className="text-xs text-slate-500">
                Last refreshed: {lastUpdated}
              </p>
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search messages, subjects or IDs"
              aria-label="Search conversations"
              className={`${inputClass} sm:col-span-2`}
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter conversations"
              className={inputClass}
            >
              <option value="all">All conversations</option>
              <option value="open">Not closed/resolved</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
              <option value="referred">Referred to admin</option>
            </select>
          </div>

          {loading ? (
            <p className="py-10 text-center text-slate-500">
              Loading customer conversations...
            </p>
          ) : filteredConversations.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <h3 className="font-semibold text-slate-800">
                No conversations found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                There may be no messages in the latest 200 records,
                or your current search/filter has no matches.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredConversations.map((conversation) => {
                const latest = conversation.latest;
                const referred = conversation.messages.some(
                  (message) => message.referred_to_admin
                );

                return (
                  <button
                    type="button"
                    key={conversation.id}
                    onClick={() =>
                      setSelectedConversation(conversation.id)
                    }
                    className={`min-w-0 rounded-xl border p-4 text-left transition hover:border-blue-400 hover:bg-blue-50/40 ${
                      selectedConversation === conversation.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <span className="break-all text-xs font-semibold text-blue-800">
                        Conversation {conversation.id.slice(0, 8)}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {displayStatus(latest.status)}
                      </span>
                    </div>

                    <h3 className="mt-3 break-words font-bold text-slate-900">
                      {latest.subject || "Customer support request"}
                    </h3>

                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-sm text-slate-600">
                      {latest.message}
                    </p>

                    <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <p>Customer ID: {latest.user_id}</p>
                      <p>Messages: {conversation.messages.length}</p>
                      <p>
                        Assigned: {assignedAgentNames(conversation)}
                      </p>
                      <p>Updated: {formatDate(latest.updated_at)}</p>

                      {referred && (
                        <p className="font-semibold text-amber-700">
                          Referred to administrator
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Support Agents */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-900">
            Support agents
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Read-only view of existing support agent records.
          </p>

          {loading ? (
            <p className="mt-4 text-sm text-slate-500">
              Loading agent records...
            </p>
          ) : agents.length === 0 ? (
            <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              No support agent records were returned.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {agent.display_name}
                    </h3>

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        agent.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {agent.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    Slot: {agent.slot_number ?? "Not numbered"}
                  </p>

                  <p className="mt-1 break-all text-xs text-slate-500">
                    Agent record: {agent.id}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Conversation Details */}
        {selected && (
          <section className="mt-6 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Conversation details
                </h2>
                <p className="mt-1 break-all text-xs text-slate-500">
                  {selected.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedConversation("")}
                className="self-start rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Close details
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {selected.messages.map((message) => (
                <article
                  key={message.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-semibold text-slate-900">
                      {displayStatus(message.sender_role)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(message.created_at)}
                    </p>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                    {message.message}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>
                      Status: {displayStatus(message.status)}
                    </span>

                    {message.referred_to_admin && (
                      <span className="font-semibold text-amber-700">
                        Referred to admin
                      </span>
                    )}

                    {message.assigned_agent_id && (
                      <span>
                        Agent:{" "}
                        {agents.find(
                          (agent) =>
                            agent.id === message.assigned_agent_id
                        )?.display_name ?? "Agent record not found"}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <SetupNotice>
              This view is read-only. Replying, assigning agents,
              changing statuses and escalating conversations require
              separate server-side permission checks.
            </SetupNotice>
          </section>
        )}

        <footer className="mt-8 pb-6 text-center text-xs text-slate-500">
          BEST SALES GHANA Support Centre · Administrator view
        </footer>
      </div>
    </main>
  );
}
