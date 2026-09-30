
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
type Priority = "Low" | "Medium" | "High" | "Urgent";

type SupportTicket = {
  id: string;
  customer: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  date: string;
  status: TicketStatus;
  priority: Priority;
  reply: string;
};

const initialTickets: SupportTicket[] = [
  {
    id: "BSG-1001",
    customer: "Kwame Mensah",
    email: "kwame@example.com",
    subject: "Payment made but order not confirmed",
    category: "Payment",
    message:
      "I made payment for my order, but my dashboard still shows that payment is pending. Please help me confirm the transaction.",
    date: "2026-09-28",
    status: "Open",
    priority: "High",
    reply: "",
  },
  {
    id: "BSG-1002",
    customer: "Ama Owusu",
    email: "ama@example.com",
    subject: "Request for refund",
    category: "Refund",
    message:
      "The product I received is different from what I ordered. I would like to request a refund.",
    date: "2026-09-27",
    status: "In Progress",
    priority: "Urgent",
    reply: "",
  },
  {
    id: "BSG-1003",
    customer: "Daniel Boateng",
    email: "daniel@example.com",
    subject: "Unable to upload product",
    category: "Technical",
    message:
      "I am a seller on BestSalesGH. Whenever I try to upload a product, the page stops responding.",
    date: "2026-09-26",
    status: "Resolved",
    priority: "Medium",
    reply: "Thank you for reporting this. The issue has been resolved.",
  },
];

const statusStyles: Record<TicketStatus, string> = {
  Open: "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-600",
};

const priorityStyles: Record<Priority, string> = {
  Low: "bg-gray-100 text-gray-600",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [notice, setNotice] = useState("");

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.customer.toLowerCase().includes(search.toLowerCase()) ||
        ticket.email.toLowerCase().includes(search.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
        ticket.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  const openCount = tickets.filter((ticket) => ticket.status === "Open").length;
  const progressCount = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;
  const resolvedCount = tickets.filter(
    (ticket) => ticket.status === "Resolved"
  ).length;
  const urgentCount = tickets.filter(
    (ticket) =>
      ticket.priority === "Urgent" &&
      ticket.status !== "Resolved" &&
      ticket.status !== "Closed"
  ).length;

  function updateTicket(
    id: string,
    updates: Partial<SupportTicket>
  ) {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === id ? { ...ticket, ...updates } : ticket
      )
    );
  }

  function sendReply() {
    if (!selectedTicket || !replyText.trim()) return;

    updateTicket(selectedTicket.id, {
      reply: replyText.trim(),
      status: "In Progress",
    });

    setReplyText("");
    setNotice("Reply saved in this preview.");
  }

  function changeStatus(status: TicketStatus) {
    if (!selectedTicket) return;

    updateTicket(selectedTicket.id, { status });
    setNotice(`Ticket marked as ${status}.`);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/admin"
              className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Customer Service
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage customer enquiries, complaints, and support requests.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/refund-policy"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Refund Policy
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Open Tickets</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">
              {openCount}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Awaiting attention
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {progressCount}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Currently being handled
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {resolvedCount}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Successfully handled
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Urgent Tickets</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {urgentCount}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Require priority attention
            </p>
          </div>
        </div>

        {/* Tickets */}
        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Support Tickets</h2>
              <p className="text-sm text-gray-500">
                {filteredTickets.length} ticket(s) found
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tickets..."
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 sm:w-64"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Ticket</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Subject</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-semibold text-blue-700">
                      {ticket.id}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium">{ticket.customer}</p>
                      <p className="text-xs text-gray-500">{ticket.email}</p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-xs text-gray-500">
                        {ticket.category}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${priorityStyles[ticket.priority]}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[ticket.status]}`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {ticket.date}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => {
                          setSelectedId(ticket.id);
                          setReplyText("");
                          setNotice("");
                        }}
                        className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800"
                      >
                        View Ticket
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTickets.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-gray-500"
                    >
                      No support tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Ticket Details */}
        {selectedTicket && (
          <section className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {selectedTicket.id}
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  {selectedTicket.subject}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  From {selectedTicket.customer} ({selectedTicket.email})
                </p>
              </div>

              <button
                onClick={() => setSelectedId(null)}
                className="self-start rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Close Details
              </button>
            </div>

            <div className="grid gap-4 py-5 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="mt-1 font-medium">
                  {selectedTicket.category}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Priority</p>
                <p className="mt-1 font-medium">
                  {selectedTicket.priority}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Current Status</p>
                <p className="mt-1 font-medium">
                  {selectedTicket.status}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 text-sm font-semibold">
                Customer Message
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {selectedTicket.message}
              </p>
            </div>

            {selectedTicket.reply && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-green-800">
                  Saved Reply
                </h3>
                <p className="whitespace-pre-wrap text-sm text-green-900">
                  {selectedTicket.reply}
                </p>
              </div>
            )}

            <div className="mt-5">
              <label
                htmlFor="support-reply"
                className="mb-2 block text-sm font-semibold"
              >
                Reply to Customer
              </label>

              <textarea
                id="support-reply"
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                rows={5}
                placeholder="Write your response here..."
                className="w-full rounded-lg border p-3 text-sm outline-none focus:border-blue-500"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={sendReply}
                  disabled={!replyText.trim()}
                  className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save Reply
                </button>

                <button
                  onClick={() => changeStatus("In Progress")}
                  className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
                >
                  Mark In Progress
                </button>

                <button
                  onClick={() => changeStatus("Resolved")}
                  className="rounded-lg border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                >
                  Mark Resolved
                </button>

                <button
                  onClick={() => changeStatus("Closed")}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Close Ticket
                </button>
              </div>

              {notice && (
                <p className="mt-3 text-sm text-green-700">{notice}</p>
              )}
            </div>
          </section>
        )}

        <p className="text-center text-xs text-gray-400">
          BestSalesGH Admin Support
        </p>
      </div>
    </main>
  );
}
