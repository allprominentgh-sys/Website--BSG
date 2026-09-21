"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Listing = {
  id: number | string;
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
  listing_id: number | string;
  image_url: string;
};

type ListingWithImage = Listing & {
  image_url?: string;
};

export default function ListingsPage() {
  const [listings, setListings] = useState<ListingWithImage[]>([]);
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
      const supabase = supabaseBrowser();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Please log in to view your listings.");
        setLoading(false);
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
        console.error("LISTINGS ERROR:", listingsError);
        setError(listingsError.message);
        setLoading(false);
        return;
      }

      const listingRows = (data || []) as Listing[];

      if (listingRows.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }

      const listingIds = listingRows.map((item) => item.id);

      const { data: imageRows, error: imagesError } = await supabase
        .from("listing_images")
        .select("listing_id, image_url")
        .in("listing_id", listingIds);

      if (imagesError) {
        console.error("LISTING IMAGES ERROR:", imagesError);
      }

      const images = (imageRows || []) as ListingImage[];

      const listingsWithImages = listingRows.map((listing) => {
        const firstImage = images.find(
          (image) =>
            String(image.listing_id) === String(listing.id)
        );

        return {
          ...listing,
          image_url: firstImage?.image_url,
        };
      });

      setListings(listingsWithImages);
    } catch (err) {
      console.error("LOAD LISTINGS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your listings."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredListings = listings.filter((listing) => {
    if (filter === "all") return true;

    return (
      String(listing.status || "").toLowerCase() ===
      filter.toLowerCase()
    );
  });

  const activeCount = listings.filter(
    (listing) =>
      String(listing.status || "").toLowerCase() === "active"
  ).length;

  const totalViews = 0;

  function formatPrice(listing: Listing) {
    const currency =
      listing.currency_code ||
      listing.currency ||
      "GHS";

    if (listing.price === null || listing.price === undefined) {
      return `${currency} —`;
    }

    return `${currency} ${Number(listing.price).toLocaleString(
      "en-GH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  }

  function formatDate(date: string | null) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-GH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function statusClass(status: string | null) {
    switch (String(status || "").toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "expired":
        return "bg-slate-200 text-slate-700";

      default:
        return "bg-blue-100 text-blue-700";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

          <Link href="/dashboard" className="block">
            <div className="text-xl font-black text-blue-700 sm:text-2xl">
              BEST SALES GHANA
            </div>

            <div className="text-sm font-medium text-slate-500">
              My Listings
            </div>
          </Link>

          <Link
            href="/sell"
            className="rounded-xl bg-blue-700 px-4 py-3 font-black text-white shadow-md transition hover:bg-blue-800 sm:px-5"
          >
            ➕ Post an Ad
          </Link>

        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* TITLE */}
        <div className="mb-8">

          <Link
            href="/dashboard"
            className="text-sm font-bold text-blue-700"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            My Listings
          </h1>

          <p className="mt-2 text-slate-500">
            View, manage and monitor your advertisements.
          </p>

        </div>

        {/* SUMMARY */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-bold text-slate-500">
              Total Listings
            </div>

            <div className="mt-3 text-3xl font-black">
              {listings.length}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-bold text-slate-500">
              Active Ads
            </div>

            <div className="mt-3 text-3xl font-black text-green-600">
              {activeCount}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-bold text-slate-500">
              Total Views
            </div>

            <div className="mt-3 text-3xl font-black">
              {totalViews}
            </div>
          </div>

          <Link
            href="/dashboard/promote"
            className="rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-500 p-6 text-white shadow-md transition hover:-translate-y-1"
          >
            <div className="text-sm font-bold text-blue-100">
              Advertising
            </div>

            <div className="mt-3 text-2xl font-black">
              ⭐ Promote Ads
            </div>

            <div className="mt-2 text-sm text-white/80">
              Increase your advertisement visibility →
            </div>
          </Link>

        </div>

        {/* FILTERS */}
        <div className="mt-8 overflow-x-auto rounded-2xl border bg-white p-4 shadow-sm">

          <div className="flex min-w-max gap-3">

            {[
              ["all", "All Listings"],
              ["active", "Active"],
              ["pending", "Pending"],
              ["rejected", "Rejected"],
              ["expired", "Expired"],
            ].map(([value, label]) => (

              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-xl px-5 py-3 font-bold transition ${
                  filter === value
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-blue-50"
                }`}
              >
                {label}
              </button>

            ))}

          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <div className="font-black">
              Unable to load listings
            </div>

            <div className="mt-1 text-sm">
              {error}
            </div>

            <button
              type="button"
              onClick={loadListings}
              className="mt-4 rounded-xl bg-red-600 px-5 py-3 font-bold text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="mt-6 rounded-2xl border bg-white p-10 text-center shadow-sm">

            <div className="text-4xl">
              ⏳
            </div>

            <h2 className="mt-4 text-xl font-black">
              Loading your listings...
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Connecting to your seller account.
            </p>

          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          filteredListings.length === 0 && (

            <div className="mt-6 rounded-2xl border bg-white p-10 text-center shadow-sm">

              <div className="text-5xl">
                📦
              </div>

              <h2 className="mt-4 text-2xl font-black">
                {listings.length === 0
                  ? "No listings yet"
                  : "No listings in this category"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-slate-500">
                {listings.length === 0
                  ? "Create your first advertisement and start selling on BEST SALES GHANA."
                  : "Try another filter to see your advertisements."}
              </p>

              {listings.length === 0 && (
                <Link
                  href="/sell"
                  className="mt-6 inline-flex rounded-xl bg-blue-700 px-7 py-4 font-black text-white shadow-md hover:bg-blue-800"
                >
                  ➕ Create Your First Listing
                </Link>
              )}

            </div>
          )}

        {/* REAL LISTINGS */}
        {!loading &&
          !error &&
          filteredListings.length > 0 && (

            <div className="mt-6 space-y-5">

              {filteredListings.map((listing) => (

                <Link
                  key={String(listing.id)}
                  href={`/dashboard/listings/${listing.id}`}
                  className="group block overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  <div className="flex flex-col md:flex-row">

                    {/* IMAGE */}
                    <div className="flex h-56 w-full shrink-0 items-center justify-center overflow-hidden bg-slate-100 md:h-auto md:w-64">

                      {listing.image_url ? (
                        <img
                          src={listing.image_url}
                          alt={listing.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-center">

                          <div className="text-5xl">
                            📦
                          </div>

                          <div className="mt-2 text-sm font-bold text-slate-400">
                            No image
                          </div>

                        </div>
                      )}

                    </div>

                    {/* DETAILS */}
                    <div className="min-w-0 flex-1 p-6">

                      <div className="flex flex-wrap items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h2 className="truncate text-xl font-black text-slate-900">
                            {listing.title}
                          </h2>

                          <div className="mt-2 flex flex-wrap gap-2">

                            {listing.category && (
                              <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                {listing.category}
                              </span>
                            )}

                            {listing.subcategory && (
                              <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                {listing.subcategory}
                              </span>
                            )}

                          </div>

                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-black uppercase ${statusClass(
                            listing.status
                          )}`}
                        >
                          {listing.status || "unknown"}
                        </span>

                      </div>

                      <div className="mt-5 text-2xl font-black text-blue-700">
                        {formatPrice(listing)}
                      </div>

                      {listing.location && (
                        <div className="mt-3 text-sm text-slate-500">
                          📍 {listing.location}
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">

                        <span>
                          👁️ 0 views
                        </span>

                        <span>
                          ❤️ 0 favourites
                        </span>

                        <span>
                          💬 0 messages
                        </span>

                        {listing.featured && (
                          <span className="font-black text-amber-600">
                            ⭐ Top Priority
                          </span>
                        )}

                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">

                        <span className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white">
                          View & Manage →
                        </span>

                        <span className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700">
                          {formatDate(listing.created_at)}
                        </span>

                      </div>

                    </div>

                  </div>

                </Link>

              ))}

            </div>
          )}

      </section>

      {/* FOOTER */}
      <footer className="mt-10 border-t bg-slate-950 py-10 text-center text-white">

        <div className="font-black">
          BEST SALES GHANA
        </div>

        <p className="mt-2 text-sm text-slate-400">
          Buy • Sell • Advertise • Connect
        </p>

        <p className="mt-5 text-xs text-slate-500">
          © 2026 All Prominent Ghana Limited. All rights reserved.
        </p>

      </footer>

    </main>
  );
}
