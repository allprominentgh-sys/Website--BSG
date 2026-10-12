
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
};

type Listing = {
  id: number;
  seller_id: string;
  title: string;
  price: number | null;
  currency_code: string | null;
  status: string | null;
  featured: boolean | null;
  created_at: string | null;
};

export default function AdminSellersPage() {
  const supabase = supabaseBrowser();

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [profilesResult, listingsResult] = await Promise.all([
          supabase
            .from("profiles")
            .select(
              "id, full_name, phone, location, account_type, verified, verification_status, created_at"
            )
            .order("created_at", { ascending: false }),
          supabase
            .from("listings")
            .select(
              "id, seller_id, title, price, currency_code, status, featured, created_at"
            )
            .order("created_at", { ascending: false }),
        ]);

        if (profilesResult.error) throw profilesResult.error;
        if (listingsResult.error) throw listingsResult.error;

        if (cancelled) return;

        const allProfiles = (profilesResult.data ?? []) as Seller[];
        const individualSellers = allProfiles.filter((profile) =>
          ["seller", "individual"].includes(
            (profile.account_type ?? "").toLowerCase()
          )
        );

        setSellers(individualSellers);
        setListings((listingsResult.data ?? []) as Listing[]);
      } catch (err) {
        console.error("Seller management load failed:", err);
        if (!cancelled) {
          setError(
            "Unable to load sellers. Check your Supabase access policies and try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const visibleSellers = sellers.filter((seller) => {
    const query = search.toLowerCase().trim();

    const matchesSearch =
      !query ||
      (seller.full_name ?? "").toLowerCase().includes(query) ||
      (seller.phone ?? "").toLowerCase().includes(query) ||
      seller.id.toLowerCase().includes(query);

    const matchesSelected =
      selectedSeller === "all" || seller.id === selectedSeller;

    return matchesSearch && matchesSelected;
  });

  function sellerListings(sellerId: string) {
    return listings.filter((listing) => listing.seller_id === sellerId);
  }

  function money(listing: Listing) {
    const amount = listing.price;

    if (amount == null) return "Price not set";

    return `${listing.currency_code || "GHS"} ${Number(amount).toLocaleString(
      "en-GH",
      { maximumFractionDigits: 2 }
    )}`;
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <Link
              href="/admin"
              className="text-sm font-bold text-blue-700 hover:underline"
            >
              ← Back to Admin Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-black">Manage Individual Sellers</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review seller profiles, listings and promotion status.
            </p>
          </div>

          <Link
            href="/listings"
            className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
          >
            View Public Listings
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-500">
              Individual Sellers
            </p>
            <p className="mt-2 text-3xl font-black">
              {loading ? "…" : sellers.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-500">
              Seller Listings
            </p>
            <p className="mt-2 text-3xl font-black">
              {loading ? "…" : listings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-500">
              Featured Listings
            </p>
            <p className="mt-2 text-3xl font-black">
              {loading
                ? "…"
                : listings.filter((listing) => listing.featured).length}
            </p>
          </div>
        </div>

        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="seller-search"
                className="mb-2 block text-sm font-bold"
              >
                Search sellers
              </label>
              <input
                id="seller-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, phone or seller ID"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="seller-filter"
                className="mb-2 block text-sm font-bold"
              >
                Filter by seller
              </label>
              <select
                id="seller-filter"
                value={selectedSeller}
                onChange={(event) => setSelectedSeller(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="all">All individual sellers</option>
                {sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.full_name || seller.phone || seller.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {loading ? (
            <div className="rounded-2xl bg-white p-10 text-center font-semibold text-slate-500">
              Loading seller records…
            </div>
          ) : visibleSellers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-xl font-black">No individual sellers found</p>
              <p className="mt-2 text-sm text-slate-500">
                Check your search or confirm that individual accounts use the
                seller or individual account type in Supabase.
              </p>
            </div>
          ) : (
            visibleSellers.map((seller) => {
              const sellerAds = sellerListings(seller.id);

              return (
                <article
                  key={seller.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center">
                    <div>
                      <h2 className="text-xl font-black">
                        {seller.full_name || "Name not provided"}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {seller.phone || "No phone number"} ·{" "}
                        {seller.location || "Location not provided"}
                      </p>
                      <p className="mt-1 break-all text-xs text-slate-400">
                        Seller ID: {seller.id}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          seller.verified
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {seller.verified ? "Verified" : "Not verified"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                        {seller.verification_status || "Status unavailable"}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Total listings</p>
                      <p className="mt-1 text-2xl font-black">
                        {sellerAds.length}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">
                        Featured listings
                      </p>
                      <p className="mt-1 text-2xl font-black">
                        {sellerAds.filter((ad) => ad.featured).length}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Joined</p>
                      <p className="mt-1 font-black">
                        {seller.created_at
                          ? new Date(seller.created_at).toLocaleDateString(
                              "en-GH"
                            )
                          : "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 p-5">
                    <h3 className="font-black">Seller listings and promotions</h3>

                    {sellerAds.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-500">
                        This seller has no listings in the current results.
                      </p>
                    ) : (
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full min-w-[600px] text-left text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                              <th className="px-3 py-3">Listing</th>
                              <th className="px-3 py-3">Price</th>
                              <th className="px-3 py-3">Status</th>
                              <th className="px-3 py-3">Promotion</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sellerAds.map((listing) => (
                              <tr
                                key={listing.id}
                                className="border-b border-slate-100 last:border-0"
                              >
                                <td className="px-3 py-3 font-semibold">
                                  {listing.title}
                                </td>
                                <td className="px-3 py-3">{money(listing)}</td>
                                <td className="px-3 py-3">
                                  {listing.status || "Unknown"}
                                </td>
                                <td className="px-3 py-3">
                                  {listing.featured ? (
                                    <span className="font-bold text-blue-700">
                                      Featured
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">
                                      Standard
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
