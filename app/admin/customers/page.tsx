"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Customer = {
  id: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  account_type: string | null;
  verification_status: string | null;
  verified: boolean | null;
  created_at: string | null;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = supabaseBrowser();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("account_type")
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) throw profileError;

      const role = (profile?.account_type ?? "").toLowerCase();

      if (!["admin", "administrator"].includes(role)) {
        setAuthorized(false);
        setError(
          "Access denied. Only an authorised administrator can manage customers."
        );
        return;
      }

      setAuthorized(true);

      const { data, error: customersError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, phone, location, account_type, verification_status, verified, created_at"
        )
        .order("created_at", { ascending: false });

      if (customersError) throw customersError;

      setCustomers((data ?? []) as Customer[]);
    } catch (err) {
      console.error("Customers page error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customer accounts."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = customers.filter((customer) => {
    const term = search.toLowerCase().trim();

    if (!term) return true;

    return [
      customer.full_name,
      customer.phone,
      customer.location,
      customer.id,
      customer.account_type,
    ].some((value) =>
      (value ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6">
          <div>
            <p className="text-sm font-bold text-blue-700">
              BEST SALES GHANA
            </p>
            <h1 className="mt-2 text-3xl font-black">
              Customer Management
            </h1>
            <p className="mt-2 text-slate-600">
              View registered accounts and customer verification details.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold hover:bg-slate-50"
            >
              ← Admin Dashboard
            </Link>

            <button
              type="button"
              onClick={() => void loadCustomers()}
              disabled={loading}
              className="rounded-xl bg-blue-700 px-4 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800"
          >
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-slate-500">
              Profiles Loaded
            </p>
            <p className="mt-3 text-3xl font-black">
              {loading ? "…" : customers.length}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-slate-500">
              Verified Profiles
            </p>
            <p className="mt-3 text-3xl font-black text-green-700">
              {loading
                ? "…"
                : customers.filter((customer) => customer.verified)
                    .length}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-slate-500">
              Matching Results
            </p>
            <p className="mt-3 text-3xl font-black">
              {loading ? "…" : filteredCustomers.length}
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="customer-search"
            className="block font-bold"
          >
            Search customers
          </label>

          <input
            id="customer-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, phone, location or customer ID..."
            className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-black">
              Registered Accounts
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Customer information available to your administrator account.
            </p>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">
              Loading customer accounts...
            </p>
          ) : !authorized ? (
            <p className="p-6 text-slate-600">
              Administrator authorisation is required.
            </p>
          ) : filteredCustomers.length === 0 ? (
            <p className="p-6 text-slate-600">
              No matching customer accounts were found.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <article
                  key={customer.id}
                  className="p-5 transition hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-black">
                        {customer.full_name || "Name not provided"}
                      </h3>

                      <p className="mt-1 break-all text-sm text-slate-500">
                        ID: {customer.id}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        customer.verified
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {customer.verified ? "Verified" : "Not verified"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-slate-500">Phone</p>
                      <p className="mt-1 break-words font-semibold">
                        {customer.phone || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Location</p>
                      <p className="mt-1 break-words font-semibold">
                        {customer.location || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Account type</p>
                      <p className="mt-1 break-words font-semibold">
                        {customer.account_type || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">
                        Verification status
                      </p>
                      <p className="mt-1 font-semibold">
                        {customer.verification_status ||
                          "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Registered</p>
                      <p className="mt-1 font-semibold">
                        {customer.created_at
                          ? new Date(
                              customer.created_at
                            ).toLocaleDateString("en-GH")
                          : "Not available"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
