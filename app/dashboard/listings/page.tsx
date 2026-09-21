"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Listing = {
  id: string;
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
};

type ListingImage = {
  listing_id: string;
  image_url: string;
};

export default function MyListingsPage() {
  const supabase = supabaseBrowser();

  const [listings, setListings] = useState<Listing[]>([]);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data, error: listingsError } = await supabase
        .from("listings")
        .select(
          `
            id,
            title,
            description,
            price,
            currency_code,
            currency,
            location,
            status,
            featured,
            category,
            subcategory,
            created_at
          `
        )
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (listingsError) {
        throw listingsError;
      }

      const listingData = data || [];

      setListings(listingData);

      if (listingData.length > 0) {
        const ids = listingData.map((listing) => listing.id);

        const { data: imageData, error: imageError } = await supabase
          .from("listing_images")
          .select("listing_id, image_url")
          .in("listing_id", ids);

        if (!imageError) {
          setImages(imageData || []);
        }
      } else {
        setImages([]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unable to load your listings.");
    } finally {
      setLoading(false);
    }
  }

  function getImage(listingId: string) {
    return images.find((image) => image.listing_id === listingId)?.image_url;
  }

  function formatPrice(listing: Listing) {
    const currency = listing.currency_code || listing.currency || "GHS";

    if (listing.price === null || listing.price === undefined) {
      return "Price not set";
    }

    try {
      return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(Number(listing.price));
    } catch {
      return `${currency} ${Number(listing.price).toLocaleString()}`;
    }
  }

  const filteredListings = listings.filter((listing) => {
    if (filter === "all") return true;

    return (listing.status || "").toLowerCase() === filter;
  });

  const activeCount = listings.filter(
    (listing) => (listing.status || "").toLowerCase() === "active"
  ).length;

  const pendingCount = listings.filter(
    (listing) => (listing.status || "").toLowerCase() === "pending"
  ).length;

  const featuredCount = listings.filter(
    (listing) => listing.featured === true
  ).length;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-500 hover:text-blue-600"
            >
              ← Dashboard
            </Link>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              My Listings
            </h1>

            <p className="text-sm text-gray-500">
              Manage and monitor your advertisements.
            </p>
          </div>

          <Link
            href="/sell"
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Post an Ad
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Listings</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {listings.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Active</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {activeCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="mt-2 text-3xl font-bold text-orange-500">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Top Priority</p>
            <p className="mt-2 text-3xl font-bold text-purple-600">
              {featuredCount}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            ["all", "All Listings"],
            ["active", "Active"],
            ["pending", "Pending"],
            ["rejected", "Rejected"],
            ["expired", "Expired"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filter === value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 shadow-sm hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="py-16 text-center text-gray-500">
            Loading your listings...
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filteredListings.length === 0 && (
          <div className="mt-8 rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-5xl">📦</div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {listings.length === 0
                ? "No listings yet"
                : "No listings match this filter"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              {listings.length === 0
                ? "Post your first advertisement and it will appear here."
                : "Try selecting another listing status."}
            </p>

            {listings.length === 0 && (
              <Link
                href="/sell"
                className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Post Your First Ad
              </Link>
            )}
          </div>
        )}

        {/* LISTINGS */}
        {!loading && filteredListings.length > 0 && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => {
              const image = getImage(listing.id);

              return (
                <Link
                  key={listing.id}
                  href={`/dashboard/listings/${listing.id}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* IMAGE */}
                  <div className="relative h-52 bg-gray-100">
                    {image ? (
                      <img
                        src={image}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">
                        📦
                      </div>
                    )}

                    {/* STATUS */}
                    <div className="absolute left-3 top-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          listing.status === "active"
                            ? "bg-green-100 text-green-700"
                            : listing.status === "pending"
                              ? "bg-orange-100 text-orange-700"
                              : listing.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {listing.status || "unknown"}
                      </span>
                    </div>

                    {/* TOP PRIORITY */}
                    {listing.featured && (
                      <div className="absolute right-3 top-3">
                        <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white">
                          ⭐ Top Priority
                        </span>
                      </div>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="p-5">
                    <h2 className="line-clamp-2 text-lg font-bold text-gray-900 group-hover:text-blue-600">
                      {listing.title}
                    </h2>

                    <p className="mt-2 text-xl font-bold text-blue-600">
                      {formatPrice(listing)}
                    </p>

                    <div className="mt-3 space-y-1 text-sm text-gray-500">
                      {listing.category && (
                        <p>
                          <span className="font-medium text-gray-700">
                            Category:
                          </span>{" "}
                          {listing.category}
                        </p>
                      )}

                      {listing.subcategory && (
                        <p>
                          <span className="font-medium text-gray-700">
                            Subcategory:
                          </span>{" "}
                          {listing.subcategory}
                        </p>
                      )}

                      {listing.location && (
                        <p>
                          <span className="font-medium text-gray-700">
                            Location:
                          </span>{" "}
                          {listing.location}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t pt-4">
                      <span className="text-sm font-medium text-gray-500">
                        View Ad Details
                      </span>

                      <span className="text-blue-600">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
