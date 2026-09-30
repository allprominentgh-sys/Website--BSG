
"use client";

import Link from "next/link";
import { useState } from "react";

type RefundStatus = "Pending" | "Approved" | "Rejected";

type RefundRequest = {
  id: string;
  customer: string;
  orderNumber: string;
  product: string;
  amount: number;
  reason: string;
  date: string;
  status: RefundStatus;
};

const initialRequests: RefundRequest[] = [
  {
    id: "RF-001",
    customer: "Sample Customer",
    orderNumber: "BSG-1001",
    product: "Sample Product",
    amount: 250,
    reason: "Product received damaged",
    date: "2026-09-30",
    status: "Pending",
  },
];

export default function RefundPolicyPage() {
  const [policyTitle, setPolicyTitle] = useState(
    "Best Sales Ghana Refund Policy"
  );

  const [policyText, setPolicyText] = useState(
    `Best Sales Ghana is committed to providing a fair and transparent shopping experience.

1. Refund Eligibility
Customers may request a refund if an item is damaged, defective, incorrect, or materially different from its description.

2. Reporting Period
Customers should report an issue as soon as possible after receiving their order. The applicable reporting period will depend on the product and the circumstances of the claim.

3. Evidence
Customers may be asked to provide photographs, videos, order details, or other relevant evidence to support a refund request.

4. Review Process
Every refund request will be reviewed by the customer service team. Approval depends on the facts of the case, the applicable product terms, and the platform's policies.

5. Refund Method
Approved refunds will generally be returned through the original payment method where possible. Alternative arrangements may be agreed with the customer.

6. Exclusions
Refunds may not be available for change-of-mind requests, misuse, unauthorized alterations, or cases where the customer has not met the applicable return conditions.

7. Marketplace Sellers
For marketplace purchases, Best Sales Ghana may coordinate with the seller and customer to resolve the issue in accordance with the platform's policies.

8. Disputes
Customers who disagree with a refund decision may contact Best Sales Ghana Customer Service for further review.

9. Policy Updates
Best Sales Ghana may update this policy when necessary. Any material changes should be communicated through the website.`
  );

  const [requests, setRequests] =
    useState<RefundRequest[]>(initialRequests);

  const [editingPolicy, setEditingPolicy] = useState(false);
  const [message, setMessage] = useState("");

  function updateRequestStatus(
    requestId: string,
    status: RefundStatus
  ) {
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? { ...request, status }
          : request
      )
    );

    setMessage(
      `Request ${requestId} marked as ${status.toLowerCase()}.`
    );
  }

  function handleSavePolicy() {
    setEditingPolicy(false);
    setMessage(
      "Policy changes are currently held in page state. Database saving will be enabled after Supabase integration."
    );
  }

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "Approved"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "Rejected"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link
              href="/admin"
              className="text-sm font-bold text-blue-700 hover:text-blue-900"
            >
              ← Back to Admin Dashboard
            </Link>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Refund Policy Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Best Sales Ghana Administration Portal
            </p>
          </div>

          <Link
            href="/admin/support"
            className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            Customer Service →
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* INTRODUCTION */}
        <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-900 to-cyan-600 p-7 text-white shadow-lg sm:p-9">
          <p className="text-sm font-black uppercase tracking-widest text-cyan-100">
            Customer Protection
          </p>

          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Refunds & Returns
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-white/85">
            Manage refund conditions, review customer claims,
            and maintain a transparent process for resolving
            disputes involving direct sales and marketplace orders.
          </p>
        </section>

        {/* SUMMARY */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              Total Requests
            </p>
            <p className="mt-3 text-3xl font-black">
              {requests.length}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-sm font-bold text-amber-700">
              Pending Review
            </p>
            <p className="mt-3 text-3xl font-black text-amber-900">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
            <p className="text-sm font-bold text-green-700">
              Approved
            </p>
            <p className="mt-3 text-3xl font-black text-green-900">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-bold text-red-700">
              Rejected
            </p>
            <p className="mt-3 text-3xl font-black text-red-900">
              {rejectedCount}
            </p>
          </div>
        </section>

        {/* FEEDBACK MESSAGE */}
        {message && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-900">
            {message}
          </div>
        )}

        {/* POLICY EDITOR */}
        <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                Policy Configuration
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Refund Policy Document
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review and edit the proposed refund conditions.
              </p>
            </div>

            {!editingPolicy && (
              <button
                type="button"
                onClick={() => {
                  setEditingPolicy(true);
                  setMessage("");
                }}
                className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
              >
                Edit Policy
              </button>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <label
              htmlFor="policy-title"
              className="mb-2 block text-sm font-black text-slate-700"
            >
              Policy Title
            </label>

            <input
              id="policy-title"
              type="text"
              value={policyTitle}
              onChange={(event) =>
                setPolicyTitle(event.target.value)
              }
              disabled={!editingPolicy}
              className="mb-5 w-full rounded-xl border border-slate-300 px-4 py-3 font-bold outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-600"
            />

            <label
              htmlFor="policy-content"
              className="mb-2 block text-sm font-black text-slate-700"
            >
              Policy Conditions
            </label>

            <textarea
              id="policy-content"
              value={policyText}
              onChange={(event) =>
                setPolicyText(event.target.value)
              }
              disabled={!editingPolicy}
              rows={22}
              className="w-full rounded-xl border border-slate-300 px-4 py-4 text-sm leading-7 outline-none focus:border-blue-600 disabled:bg-slate-50 disabled:text-slate-700"
            />

            {editingPolicy && (
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSavePolicy}
                  className="rounded-xl bg-green-600 px-6 py-3 font-black text-white transition hover:bg-green-700"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingPolicy(false);
                    setMessage("Editing cancelled.");
                  }}
                  className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm leading-6 text-amber-900">
                <strong>Important:</strong> Have the final policy
                reviewed for compliance with applicable Ghanaian
                consumer protection requirements before publishing
                it as an official company policy.
              </p>
            </div>
          </div>
        </section>

        {/* REFUND REQUESTS */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <p className="text-xs font-black uppercase tracking-widest text-blue-700">
              Customer Claims
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Refund Requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review refund claims and update their status.
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-5xl">📭</div>

              <h3 className="mt-4 text-lg font-black">
                No refund requests
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Customer refund requests will appear here once
                the request system is connected.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Request</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Order / Product</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Reason</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-black">
                        {request.id}
                      </td>

                      <td className="px-5 py-4">
                        {request.customer}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold">
                          {request.orderNumber}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {request.product}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-black">
                        GH₵{request.amount.toLocaleString("en-GH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="max-w-[200px] px-5 py-4">
                        {request.reason}
                      </td>

                      <td className="px-5 py-4">
                        {request.date}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            request.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : request.status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {request.status === "Pending" ? (
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateRequestStatus(
                                  request.id,
                                  "Approved"
                                )
                              }
                              className="rounded-lg bg-green-600 px-3 py-2 text-xs font-black text-white hover:bg-green-700"
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateRequestStatus(
                                  request.id,
                                  "Rejected"
                                )
                              }
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-black text-white hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">
                            Reviewed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-10 border-t border-slate-200 py-6 text-center">
          <p className="font-black text-slate-700">
            BEST SALES GHANA — REFUND MANAGEMENT
          </p>

          <p className="mt-2 text-sm text-slate-500">
            © {new Date().getFullYear()} All Prominent Ghana Limited.
            All rights reserved.
          </p>

          <Link
            href="/admin"
            className="mt-4 inline-block font-bold text-blue-700 hover:text-blue-900"
          >
            Return to Admin Dashboard
          </Link>
        </footer>
      </div>
    </main>
  );
}
