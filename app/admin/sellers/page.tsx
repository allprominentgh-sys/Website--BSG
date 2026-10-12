
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

const CUSTOMER_TYPES = ["buyer", "customer"];

function valueOrFallback(value: unknown) {
  return value === null || value === undefined || value === ""
    ? "Not provided"
    : String(value);
}

function formatDate(value: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

export default function AdminCustomersPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [verification, setVerification] = useState("all");
  const [selected, setSelected] = useState<Customer | null>(null);

  const checkSession = useCallback(async () => {
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
      setChecking(false);
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
        .in("account_type", CUSTOMER_TYPES)
        .order("created_at", { ascending: false })
        .limit(500);

      if (queryError) throw queryError;
      setCustomers((data ?? []) as Customer[]);
    } catch (err) {
      console.error("Customer loading failed:", err);
      setError(
        "Could not load customer records. Confirm the account_type values, profiles columns and Supabase access policies."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (isAdmin) void loadCustomers();
  }, [isAdmin, loadCustomers]);

  const visibleCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const searchable = [
        customer.full_name,
        customer.id,
        customer.phone,
        customer.location,
        customer.delivery_region,
        customer.delivery_city,
        customer.delivery_area,
        customer.delivery_address,
        customer.ghana_post_gps,
      ]
        .map((item) => String(item ?? "").toLowerCase())
        .join(" ");

      const matchesSearch = !query || searchable.includes(query);

      const isVerified =
        customer.verified === true ||
        (customer.verification_status ?? "").toLowerCase() === "verified";

      const matchesVerification =
        verification === "all" ||
        (verification === "verified" && isVerified) ||
        (verification === "unverified" && !isVerified);

      return matchesSearch && matchesVerification;
    });
  }, [customers, search, verification]);

  function exportCsv() {
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

    const rows = visibleCustomers.map((customer) => [
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
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
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

  if (checking) {
    return <main className="min-h-screen p-8">Checking admin session...</main>;
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <h1 className="text-2xl font-bold">Administrator access required</h1>
        <p className="mt-2">Please sign in with the central admin account.</p>
        <a className="mt-4 inline-block text-blue-700 underline" href="/login">
          Go to login
        </a>
      </main>
    );
  }

  const verifiedCount = customers.filter(
    (customer) =>
      customer.verified === true ||
      (customer.verification_status ?? "").toLowerCase() === "verified"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <a href="/admin" className="text-sm font-semibold text-blue-800">
              ← Admin dashboard
            </a>
            <h1 className="mt-2 text-3xl font-black">Customer Management</h1>
            <p className="mt-1 text-sm text-slate-600">
              Buyer and customer accounts only. Seller accounts are managed
              separately.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void loadCustomers()}
              disabled={loading}
              className="rounded-lg bg-blue-800 px-4 py-2 font-bold text-white disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={exportCsv}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold"
            >
              Export CSV
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Customer accounts loaded</p>
            <p className="mt-2 text-3xl font-black">{customers.length}</p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Verified</p>
            <p className="mt-2 text-3xl font-black text-green-700">
              {verifiedCount}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Not verified</p>
            <p className="mt-2 text-3xl font-black text-amber-700">
              {customers.length - verifiedCount}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-xl border bg-white p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, customer ID, phone, address or GPS"
              className="w-full rounded-lg border px-4 py-3"
            />
            <select
              value={verification}
              onChange={(event) => setVerification(event.target.value)}
              className="rounded-lg border bg-white px-4 py-3"
            >
              <option value="all">All verification statuses</option>
              <option value="verified">Verified</option>
              <option value="unverified">Not verified</option>
            </select>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
              {error}
            </p>
          )}

          <p className="mt-4 text-sm text-slate-600">
            Showing {visibleCustomers.length} of {customers.length} loaded
            customer accounts.
          </p>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Account type</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3">Registered</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleCustomers.map((customer) => {
                  const isVerified =
                    customer.verified === true ||
                    (customer.verification_status ?? "").toLowerCase() ===
                      "verified";

                  return (
                    <tr key={customer.id} className="border-t">
                      <td className="p-3">
                        <p className="font-bold">
                          {valueOrFallback(customer.full_name)}
                        </p>
                        <p className="break-all text-xs text-slate-500">
                          {customer.id}
                        </p>
                      </td>
                      <td className="p-3">{valueOrFallback(customer.phone)}</td>
                      <td className="p-3">{customer.account_type}</td>
                      <td className="p-3">
                        <span
                          className={
                            isVerified
                              ? "rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-800"
                              : "rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800"
                          }
                        >
                          {isVerified ? "Verified" : "Not verified"}
                        </span>
                      </td>
                      <td className="p-3">{formatDate(customer.created_at)}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelected(customer)}
                          className="rounded-lg bg-blue-800 px-3 py-2 font-semibold text-white"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!loading && visibleCustomers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No customer accounts match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <section className="w-full max-w-2xl rounded-2xl bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">
                    {valueOrFallback(selected.full_name)}
                  </h2>
                  <p className="mt-1 break-all text-xs text-slate-500">
                    Customer ID: {selected.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg border px-3 py-2"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["Phone", selected.phone],
                  ["Account type", selected.account_type],
                  ["Verification", selected.verification_status],
                  ["Registered", formatDate(selected.created_at)],
                  ["Location", selected.location],
                  ["Delivery region", selected.delivery_region],
                  ["Delivery city", selected.delivery_city],
                  ["Delivery area", selected.delivery_area],
                  ["Delivery address", selected.delivery_address],
                  ["GhanaPost GPS", selected.ghana_post_gps],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 break-words font-medium">
                      {valueOrFallback(value)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
