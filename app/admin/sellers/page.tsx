"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Seller = {
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

type Listing = {
  id: string | number;
  seller_id?: string;
  title?: string;
  status?: string;
  price?: number | string;
  created_at?: string;
  is_featured?: boolean;
  featured?: boolean;
};

const SELLER_TYPES = ["seller", "business", "individual", "company"];

function display(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  return String(value);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isVerified(seller: Seller): boolean {
  return (
    seller.verified === true ||
    (seller.verification_status ?? "").toLowerCase() === "verified"
  );
}

function formatMoney(value: number | string | undefined): string {
  if (value === undefined || value === "") return "Not available";

  const amount = Number(value);

  if (!Number.isFinite(amount)) return String(value);

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount);
}

export default function AdminSellersPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listingNotice, setListingNotice] = useState("");

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
      setChecking(false);
    }
  }, []);

  const loadSellers = useCallback(async () => {
    setLoading(true);
    setError("");
    setListingNotice("");

    try {
      const { data, error: sellerError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, phone, location, account_type, verified, verification_status, created_at, delivery_region, delivery_city, delivery_area, delivery_address, ghana_post_gps"
        )
        .in("account_type", SELLER_TYPES)
        .order("created_at", { ascending: false })
        .limit(500);

      if (sellerError) throw sellerError;

      const sellerRecords = (data ?? []) as Seller[];
      setSellers(sellerRecords);

      if (sellerRecords.length === 0) {
        setListings([]);
        return;
      }

      const sellerIds = sellerRecords.map((seller) => seller.id);

      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .in("seller_id", sellerIds)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (listingError) {
        console.error("Seller listings could not be loaded:", listingError);
        setListings([]);
        setListingNotice(
          "Seller profiles loaded, but listings could not be loaded. Check the listings table columns and Supabase access policies."
        );
      } else {
        setListings((listingData ?? []) as Listing[]);
      }
    } catch (err) {
      console.error("Seller loading failed:", err);
      setError(
        "Unable to load sellers. Check the profiles columns, account_type values, and Supabase access policies."
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
      void loadSellers();
    }
  }, [isAdmin, loadSellers]);

  const filteredSellers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return sellers.filter((seller) => {
      const matchesSearch =
        !term ||
        [
          seller.full_name,
          seller.id,
          seller.phone,
          seller.location,
          seller.account_type,
          seller.verification_status,
          seller.delivery_region,
          seller.delivery_city,
          seller.delivery_area,
          seller.delivery_address,
          seller.ghana_post_gps,
        ].some((value) => String(value ?? "").toLowerCase().includes(term));

      const matchesAccount =
        accountFilter === "all" ||
        (seller.account_type ?? "").toLowerCase() === accountFilter;

      const verified = isVerified(seller);

      const matchesVerification =
        verificationFilter === "all" ||
        (verificationFilter === "verified" && verified) ||
        (verificationFilter === "unverified" && !verified);

      return matchesSearch && matchesAccount && matchesVerification;
    });
  }, [sellers, search, accountFilter, verificationFilter]);

  function sellerListings(sellerId: string) {
    return listings.filter((listing) => listing.seller_id === sellerId);
  }

  function exportSellers() {
    const headers = [
      "Seller ID",
      "Full Name",
      "Phone",
      "Account Type",
      "Verified",
      "Verification Status",
      "Registration Date",
      "Location",
      "Region",
      "City",
      "Area",
      "Delivery Address",
      "GhanaPost GPS",
      "Listings Count",
    ];

    const rows = filteredSellers.map((seller) => [
      seller.id,
      seller.full_name,
      seller.phone,
      seller.account_type,
      isVerified(seller) ? "Yes" : "No",
      seller.verification_status,
      seller.created_at,
      seller.location,
      seller.delivery_region,
      seller.delivery_city,
      seller.delivery_area,
      seller.delivery_address,
      seller.ghana_post_gps,
      sellerListings(seller.id).length,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "bestsalesgh-sellers.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-700">
        Checking administrator session...
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8">
          <h1 className="text-xl font-bold text-slate-900">
            Administrator access required
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Sign in with the BestSalesGH central admin account before opening
            seller management.
          </p>

          <a
            href="/login"
            className="mt-5 inline-flex rounded-lg bg-blue-800 px-5 py-3 font-semibold text-white"
          >
            Go to login
          </a>
        </div>
      </main>
    );
  }

  const verifiedCount = sellers.filter(isVerified).length;

  const individualCount = sellers.filter((seller) =>
    ["seller", "individual"].includes(
      (seller.account_type ?? "").toLowerCase()
    )
  ).length;

  const businessCount = sellers.filter((seller) =>
    ["business", "company"].includes(
      (seller.account_type ?? "").toLowerCase()
    )
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-800">
              BestSalesGH Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Seller Management
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Review individual sellers, business accounts, verification,
              addresses and available listings.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="/admin"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium"
            >
              Admin dashboard
            </a>

            <button
              type="button"
              onClick={() => void loadSellers()}
              disabled={loading}
              className="rounded-lg bg-blue-800 px-4 py-2 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={exportSellers}
              disabled={filteredSellers.length === 0}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Seller accounts</p>
            <p className="mt-2 text-3xl font-bold">{sellers.length}</p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Individual accounts</p>
            <p className="mt-2 text-3xl font-bold">{individualCount}</p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Business accounts</p>
            <p className="mt-2 text-3xl font-bold">{businessCount}</p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Verified accounts</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {verifiedCount}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-xl border bg-white p-4 shadow-sm sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search seller name, ID, phone, address or GPS..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />

            <select
              value={accountFilter}
              onChange={(event) => setAccountFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3"
            >
              <option value="all">All seller account types</option>
              <option value="seller">Seller / individual</option>
              <option value="individual">Individual</option>
              <option value="business">Business</option>
              <option value="company">Company</option>
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

          {listingNotice && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {listingNotice}
            </div>
          )}

          <p className="mt-4 text-sm text-slate-600">
            Showing {filteredSellers.length} of {sellers.length} loaded seller
            accounts.
          </p>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-600">
                  <th className="p-3">Seller</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Account type</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3">Listings</th>
                  <th className="p-3">Registered</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>

              <tbody>
                {filteredSellers.map((seller) => {
                  const verified = isVerified(seller);

                  return (
                    <tr key={seller.id} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-semibold text-slate-900">
                          {display(seller.full_name)}
                        </p>
                        <p className="mt-1 break-all text-xs text-slate-500">
                          ID: {seller.id}
                        </p>
                      </td>

                      <td className="p-3">
                        <p>{display(seller.phone)}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {display(seller.location)}
                        </p>
                      </td>

                      <td className="p-3">{display(seller.account_type)}</td>

                      <td className="p-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            verified
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {verified ? "Verified" : "Not verified"}
                        </span>
                      </td>

                      <td className="p-3">
                        {sellerListings(seller.id).length}
                      </td>

                      <td className="p-3">{formatDate(seller.created_at)}</td>

                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => setSelectedSeller(seller)}
                          className="rounded-lg bg-blue-800 px-3 py-2 font-semibold text-white"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {loading && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      Loading seller accounts...
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredSellers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No seller accounts found. Confirm the actual seller
                      account_type values in Supabase.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selectedSeller && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 py-8 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Seller details"
          >
            <section className="my-auto w-full max-w-4xl rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Seller profile
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    {display(selectedSeller.full_name)}
                  </h2>

                  <p className="mt-1 break-all text-xs text-slate-500">
                    Seller ID: {selectedSeller.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSeller(null)}
                  className="rounded-lg border border-slate-300 px-3 py-2"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  ["Full name / profile name", selectedSeller.full_name],
                  ["Phone", selectedSeller.phone],
                  ["Account type", selectedSeller.account_type],
                  [
                    "Verification status",
                    isVerified(selectedSeller)
                      ? "Verified"
                      : selectedSeller.verification_status ??
                        "Not verified",
                  ],
                  ["Registration date", formatDate(selectedSeller.created_at)],
                  ["Location", selectedSeller.location],
                  ["Delivery region", selectedSeller.delivery_region],
                  ["Delivery city", selectedSeller.delivery_city],
                  ["Delivery area", selectedSeller.delivery_area],
                  ["Delivery address", selectedSeller.delivery_address],
                  ["GhanaPost GPS", selectedSeller.ghana_post_gps],
                  ["Listings loaded", sellerListings(selectedSeller.id).length],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 break-words font-medium text-slate-900">
                      {display(value)}
                    </p>
                  </div>
                ))}
              </div>

              <section className="mt-7">
                <h3 className="text-lg font-bold text-slate-900">
                  Seller listings
                </h3>

                {sellerListings(selectedSeller.id).length === 0 ? (
                  <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                    No listings were returned for this seller, or listing
                    records are not accessible.
                  </p>
                ) : (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[550px] text-left text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50">
                          <th className="p-3">Listing ID</th>
                          <th className="p-3">Title</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Created</th>
                        </tr>
                      </thead>

                      <tbody>
                        {sellerListings(selectedSeller.id).map((listing) => (
                          <tr
                            key={String(listing.id)}
                            className="border-b"
                          >
                            <td className="p-3">{listing.id}</td>
                            <td className="p-3">
                              {display(listing.title)}
                            </td>
                            <td className="p-3">
                              {formatMoney(listing.price)}
                            </td>
                            <td className="p-3">
                              {display(listing.status)}
                            </td>
                            <td className="p-3">
                              {formatDate(listing.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </section>
          </div>
        )}

        <footer className="py-6 text-center text-xs text-slate-500">
          BestSalesGH Administration
        </footer>
      </div>
    </main>
  );
}
