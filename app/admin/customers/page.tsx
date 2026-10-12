
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Customer = {
  id: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  account_type: string | null;
  verified: boolean | null;
  verification_status: string | null;
  created_at: string | null;
  delivery_region: string | null;
  delivery_city: string | null;
  delivery_area: string | null;
  delivery_address: string | null;
  ghana_post_gps: string | null;
};

type CustomerOrder = {
  id: string;
  created_at?: string;
  status?: string;
  total_amount?: number | string;
  total?: number | string;
  customer_id?: string;
  buyer_id?: string;
  user_id?: string;
};

const PAGE_SIZE = 50;

function display(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }
  return String(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatMoney(value: number | string | undefined) {
  if (value === undefined || value === "") return "Not available";

  const amount = Number(value);

  if (!Number.isFinite(amount)) return String(value);

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount);
}

export default function AdminCustomersPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);

  const checkAdminSession = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      setIsAdmin(response.ok && result.authenticated === true);
    } catch (err) {
      console.error("Admin session check failed:", err);
      setIsAdmin(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: queryError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, phone, location, account_type, verified, verification_status, created_at, delivery_region, delivery_city, delivery_area, delivery_address, ghana_post_gps"
        )
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (queryError) throw queryError;

      setCustomers((data ?? []) as Customer[]);
    } catch (err) {
      console.error("Unable to load customers:", err);
      setError(
        "Could not load customer records. Check the profiles table, column names, and Supabase Row Level Security policies."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void checkAdminSession();
  }, [checkAdminSession]);

  useEffect(() => {
    if (isAdmin) {
      void loadCustomers();
    }
  }, [isAdmin, loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !term ||
        [
          customer.full_name,
          customer.id,
          customer.phone,
          customer.location,
          customer.delivery_region,
          customer.delivery_city,
          customer.delivery_area,
          customer.delivery_address,
          customer.ghana_post_gps,
          customer.account_type,
          customer.verification_status,
        ].some((value) => String(value ?? "").toLowerCase().includes(term));

      const matchesAccount =
        accountFilter === "all" ||
        (customer.account_type ?? "").toLowerCase() === accountFilter;

      const verified =
        customer.verified === true ||
        (customer.verification_status ?? "").toLowerCase() === "verified";

      const matchesVerification =
        verificationFilter === "all" ||
        (verificationFilter === "verified" && verified) ||
        (verificationFilter === "unverified" && !verified);

      return matchesSearch && matchesAccount && matchesVerification;
    });
  }, [customers, search, accountFilter, verificationFilter]);

  async function openCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    setOrders([]);
    setNotice("");
    setOrdersLoading(true);

    try {
      // The page tries common customer ownership columns.
      // Your actual orders table must have one of these columns.
      const ownershipColumns = ["customer_id", "buyer_id", "user_id"];
      let foundOrders: CustomerOrder[] | null = null;
      let lastError: unknown = null;

      for (const column of ownershipColumns) {
        const { data, error: queryError } = await supabase
          .from("orders")
          .select("*")
          .eq(column, customer.id)
          .order("created_at", { ascending: false })
          .limit(100);

        if (!queryError) {
          foundOrders = (data ?? []) as CustomerOrder[];
          break;
        }

        lastError = queryError;
      }

      if (foundOrders !== null) {
        setOrders(foundOrders);
      } else {
        console.warn("Customer order lookup failed:", lastError);
        setNotice(
          "Customer details loaded, but order history could not be retrieved. Your orders table may use a different customer ID column or have restrictive access policies."
        );
      }
    } catch (err) {
      console.error("Order history lookup failed:", err);
      setNotice("Customer details loaded, but order history is unavailable.");
    } finally {
      setOrdersLoading(false);
    }
  }

  function exportCustomers() {
    const headers = [
      "Customer ID",
      "Full Name",
      "Phone",
      "Account Type",
      "Verified",
      "Verification Status",
      "Registration Date",
      "Region",
      "City",
      "Area",
      "Delivery Address",
      "GhanaPost GPS",
    ];

    const rows = filteredCustomers.map((customer) => [
      customer.id,
      customer.full_name,
      customer.phone,
      customer.account_type,
      customer.verified ? "Yes" : "No",
      customer.verification_status,
      customer.created_at,
      customer.delivery_region,
      customer.delivery_city,
      customer.delivery_area,
      customer.delivery_address,
      customer.ghana_post_gps,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "").replace(/"/g, '""');
            return `"${text}"`;
          })
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "bestsalesgh-customers.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  if (isChecking) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-700">
        Checking administrator session...
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Administrator access required
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Your administrator session is not active. Sign in using the
            BestSalesGH central admin login, then return to this page.
          </p>
          <a
            href="/login"
            className="mt-5 inline-flex rounded-lg bg-blue-800 px-5 py-3 font-semibold text-white hover:bg-blue-900"
          >
            Go to login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-800">
              BestSalesGH Administration
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Customer Management
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Review customer accounts, registration details, verification,
              and available delivery information.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="/admin"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-100"
            >
              Admin dashboard
            </a>
            <button
              type="button"
              onClick={() => void loadCustomers()}
              disabled={loading}
              className="rounded-lg bg-blue-800 px-4 py-2 font-semibold text-white hover:bg-blue-900 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={exportCustomers}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-100"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Customers loaded</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {customers.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Verified accounts</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {
                customers.filter(
                  (customer) =>
                    customer.verified === true ||
                    (customer.verification_status ?? "").toLowerCase() ===
                      "verified"
                ).length
              }
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Awaiting verification</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {
                customers.filter(
                  (customer) =>
                    customer.verified !== true &&
                    (customer.verification_status ?? "").toLowerCase() !==
                      "verified"
                ).length
              }
            </p>
          </div>
        </div>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, customer ID, phone, address or GPS..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />

            <select
              value={accountFilter}
              onChange={(event) => setAccountFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3"
            >
              <option value="all">All account types</option>
              <option value="customer">Customers</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
              <option value="business">Businesses</option>
            </select>

            <select
              value={verificationFilter}
              onChange={(event) =>
                setVerificationFilter(event.target.value)
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-3"
            >
              <option value="all">All verification statuses</option>
              <option value="verified">Verified</option>
              <option value="unverified">Not verified</option>
            </select>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Showing {filteredCustomers.length} of {customers.length} loaded
              accounts
            </p>
            <p className="text-xs text-slate-500">
              Maximum 50 accounts loaded per refresh
            </p>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Contact</th>
                  <th className="px-3 py-3 font-semibold">Account type</th>
                  <th className="px-3 py-3 font-semibold">Verification</th>
                  <th className="px-3 py-3 font-semibold">Registered</th>
                  <th className="px-3 py-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const verified =
                    customer.verified === true ||
                    (customer.verification_status ?? "").toLowerCase() ===
                      "verified";

                  return (
                    <tr
                      key={customer.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-3 py-4">
                        <p className="font-semibold text-slate-900">
                          {display(customer.full_name)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          ID: {customer.id}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <p>{display(customer.phone)}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {display(customer.location)}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        {display(customer.account_type)}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            verified
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {verified
                            ? "Verified"
                            : display(customer.verification_status) ===
                                "Not provided"
                              ? "Not verified"
                              : display(customer.verification_status)}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {formatDate(customer.created_at)}
                      </td>
                      <td className="px-3 py-4">
                        <button
                          type="button"
                          onClick={() => void openCustomer(customer)}
                          className="rounded-lg bg-blue-800 px-3 py-2 font-semibold text-white hover:bg-blue-900"
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
                      colSpan={6}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No matching accounts found.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Loading customer records...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selectedCustomer && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 py-8 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Customer details"
          >
            <section className="my-auto w-full max-w-4xl rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Customer profile
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    {display(selectedCustomer.full_name)}
                  </h2>
                  <p className="mt-1 break-all text-xs text-slate-500">
                    Customer ID: {selectedCustomer.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>

              {notice && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  {notice}
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  ["Full name", selectedCustomer.full_name],
                  ["Phone", selectedCustomer.phone],
                  ["Account type", selectedCustomer.account_type],
                  [
                    "Verification status",
                    selectedCustomer.verification_status ??
                      (selectedCustomer.verified ? "Verified" : "Not verified"),
                  ],
                  ["Registered on", formatDate(selectedCustomer.created_at)],
                  ["Location", selectedCustomer.location],
                  ["Delivery region", selectedCustomer.delivery_region],
                  ["Delivery city", selectedCustomer.delivery_city],
                  ["Delivery area", selectedCustomer.delivery_area],
                  ["GhanaPost GPS", selectedCustomer.ghana_post_gps],
                  ["Delivery address", selectedCustomer.delivery_address],
                  [
                    "Verified flag",
                    selectedCustomer.verified ? "Yes" : "No",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-slate-200 p-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 break-words font-medium text-slate-900">
                      {display(value)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7">
                <h3 className="text-lg font-bold text-slate-900">
                  Order history
                </h3>
                {ordersLoading ? (
                  <p className="mt-3 text-sm text-slate-500">
                    Loading orders...
                  </p>
                ) : orders.length === 0 ? (
                  <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                    No orders were found for this customer, or order history
                    is not accessible using the current table configuration.
                  </p>
                ) : (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[500px] text-left text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50">
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr
                            key={order.id}
                            className="border-b border-slate-100"
                          >
                            <td className="p-3">{order.id}</td>
                            <td className="p-3">
                              {formatDate(order.created_at)}
                            </td>
                            <td className="p-3">
                              {display(order.status)}
                            </td>
                            <td className="p-3">
                              {formatMoney(
                                order.total_amount ?? order.total
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        <footer className="py-6 text-center text-xs text-slate-500">
          BestSalesGH Admin · Customer records are restricted to authorized
          administrators.
        </footer>
      </div>
    </main>
  );
}
