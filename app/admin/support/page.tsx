
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";

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

type ManagementOption = {
  label: string;
  target: string;
};

type ManagementCard = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  options: ManagementOption[];
};

const inputClass =
  "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100";

const labelClass =
  "mb-1 block text-sm font-semibold text-slate-700";

const navigationCards: ManagementCard[] = [
  {
    id: "administrator-controls",
    title: "Administrator Controls",
    description: "Administration and access oversight",
    icon: "🛡️",
    color: "border-blue-200 bg-blue-50",
    options: [
      { label: "Administrator session", target: "administrator-controls" },
      { label: "Access permissions", target: "administrator-controls" },
      { label: "Company settings", target: "administrator-controls" },
    ],
  },
  {
    id: "branch-management",
    title: "Branch Management",
    description: "Company IDs, branches and locations",
    icon: "🏢",
    color: "border-sky-200 bg-sky-50",
    options: [
      { label: "Add a branch", target: "branch-management" },
      { label: "Branch details", target: "branch-management" },
      { label: "Branch manager", target: "branch-management" },
    ],
  },
  {
    id: "staff-departments",
    title: "Staff & Departments",
    description: "Staff registration and department setup",
    icon: "👥",
    color: "border-indigo-200 bg-indigo-50",
    options: [
      { label: "Staff registration", target: "staff-departments" },
      { label: "Staff ID generator", target: "staff-departments" },
      { label: "Manage departments", target: "staff-departments" },
    ],
  },
  {
    id: "support-delivery",
    title: "Support & Delivery",
    description: "Support and delivery assignments",
    icon: "🚚",
    color: "border-cyan-200 bg-cyan-50",
    options: [
      { label: "Support assignments", target: "support-delivery" },
      { label: "Delivery assignments", target: "support-delivery" },
      { label: "Track assignments", target: "support-delivery" },
    ],
  },
  {
    id: "customer-support",
    title: "Customer Support",
    description: "Customer conversations and agents",
    icon: "💬",
    color: "border-blue-200 bg-blue-50",
    options: [
      { label: "View conversations", target: "customer-support" },
      { label: "Monitor support agents", target: "customer-support" },
      { label: "Search messages", target: "customer-support" },
    ],
  },
  {
    id: "audit-monitoring",
    title: "Audit & Monitoring",
    description: "Activity and administrative records",
    icon: "📋",
    color: "border-slate-200 bg-slate-50",
    options: [
      { label: "Activity records", target: "audit-monitoring" },
      { label: "Assignment history", target: "audit-monitoring" },
      { label: "Administrative changes", target: "audit-monitoring" },
    ],
  },
];

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

