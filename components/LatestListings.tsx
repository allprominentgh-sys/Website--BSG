
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/supabase-browser";

type Listing = {
  id: number;
  title: string | null;
  description: string | null;
  price: number | null;
  currency_code: string | null;
  currency: string | null;
  category: string | null;
  subcategory: string | null;
  location: string | null;
  item_region: string | null;
  item_city: string | null;
  item_area: string | null;
  featured: boolean | null;
  created_at: string | null;
};

function formatPrice(
  price: number | null,
  currencyCode: string | null,
  currency: string | null
) {
  if (price === null) return "Price on request";

  const code = currencyCode || currency || "GHS";

  try {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${code} ${price.toLocaleString()}`;
  }
}

export default function LatestListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListings() {
      try {
        const db = supabaseBrowser() as any;

        const { data, error } = await db
          .from("listings")
          .select(
            `
            id,
            title,
            description,
            price,
            currency_code,
            currency,
            category,
            subcategory,
            location,
            item_region,
            item_city,
            item_area,
            featured,
            created_at
            `
          )
          .eq("status", "active")
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(12);

        if (error) {
          console.error("Homepage listings error:", error);
          return;
        }

        setListings((data || []) as Listing[]);
      } catch (error) {
        console.error("Unable to load homepage listings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
        <p className="mt-4 text-gray-600">
          Loading latest products...
        </p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <div className="text-5xl">🛍️</div>
        <h3 className="mt-4 text-xl font-bold text-gray-900">
          No active listings yet
        </h3>
        <p className="mt-2 text-gray-600">
          Products published by sellers will appear here.
        </p>
        <Link
          href="/listings"
          className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
        >
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <article
          key={listing.id}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
            <span className="text-6xl">🛍️</span>
          </div>

          <div className="p-5">
            {listing.featured && (
              <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                TOP PRIORITY
              </span>
            )}

            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-blue-700">
              {listing.category || "Marketplace"}
              {listing.subcategory
                ? ` • ${listing.subcategory}`
                : ""}
            </p>

            <h3 className="mt-2 line-clamp-2 text-xl font-black text-slate-900">
              {listing.title || "Untitled Listing"}
            </h3>

            <p className="mt-2 line-clamp-2 text-sm text-slate-500">
              {listing.description || "No description provided."}
            </p>

            <div className="mt-4 text-xl font-black text-blue-700">
              {formatPrice(
                listing.price,
                listing.currency_code,
                listing.currency
              )}
            </div>

            {(listing.item_area ||
              listing.item_city ||
              listing.item_region ||
              listing.location) && (
              <p className="mt-3 text-sm text-gray-500">
                📍{" "}
                {[
                  listing.item_area,
                  listing.item_city,
                  listing.item_region,
                ]
                  .filter(Boolean)
                  .join(", ") || listing.location}
              </p>
            )}

            <Link
              href={`/listings/${listing.id}`}
              className="mt-5 block rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800"
            >
              View Listing
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
