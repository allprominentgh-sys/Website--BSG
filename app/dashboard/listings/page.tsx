
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Listing = {
  id: string | number;
  title: string | null;
  price: number | null;
  currency_code?: string | null;
  currency?: string | null;
  location?: string | null;
  status?: string | null;
  featured?: boolean | null;
  created_at?: string | null;
  category?: string | null;
};

type FilterStatus = "all" | "active" | "pending" | "inactive";

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabaseBrowser.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setListings([]);
        setError("Please log in to view your listings.");
        return;
      }

      const { data, error: queryError } = await supabaseBrowser
        .from("listings")
        .select(
          "id, title, price, currency_code, currency, location, status, featured, created_at, category"
        )
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;

      setListings((data ?? []) as Listing[]);
    } catch (err) {
      console.error("Failed to load listings:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your listings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  const getStatus = (listing: Listing) =>
    (listing.status ?? "").toLowerCase();

  const filteredListings = useMemo(() => {
    const term = search.trim().toLowerCase();

    return listings.filter((listing) => {
      const matchesSearch =
        !term ||
        (listing.title ?? "").toLowerCase().includes(term) ||
        (listing.location ?? "").toLowerCase().includes(term) ||
        (listing.category ?? "").toLowerCase().includes(term) ||
        String(listing.id).toLowerCase().includes(term);

      const status = getStatus(listing);

      const matchesStatus =
        filter === "all" ||
        (filter === "active" && status === "active") ||
        (filter === "pending" && status === "pending") ||
        (filter === "inactive" &&
          status !== "active" &&
          status !== "pending");

      return matchesSearch && matchesStatus;
    });
  }, [listings, search, filter]);

  const counts = useMemo(
    () => ({
      all: listings.length,
      active: listings.filter(
        (listing) => getStatus(listing) === "active"
      ).length,
      pending: listings.filter(
        (listing) => getStatus(listing) === "pending"
      ).length,
      inactive: listings.filter(
        (listing) =>
          getStatus(listing) !== "active" &&
          getStatus(listing) !== "pending"
      ).length,
    }),
    [listings]
  );

  async function deleteListing(listing: Listing) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${listing.title || "this listing"}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(listing.id);
    setError("");
    setMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabaseBrowser.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error("Please log in before deleting a listing.");
      }

      const { data, error: deleteError } = await supabaseBrowser
        .from("listings")
        .delete()
        .eq("id", listing.id)
        .eq("seller_id", user.id)
        .select("id");

      if (deleteError) throw deleteError;

      if (!data || data.length === 0) {
        throw new Error(
          "The listing was not deleted. Please check your account permissions."
        );
      }

      setListings((current) =>
        current.filter((item) => item.id !== listing.id)
      );
      setMessage("Listing deleted successfully.");
    } catch (err) {
      console.error("Failed to delete listing:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete the listing."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function formatPrice(listing: Listing) {
    if (listing.price === null || listing.price === undefined) {
      return "Price not set";
    }

    const currency = listing.currency_code || listing.currency || "GHS";
    const amount = new Intl.NumberFormat("en-GH", {
      maximumFractionDigits: 2,
    }).format(listing.price);

    const symbol =
      currency.toUpperCase() === "GHS"
        ? "GH₵"
        : `${currency.toUpperCase()} `;

    return `${symbol}${amount}`;
  }

  function formatDate(date?: string | null) {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "Date unavailable";

    return parsed.toLocaleDateString("en-GH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function statusStyle(status?: string | null) {
    switch ((status ?? "").toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "rejected":
      case "inactive":
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              My Listings
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your ads, view their status, and promote your listings.
            </p>
          </div>

          <Link
            href="/sell"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
          >
            + Post an Ad
          </Link>
        </div>

        {message && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
            <button
              type="button"
              onClick={() => void loadListings()}
              className="ml-3 font-bold underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(
            [
              ["all", "All Listings", counts.all],
              ["active", "Active Ads", counts.active],
              ["pending", "Pending", counts.pending],
              ["inactive", "Inactive", counts.inactive],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-2xl border p-4 text-left transition ${
                filter === key
                  ? "border-blue-700 bg-blue-50 ring-1 ring-blue-700"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              <span className="block text-sm text-gray-600">{label}</span>
              <span className="mt-1 block text-2xl font-extrabold text-gray-900">
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
          <label
            htmlFor="listing-search"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Search your listings
          </label>

          <input
            id="listing-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, category, location or ID..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-600">
            Loading your listings...
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center">
            <h2 className="text-lg font-bold text-gray-900">
              {listings.length === 0
                ? "You haven't posted any listings yet."
                : "No listings match your search."}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {listings.length === 0
                ? "Post your first ad to start reaching customers."
                : "Try another search term or status filter."}
            </p>

            {listings.length === 0 && (
              <Link
                href="/sell"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
              >
                Post an Ad
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((listing) => {
              const status = getStatus(listing);
              const canPromote = status === "active";
              const listingId = encodeURIComponent(String(listing.id));

              return (
                <article
                  key={String(listing.id)}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle(
                            listing.status
                          )}`}
                        >
                          {listing.status || "Unknown"}
                        </span>

                        {listing.featured && (
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                            Featured
                          </span>
                        )}

                        {listing.category && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                            {listing.category}
                          </span>
                        )}
                      </div>

                      <h2 className="break-words text-lg font-bold text-gray-900">
                        {listing.title || "Untitled listing"}
                      </h2>

                      <p className="mt-1 text-lg font-extrabold text-blue-800">
                        {formatPrice(listing)}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>Listing ID: {String(listing.id)}</span>
                        {listing.location && (
                          <span>Location: {listing.location}</span>
                        )}
                        <span>Posted: {formatDate(listing.created_at)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:max-w-md lg:justify-end">
                      <Link
                        href={`/listings/${listingId}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-800 hover:bg-gray-50"
                      >
                        View
                      </Link>

                      {canPromote ? (
                        <Link
                          href={`/dashboard/promote?listingId=${listingId}`}
                          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-700 px-3 py-2 text-center text-sm font-bold text-white hover:bg-blue-800"
                        >
                          Promote Ad
                        </Link>
                      ) : (
                        <span
                          title="Only active listings can be promoted."
                          className="inline-flex min-h-10 cursor-not-allowed items-center justify-center rounded-xl bg-gray-100 px-3 py-2 text-center text-sm font-semibold text-gray-400"
                        >
                          Promote Ad
                        </span>
                      )}

                      <Link
                        href={`/dashboard/listings/edit/${listingId}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-800 hover:bg-gray-50"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        disabled={deletingId === listing.id}
                        onClick={() => void deleteListing(listing)}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-red-200 px-3 py-2 text-center text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === listing.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && filteredListings.length > 0 && (
          <p className="mt-5 text-center text-sm text-gray-500">
            Showing {filteredListings.length} of {listings.length} listings
          </p>
        )}
      </div>
    </main>
  );
}