function SetupNotice({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-900">
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

  // Branch form fields intentionally start blank.
  // This UI-only version does not save data to Supabase.
  const [companyId, setCompanyId] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchLocation, setBranchLocation] = useState("");
  const [branchManager, setBranchManager] = useState("");
  const [branchNotice, setBranchNotice] = useState("");

  const loadInbox = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

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

  function prepareBranchForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setBranchNotice(
      "Preview only. No branch has been created or saved. Database integration is not enabled."
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Page header */}
        <header className="rounded-2xl bg-blue-900 p-6 text-white shadow">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
            BEST SALES GHANA
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Support Centre
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-blue-100">
            Administration, branch setup, staff planning and customer
            support in one workspace.
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

        {/* Six cards, each with its own options */}
        <section className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Management Dashboard
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose an option inside a card to open its section.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {navigationCards.map((card) => (
              <div
                key={card.id}
                className={`rounded-2xl border p-5 shadow-sm ${card.color}`}
              >
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className="text-3xl">
                    {card.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-slate-600">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-200/80 pt-3">
                  {card.options.map((option) => (
                    <a
                      key={option.label}
                      href={`#${option.target}`}
                      className="flex items-center justify-between gap-2 rounded-lg bg-white/90 px-3 py-3 text-sm font-medium text-blue-900 transition hover:bg-white hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span>{option.label}</span>
                      <span aria-hidden="true">→</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

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

        {/* Administrator Controls */}
        <section
          id="administrator-controls"
          className="mt-6 scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="text-xl font-bold text-slate-900">
            Administrator Controls
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Administrator access and oversight.
          </p>
          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <p className="font-semibold">Administrator session</p>
            <p className="mt-1 text-sm text-slate-600">
              The existing inbox API verifies administrator access.
              Additional management permissions must be enforced on the
              server before administrative changes are enabled.
            </p>
          </div>
        </section>

        {/* Branch Management */}
        <section
          id="branch-management"
          className="mt-6 scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="text-xl font-bold text-slate-900">
            Branch Management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Branch fields are blank and ready for future setup.
          </p>

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
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold hover:bg-slate-50"
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
            This form is UI-only. Submitting it does not create or save a
            branch. Database integration is not enabled.
          </SetupNotice>
        </section>

        {/* Staff and Departments */}
        <section
          id="staff-departments"
          className="mt-6 scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="text-xl font-bold text-slate-900">
            Staff & Departments
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                title: "Staff registration",
                description:
                  "Staff details, job titles and branch membership.",
              },
              {
                title: "Staff ID generator",
                description:
                  "Prepare unique staff identifiers and login setup.",
              },
              {
                title: "Department management",
                description:
                  "Create and maintain departments as the company grows.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 p-4"
              >
                <h3 className="font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {item.description}
                </p>
                <span className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Not connected
                </span>
              </div>
            ))}
          </div>

          <SetupNotice>
            Staff and department changes require protected server APIs
            and database integration.
          </SetupNotice>
        </section>

        {/* Support and Delivery */}
        <section
          id="support-delivery"
          className="mt-6 scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="text-xl font-bold text-slate-900">
            Support & Delivery Assignments
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">
                Customer support assignments
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Assign conversations to support agents and track status.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">
                Delivery assignments
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Plan delivery allocations for branches and authorised staff.
              </p>
            </div>
          </div>

          <SetupNotice>
            Assignment controls are not active. This page does not modify
            support-message assignments or delivery records.
          </SetupNotice>
        </section>

        {/* Customer Support */}
        <section
          id="customer-support"
          className="mt-6 scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Customer Support
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Customer conversations and support agents.
              </p>
            </div>

            {lastUpdated && (
              <p className="text-xs text-slate-500">
                Last refreshed: {lastUpdated}
              </p>
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Conversations loaded
              </p>
              <p className="mt-1 text-2xl font-bold">
                {loading ? "—" : conversations.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Messages loaded</p>
              <p className="mt-1 text-2xl font-bold">
                {loading ? "—" : messages.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Maximum 200 per refresh
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Active agents</p>
              <p className="mt-1 text-2xl font-bold">
                {loading ? "—" : activeAgents}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {loading ? "" : `${agents.length} agent records`}
              </p>
            </div>
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
                No messages matched the current search or filter.
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
                      <p>Assigned: {assignedAgentNames(conversation)}</p>
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

          <div className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="text-lg font-bold text-slate-900">
              Support agents
            </h3>

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
                      <h4 className="font-semibold text-slate-900">
                        {agent.display_name}
                      </h4>
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
          </div>
        </section>

        {/* Conversation Details */}
        {selected && (
          <section className="mt-6 scroll-mt-6 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6">
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
                    <span>Status: {displayStatus(message.status)}</span>

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
              This view is read-only. Replying, assigning agents, changing
              statuses and escalating conversations require separate
              server-side permission checks.
            </SetupNotice>
          </section>
        )}

        {/* Audit and Monitoring */}
        <section
          id="audit-monitoring"
          className="mt-6 scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="text-xl font-bold text-slate-900">
            Audit & Monitoring
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review area for administrative actions and assignment history.
          </p>

          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-5">
            <p className="font-semibold text-slate-800">
              Audit history integration pending
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Connect audit records through a protected administrator API
              before displaying live audit history.
            </p>
          </div>
        </section>

        <footer className="mt-8 pb-6 text-center text-xs text-slate-500">
          BEST SALES GHANA Support Centre · Administrator view
        </footer>
      </div>
    </main>
  );
}
