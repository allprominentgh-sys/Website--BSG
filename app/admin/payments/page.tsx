
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Payment = {
  id?: string | number;
  reference?: string;
  payment_reference?: string;
  order_id?: string;
  customer_email?: string;
  seller_name?: string;
  amount?: number | string;
  currency?: string;
  currency_code?: string;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  created_at?: string;
};

function money(amount: number | string | undefined, currency: string) {
  const value = Number(amount ?? 0);

  if (!Number.isFinite(value)) return "—";

  try {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function statusStyle(status: string) {
  const value = status.toLowerCase();

  if (["success", "successful", "paid", "completed"].includes(value)) {
    return "bg-green-100 text-green-800";
  }

  if (["pending", "processing"].includes(value)) {
    return "bg-amber-100 text-amber-800";
  }

  if (["failed", "cancelled", "canceled", "abandoned"].includes(value)) {
    return "bg-red-100 text-red-800";
  }

  return "bg-slate-100 text-slate-700";
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/payments", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });

      const data = await response.json();

      if (!response.ok || data.success !== true) {
        throw new Error(
          data.message || "Could not load payment records."
        );
      }

      setPayments(Array.isArray(data.payments) ? data.payments : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load payments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const filteredPayments = payments.filter((payment) => {
    const status = String(
      payment.payment_status ?? payment.status ?? "unknown"
    ).toLowerCase();

    const reference = String(
      payment.payment_reference ?? payment.reference ?? ""
    ).toLowerCase();

    const query = search.toLowerCase();

    const matchesSearch =
      reference.includes(query) ||
      String(payment.order_id ?? "").toLowerCase().includes(query) ||
      String(payment.customer_email ?? "").toLowerCase().includes(query) ||
      String(payment.seller_name ?? "").toLowerCase().includes(query);

    const matchesFilter =
      filter === "all" ||
      (filter === "success" &&
        ["success", "successful", "paid", "completed"].includes(status)) ||
      (filter === "pending" &&
        ["pending", "processing"].includes(status)) ||
      (filter === "failed" &&
        ["failed", "cancelled", "canceled", "abandoned"].includes(status));

    return matchesSearch && matchesFilter;
  });

  const successfulPayments = payments.filter((payment) =>
    ["success", "successful", "paid", "completed"].includes(
      String(payment.payment_status ?? payment.status ?? "").toLowerCase()
    )
  );

  const totalVerified = successfulPayments.reduce(
    (sum, payment) => sum + Number(payment.amount ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4">
          <div>
            <Link
              href="/admin"
              className="text-sm font-bold text-blue-700 hover:underline"
            >
              ← Admin dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Payments
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Monitor customer payments and Paystack transaction records.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadPayments()}
            disabled={loading}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        {error && (
          <section
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p className="font-bold">Payment records could not be loaded.</p>
            <p className="mt-1">{error}</p>
            <p className="mt-2">
              The page is available, but the payment API or database may
              need configuration. No sample transactions are being shown.
            </p>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Verified successful payments
            </p>
            <p className="mt-2 text-2xl font-black">
              {loading ? "…" : successfulPayments.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Based on records returned by the payment API.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Successful payment amount
            </p>
            <p className="mt-2 text-2xl font-black">
              {loading ? "…" : money(totalVerified, "GHS")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Assumes returned amounts are stored in Ghana cedis.
              Confirm the API's amount and currency conventions before
              relying on this total.
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-black">Transaction records</h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredPayments.length} record(s) displayed
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reference, order, customer…"
                aria-label="Search payment records"
                className="min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-72"
              />

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter payment status"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="all">All statuses</option>
                <option value="success">Successful</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed / cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading payment records…
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl">💳</div>
              <p className="mt-3 font-bold">No payment records to display</p>
              <p className="mt-1 text-sm text-slate-500">
                Try another search or filter, or check that the payment API
                is connected to your verified database records.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((payment, index) => {
                    const status = String(
                      payment.payment_status ??
                        payment.status ??
                        "unknown"
                    );

                    const reference =
                      payment.payment_reference ??
                      payment.reference ??
                      "—";

                    const currency = String(
                      payment.currency_code ?? payment.currency ?? "GHS"
                    ).toUpperCase();

                    return (
                      <tr
                        key={String(payment.id ?? reference ?? index)}
                        className="hover:bg-slate-50"
                      >
                        <td className="max-w-52 break-all px-4 py-4 font-semibold">
                          {reference}
                        </td>
                        <td className="px-4 py-4">
                          {payment.order_id ?? "—"}
                        </td>
                        <td className="px-4 py-4">
                          {payment.customer_email ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 font-bold">
                          {money(payment.amount, currency)}
                        </td>
                        <td className="px-4 py-4">
                          {payment.payment_method ?? "Paystack"}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle(status)}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                          {payment.created_at
                            ? new Date(payment.created_at).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-xs leading-5 text-slate-500">
          This page is read-only. It does not initiate refunds, transfer
          seller funds, or mark transactions as paid. Those actions require
          secure server-side workflows and verified payment records.
        </p>
      </div>
    </main>
  );
}
