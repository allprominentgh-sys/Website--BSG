
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/supabase-browser";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  verified: boolean | null;
  created_at: string | null;
  account_type: string | null;
  verification_status: string | null;
  delivery_region: string | null;
  delivery_city: string | null;
  delivery_area: string | null;
  delivery_address: string | null;
  ghana_post_gps: string | null;
};

type CustomerOrder = {
  id: string;
  user_id: string;
  order_number: string | null;
  product_name: string | null;
  order_type: string | null;
  quantity: number | null;
  total_amount: number | null;
  amount_paid: number | null;
  amount_remaining: number | null;
  status: string | null;
  created_at: string | null;
  delivery_address: string | null;
};

const CUSTOMER_TYPES = ["buyer", "customer"];

function money(value: number | null | undefined) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function dateLabel(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function statusClass(status: string | null | undefined) {
  const value = (status ?? "").toLowerCase();

  if (
    value.includes("complete") ||
    value.includes("deliver") ||
    value.includes("paid") ||
    value.includes("approved")
  ) {
    return "bg-green-100 text-green-800";
  }

  if (
    value.includes("cancel") ||
    value.includes("reject") ||
    value.includes("fail")
  ) {
    return "bg-red-100 text-red-800";
  }

  return "bg-amber-100 text-amber-800";
}

export default function AdminCustomersPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] =
    useState<Profile | null>(null);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        setAuthenticated(false);
        return;
      }

      const result = await response.json();
      setAuthenticated(result.authenticated === true);
    } catch {
      setAuthenticated(false);
    } finally {
      setCheckingSession(false);
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [profilesResult, ordersResult] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id,full_name,phone,location,avatar_url,verified,created_at,account_type,verification_status,delivery_region,delivery_city,delivery_area,delivery_address,ghana_post_gps"
          )
          .order("created_at", { ascending: false })
          .limit(1000),

        supabase
          .from("orders")
          .select(
            "id,user_id,order_number,product_name,order_type,quantity,total_amount,amount_paid,amount_remaining,status,created_at,delivery_address"
          )
          .order("created_at", { ascending: false })
          .limit(5000),
      ]);

      if (profilesResult.error) {
        throw new Error(profilesResult.error.message);
      }

      if (ordersResult.error) {
        throw new Error(
          "Customer profiles loaded, but orders could not be loaded: " +
            ordersResult.error.message
        );
      }

      const customerProfiles = (profilesResult.data ?? []) as Profile[];
      const customerOrders = (ordersResult.data ?? []) as CustomerOrder[];

      setProfiles(
        customerProfiles.filter((profile) =>
          CUSTOMER_TYPES.includes(
            (profile.account_type ?? "").trim().toLowerCase()
          )
        )
      );

      setOrders(customerOrders);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customer records."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (authenticated) {
      void loadCustomers();
    }
  }, [authenticated, loadCustomers]);

  const filteredCustomers = profiles.filter((customer) => {
    const term = search.trim().toLowerCase();

    const matchesSearch =
      !term ||
      (customer.full_name ?? "").toLowerCase().includes(term) ||
      (customer.phone ?? "").toLowerCase().includes(term) ||
      (customer.location ?? "").toLowerCase().includes(term) ||
      customer.id.toLowerCase().includes(term);

    const accountType = (customer.account_type ?? "").toLowerCase();

    const matchesType =
      typeFilter === "all" || accountType === typeFilter;

    return matchesSearch && matchesType;
  });

  function customerOrders(customerId: string) {
    return orders.filter((order) => order.user_id === customerId);
  }

  function totalSpent(customerId: string) {
    return customerOrders(customerId).reduce(
      (total, order) => total + Number(order.amount_paid ?? 0),
      0
    );
  }

  function orderTotal(customerId: string) {
    return customerOrders(customerId).reduce(
      (total, order) => total + Number(order.total_amount ?? 0),
      0
    );
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <p className="text-slate-600">Checking administrator session...</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-xl rounded-xl border bg-white p-6">
          <h1 className="text-xl font-bold text-slate-900">
            Administrator access required
          </h1>
          <p className="mt-2 text-slate-600">
            Sign in through the central BestSalesGH administrator login.
          </p>
          <Link
            href="/admin/login"
            className="mt-4 inline-block rounded-lg bg-blue-800 px-4 py-2 text-white"
          >
            Admin login
          </Link>
        </div>
      </main>
    );
  }

  const selectedOrders = selectedCustomer
    ? customerOrders(selectedCustomer.id)
    : [];

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/admin"
              className="text-sm font-medium text-blue-800 hover:underline"
            >
              ← Admin dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold">Customer Management</h1>
            <p className="mt-1 text-slate-600">
              Review customer accounts and their order activity.
            </p>
          </div>

          <button
            onClick={() => void loadCustomers()}
            disabled={loading}
            className="rounded-lg bg-blue-800 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh data"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-semibold">Unable to complete the data load</p>
            <p className="mt-1 break-words text-sm">{error}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Customer accounts</p>
            <p className="mt-2 text-3xl font-bold">{profiles.length}</p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Verified customers</p>
            <p className="mt-2 text-3xl font-bold">
              {profiles.filter((p) => p.verified === true).length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Customer orders</p>
            <p className="mt-2 text-3xl font-bold">{orders.length}</p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Amount paid on loaded orders</p>
            <p className="mt-2 text-2xl font-bold">
              {money(
                orders.reduce(
                  (sum, order) => sum + Number(order.amount_paid ?? 0),
                  0
                )
              )}
            </p>
          </div>
        </div>

        <section className="rounded-xl border bg-white p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, phone, location or customer ID..."
              className="min-w-0 flex-1 rounded-lg border px-4 py-3 outline-none focus:border-blue-700"
            />

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-lg border bg-white px-4 py-3"
            >
              <option value="all">All customer types</option>
              <option value="buyer">Buyer</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Orders</th>
                  <th className="p-3">Amount paid</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredCustomers.map((customer) => {
                  const count = customerOrders(customer.id).length;

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-semibold">
                          {customer.full_name || "Name not provided"}
                        </p>
                        <p className="max-w-48 truncate text-xs text-slate-500">
                          {customer.id}
                        </p>
                      </td>
                      <td className="p-3">{customer.phone || "—"}</td>
                      <td className="p-3">
                        {[
                          customer.delivery_city,
                          customer.delivery_region,
                          customer.location,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>
                      <td className="p-3">{count}</td>
                      <td className="p-3 font-medium">
                        {money(totalSpent(customer.id))}
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            customer.verified
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {customer.verified ? "Verified" : "Not verified"}
                        </span>
                      </td>
                      <td className="p-3">{dateLabel(customer.created_at)}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="rounded-lg border border-blue-700 px-3 py-2 font-medium text-blue-800 hover:bg-blue-50"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {!loading && filteredCustomers.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-slate-500"
                    >
                      No customer accounts match this search. Check the
                      account_type values if customers are missing.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Showing {filteredCustomers.length} of {profiles.length} customer
            accounts.
          </p>
        </section>

        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
            <section className="my-4 w-full max-w-3xl rounded-2xl bg-white p-5 shadow-xl sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedCustomer.full_name || "Customer details"}
                  </h2>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    Customer ID: {selectedCustomer.id}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-lg border px-3 py-2"
                  aria-label="Close customer details"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="mt-1 font-semibold">
                    {selectedCustomer.phone || "Not provided"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Account type</p>
                  <p className="mt-1 font-semibold">
                    {selectedCustomer.account_type || "Not specified"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Verification status</p>
                  <p className="mt-1 font-semibold">
                    {selectedCustomer.verification_status ||
                      (selectedCustomer.verified ? "Verified" : "Not verified")}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Registration date</p>
                  <p className="mt-1 font-semibold">
                    {dateLabel(selectedCustomer.created_at)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-sm text-slate-500">Delivery address</p>
                  <p className="mt-1">
                    {[
                      selectedCustomer.delivery_address,
                      selectedCustomer.delivery_area,
                      selectedCustomer.delivery_city,
                      selectedCustomer.delivery_region,
                      selectedCustomer.ghana_post_gps,
                    ]
                      .filter(Boolean)
                      .join(", ") || "No delivery address saved"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Total orders</p>
                  <p className="mt-1 text-xl font-bold">
                    {selectedOrders.length}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Amount paid</p>
                  <p className="mt-1 text-xl font-bold">
                    {money(totalSpent(selectedCustomer.id))}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Order totals: {money(orderTotal(selectedCustomer.id))}
                  </p>
                </div>
              </div>

              <h3 className="mt-7 text-lg font-bold">Order history</h3>

              <div className="mt-3 space-y-3">
                {selectedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">
                          {order.product_name || "Order"}{" "}
                          {order.order_number
                            ? `· ${order.order_number}`
                            : ""}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {dateLabel(order.created_at)}
                          {order.quantity != null
                            ? ` · Quantity: ${order.quantity}`
                            : ""}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2 py-1 text-xs ${statusClass(
                          order.status
                        )}`}
                      >
                        {order.status || "Status unavailable"}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                      <p>
                        <span className="text-slate-500">Order total: </span>
                        <strong>{money(order.total_amount)}</strong>
                      </p>
                      <p>
                        <span className="text-slate-500">Paid: </span>
                        <strong>{money(order.amount_paid)}</strong>
                      </p>
                      <p>
                        <span className="text-slate-500">Remaining: </span>
                        <strong>{money(order.amount_remaining)}</strong>
                      </p>
                    </div>
                  </div>
                ))}

                {selectedOrders.length === 0 && (
                  <p className="rounded-lg bg-slate-50 p-5 text-slate-600">
                    No orders were found for this customer.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
