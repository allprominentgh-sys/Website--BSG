
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Listing = {
  id: string | number;
  title: string | null;
  price: number | null;
  currency_code: string | null;
  currency: string | null;
  category: string | null;
  subcategory: string | null;
  status: string | null;
  created_at: string | null;
  location: string | null;
};

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);
    setErrorMessage("");

    try {
      const supabase = supabaseBrowser();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("listings")
        .select(
          `
            id,
            title,
            price,
            currency_code,
            currency,
            category,
            subcategory,
            status,
            created_at,
            location
          `
        )
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("MY LISTINGS ERROR:", error);
        setErrorMessage(error.message);
        return;
      }

      setListings((data || []) as Listing[]);
    } catch (error) {
      console.error("MY LISTINGS ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load your listings."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteListing(id: string | number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeletingId(id);
    setErrorMessage("");

    try {
      const supabase = supabaseBrowser();

      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", id)
        .eq("seller_id", userId);

      if (error) {
        console.error("DELETE LISTING ERROR:", error);
        setErrorMessage(error.message);
        return;
      }

      setListings((current) =>
        current.filter((listing) => listing.id !== id)
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete listing."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function formatPrice(listing: Listing) {
    if (listing.price === null || listing.price === undefined) {
      return "Price not available";
    }

    const currency =
      listing.currency_code || listing.currency || "GHS";

    const symbols: Record<string, string> = {
      GHS: "GH₵",
      USD: "$",
      EUR: "€",
      GBP: "£",
      CNY: "¥",
    };

    return `${symbols[currency] || currency}${Number(
      listing.price
    ).toLocaleString()}`;
  }

  function formatDate(date: string | null) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-GH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      (listing.title || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (listing.category || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const status = (listing.status || "").toLowerCase();

    const matchesFilter =
      filter === "all" ||
      status === filter;

    return matchesSearch && matchesFilter;
  });

  const activeCount = listings.filter(
    (listing) =>
      (listing.status || "").toLowerCase() === "active"
  ).length;

  const pendingCount = listings.filter(
    (listing) =>
      (listing.status || "").toLowerCase() === "pending"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 font-bold text-blue-700"
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-700">
              Seller Centre
            </p>

            <h1 className="mt-1 text-3xl font-black sm:text-4xl">
              My Listings
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your advertisements on BEST SALES GHANA.
            </p>
          </div>

          <Link
            href="/sell"
            className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-6 py-3 font-black text-white shadow transition hover:bg-blue-800"
          >
            + Post an Ad
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              Total Listings
            </p>
            <p className="mt-2 text-3xl font-black">
              {loading ? "..." : listings.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              Active Ads
            </p>
            <p className="mt-2 text-3xl font-black text-green-600">
              {loading ? "..." : activeCount}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              Pending Approval
            </p>
            <p className="mt-2 text-3xl font-black text-amber-600">
              {loading ? "..." : pendingCount}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your listings..."
              className="min-w-0 flex-1 rounded-xl border bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border bg-white px-4 py-3 font-semibold outline-none focus:border-blue-500"
            >
              <option value="all">All Listings</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="text-4xl">⏳</div>
              <p className="mt-3 font-bold text-slate-600">
                Loading your listings...
              </p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl">📦</div>

              <h2 className="mt-4 text-xl font-black">
                {listings.length === 0
                  ? "You haven't posted any ads yet"
                  : "No matching listings"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {listings.length === 0
                  ? "Your advertisements will appear here after you post them."
                  : "Try changing your search or filter."}
              </p>

              {listings.length === 0 && (
                <Link
                  href="/sell"
                  className="mt-5 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-black text-white"
                >
                  + Create Your First Ad
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredListings.map((listing) => (
                <article
                  key={String(listing.id)}
                  className="rounded-2xl border bg-slate-50 p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="min-w-0 flex-1">
                      <h2 className="break-words text-lg font-black">
                        {listing.title || "Untitled Listing"}
                      </h2>

                      <p className="mt-1 text-xl font-black text-blue-700">
                        {formatPrice(listing)}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                        {listing.category && (
                          <span className="rounded-full bg-white px-3 py-1">
                            {listing.category}
                          </span>
                        )}

                        {listing.subcategory && (
                          <span className="rounded-full bg-white px-3 py-1">
                            {listing.subcategory}
                          </span>
                        )}

                        <span className="rounded-full bg-white px-3 py-1">
                          {listing.status || "Status unavailable"}
                        </span>
                      </div>

                      {listing.location && (
                        <p className="mt-3 text-sm text-slate-500">
                          📍 {listing.location}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-slate-400">
                        Posted: {formatDate(listing.created_at)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="rounded-xl border border-blue-700 bg-white px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
                      >
                        View
                      </Link>

                      <button
                        type="button"
                        onClick={() => deleteListing(listing.id)}
                        disabled={deletingId === listing.id}
                        className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === listing.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>

                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="mt-8 border-t py-6 text-center text-xs text-slate-400">
          © 2026 All Prominent Ghana Limited. All rights reserved.
        </footer>

      </div>
    </main>
  );
}
