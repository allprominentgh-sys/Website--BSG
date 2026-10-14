
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

type ListingImage = {
  id: number;
  listing_id: number;
  image_url: string;
};

function formatPrice(
  price: number | null,
  currencyCode: string | null,
  currency: string | null
) {
  if (price === null) return "Price on request";

  const code = (currencyCode || currency || "GHS").toUpperCase();

  try {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${code} ${price.toLocaleString("en-GH")}`;
  }
}

export default function LatestListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [images, setImages] = useState<Record<number, string>>({});
  const [failedImages, setFailedImages] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      const db = supabaseBrowser();

      try {
        const { data, error } = await db
          .from("listings")
          .select(`
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
          `)
          .eq("status", "active")
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(12);

        if (error) throw error;
        if (cancelled) return;

        const loadedListings = (data || []) as Listing[];
        setListings(loadedListings);

        if (loadedListings.length === 0) return;

        const listingIds = loadedListings.map((item) => item.id);

        const { data: imageData, error: imageError } = await db
          .from("listing_images")
          .select("id,listing_id,image_url")
          .in("listing_id", listingIds)
          .order("id", { ascending: true });

        if (imageError) {
          console.warn("Could not load listing photos:", imageError.message);
          return;
        }

        if (cancelled) return;

        const firstImages: Record<number, string> = {};

        ((imageData || []) as ListingImage[]).forEach((image) => {
          if (
            image.image_url &&
            image.image_url.trim() &&
            !firstImages[image.listing_id]
          ) {
            firstImages[image.listing_id] = image.image_url;
          }
        });

        setImages(firstImages);
      } catch (error) {
        console.error("Unable to load homepage listings:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadListings();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="animate-pulse overflow-hidden rounded-xl bg-white"
          >
            <div className="aspect-square bg-slate-200" />
            <div className="space-y-3 p-3">
              <div className="h-4 rounded bg-slate-200" />
              <div className="h-4 w-2/3 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="text-5xl">🛍️</div>
        <h3 className="mt-4 text-lg font-bold text-slate-900">
          No active listings yet
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Products published by sellers will appear here.
        </p>
        <Link
          href="/listings"
          className="mt-5 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-bold text-white"
        >
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3">
      {listings.map((listing) => {
        const location =
          [
            listing.item_area,
            listing.item_city,
            listing.item_region,
          ]
            .filter(Boolean)
            .join(", ") || listing.location;

        const photo = images[listing.id];
        const photoFailed = failedImages.includes(listing.id);

        return (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="group min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-300 hover:shadow-md"
          >
            <div className="relative aspect-square overflow-hidden bg-slate-100">
              {photo && !photoFailed ? (
                <img
                  src={photo}
                  alt={listing.title || "Marketplace product"}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  onError={() =>
                    setFailedImages((previous) =>
                      previous.includes(listing.id)
                        ? previous
                        : [...previous, listing.id]
                    )
                  }
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100">
                  <span className="text-5xl">🛍️</span>
                </div>
              )}

              {listing.featured && (
                <span className="absolute left-2 top-2 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-900 shadow-sm">
                  ⭐ PRIORITY
                </span>
              )}
            </div>

            <div className="p-2.5 sm:p-4">
              <p className="line-clamp-1 text-base font-black text-emerald-600 sm:text-lg">
                {formatPrice(
                  listing.price,
                  listing.currency_code,
                  listing.currency
                )}
              </p>

              <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-800 sm:text-base">
                {listing.title || "Untitled Listing"}
              </h3>

              {location && (
                <p className="mt-2 line-clamp-1 text-xs text-slate-500 sm:text-sm">
                  📍 {location}
                </p>
              )}

              {listing.category && (
                <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                  {listing.category}
                  {listing.subcategory
                    ? ` · ${listing.subcategory}`
                    : ""}
                </p>
              )}

              <div className="mt-3 border-t border-slate-100 pt-2 text-center text-xs font-bold text-blue-700 sm:text-sm">
                View product →
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
