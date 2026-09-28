
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/supabase-browser";

type Listing = {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency_code: string | null;
  currency: string | null;
  location: string | null;
  status: string | null;
  featured: boolean | null;
  category: string | null;
  subcategory: string | null;
  created_at: string | null;
  image_url?: string;
};

type Filter = "all" | "active" | "pending" | "rejected" | "expired";

const filters: { label: string; value: Filter }[] = [
  { label: "All Listings", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
  { label: "Expired", value: "expired" },
];

export default function MyListingsPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [listings, setListings] = useState<Listing[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data, error: listingsError } = await supabase
        .from("listings")
        .select(
          "id, seller_id, title, description, price, currency_code, currency, location, status, featured, category, subcategory, created_at"
        )
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (listingsError) {
        throw listingsError;
      }

      const rows = (data || []) as Listing[];

      if (rows.length === 0) {
        setListings([]);
        return;
      }

      const listingIds = rows.map((listing) => listing.id);

      const { data: imageRows, error: imagesError } = await supabase
        .from("listing_images")
        .select("listing_id, image_url")
        .in("listing_id", listingIds);

      if (imagesError) {
        console.warn("Could not load listing images:", imagesError.message);
      }

      const imageMap = new Map<string, string>();

      (imageRows || []).forEach((image) => {
        if (image.listing_id && image.image_url) {
          if (!imageMap.has(image.listing_id)) {
            imageMap.set(image.listing_id, image.image_url);
          }
        }
      });

      setListings(
        rows.map((listing) => ({
          ...listing,
          image_url: imageMap.get(listing.id),
        }))
      );
    } catch (err) {
      console.error("My Listings error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your listings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const filteredListings = useMemo(() => {
    if (filter === "all") return listings;

    return listings.filter(
      (listing) => (listing.status || "").toLowerCase() === filter
    );
  }, [filter, listings]);

  const activeCount = listings.filter(
    (listing) => (listing.status || "").toLowerCase() === "active"
  ).length;

  const totalCount = listings.length;

  function formatPrice(listing: Listing) {
    const currency = listing.currency_code || listing.currency || "GHS";
    const amount = Number(listing.price || 0);

    return `${currency} ${amount.toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function formatDate(date: string | null) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-GH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function statusStyle(status: string | null) {
    switch ((status || "").toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-blue-100 text-blue-800";
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              My Listings
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your advertisements and view their performance.
            </p>
          </div>

          <Link
            href="/sell"
            className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            + Post an Ad
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Listings</p>
            <p className="mt-1 text-2xl font-bold">{totalCount}</p>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Active Listings</p>
            <p className="mt-1 text-2xl font-bold text-green-700">
              {activeCount}
            </p>
          </div>

          <div className="col-span-2 rounded-xl border bg-white p-4 shadow-sm sm:col-span-1">
            <p className="text-sm text-gray-500">Top Priority Ads</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {listings.filter((listing) => listing.featured).length}
            </p>
          </div>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                filter === item.value
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-500"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
            Loading your listings...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={loadListings}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-white"
            >
              Try Again
            </button>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-xl border bg-white px-6 py-14 text-center shadow-sm">
            <div className="mb-3 text-4xl">📦</div>
            <h2 className="text-lg font-semibold">
              {listings.length === 0
                ? "You haven't posted any ads yet"
                : "No listings in this category"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              {listings.length === 0
                ? "Your advertisements will appear here after you publish them."
                : "Try selecting another filter to see your advertisements."}
            </p>

            {listings.length === 0 && (
              <Link
                href="/sell"
                className="mt-5 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
              >
                Post Your First Ad
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/dashboard/listings/${listing.id}`}
                className="group flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm transition hover:border-blue-400 hover:shadow-md sm:flex-row"
              >
                <div className="h-48 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-36 sm:w-44">
                  {listing.image_url ? (
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-gray-400">
                      📷
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="text-lg font-semibold group-hover:text-blue-700">
                        {listing.title}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(
                          listing.status
                        )}`}
                      >
                        {listing.status || "Unknown"}
                      </span>
                    </div>

                    <p className="mt-2 text-xl font-bold text-blue-800">
                      {formatPrice(listing)}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {listing.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                    <span>
                      {listing.category || "Uncategorised"}
                      {listing.subcategory
                        ? ` · ${listing.subcategory}`
                        : ""}
                    </span>
                    <span>{listing.location || "Location unavailable"}</span>
                    <span>Posted {formatDate(listing.created_at)}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {listing.featured ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        ⭐ Top Priority
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        Standard listing
                      </span>
                    )}

                    <span className="text-sm font-semibold text-blue-700">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={loadListings}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Refresh Listings
          </button>
        </div>
      </div>
    </main>
  );
}
