"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/supabase-browser";

type Listing = {
  id: number;
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
  seller_id: string;
};

type ListingImage = {
  id: number;
  listing_id: number;
  image_url: string;
};

export default function ProductPage() {
  const params = useParams();
  const supabase = supabaseBrowser();

  const [listing, setListing] = useState<Listing | null>(null);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadListing();
  }, []);

  async function loadListing() {
    setLoading(true);
    setError("");

    const listingId = Number(params.id);

    if (!Number.isInteger(listingId)) {
      setError("Invalid listing.");
      setLoading(false);
      return;
    }

    try {
      /*
       * GET LISTING
       */
      const { data, error: listingError } = await supabase
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
            created_at,
            seller_id
          `
        )
        .eq("id", listingId)
        .maybeSingle();

      if (listingError) {
        throw listingError;
      }

      if (!data) {
        setListing(null);
        setLoading(false);
        return;
      }

      setListing(data);

      /*
       * GET LISTING IMAGES
       */
      const { data: imageData, error: imageError } = await supabase
        .from("listing_images")
        .select("id, listing_id, image_url")
        .eq("listing_id", listingId)
        .order("id", { ascending: true });

      if (!imageError) {
        setImages(imageData || []);
      }

      /*
       * RECORD LISTING VIEW
       *
       * This does not stop the listing from loading
       * if the tracking insert is rejected by RLS.
       */
      let viewerId: string | null = null;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        viewerId = user.id;
      }

      const { error: eventError } = await supabase
        .from("ad_events")
        .insert({
          ad_id: listingId,
          event_type: "VIEW",
          viewer_id: viewerId,
        });

      if (eventError) {
        console.warn(
          "Listing view could not be recorded:",
          eventError.message
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unable to load this listing.");
    } finally {
      setLoading(false);
    }
  }

  function formatPrice() {
    if (!listing || listing.price === null) {
      return "Price not set";
    }

    const currency =
      listing.currency_code ||
      listing.currency ||
      "GHS";

    try {
      return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(Number(listing.price));
    } catch {
      return `${currency} ${Number(
        listing.price
      ).toLocaleString()}`;
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="text-5xl">📦</div>

            <p className="mt-4 font-semibold text-slate-600">
              Loading listing...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div className="text-5xl">⚠️</div>

          <h1 className="mt-5 text-2xl font-black text-slate-900">
            Unable to load listing
          </h1>

          <p className="mt-3 text-slate-500">
            {error}
          </p>

          <Link
            href="/listings"
            className="mt-6 inline-block rounded-xl bg-blue-700 px-6 py-3 font-bold text-white"
          >
            ← Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div className="text-5xl">🔎</div>

          <h1 className="mt-5 text-2xl font-black text-slate-900">
            Listing not found
          </h1>

          <p className="mt-3 text-slate-500">
            This listing may have been removed or is no
            longer available.
          </p>

          <Link
            href="/listings"
            className="mt-6 inline-block rounded-xl bg-blue-700 px-6 py-3 font-bold text-white"
          >
            ← Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const mainImage = images[0]?.image_url;

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/listings"
            className="font-bold text-blue-700"
          >
            ← Back to Marketplace
          </Link>

          <Link
            href="/sell"
            className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
          >
            Post an Ad
          </Link>
        </div>
      </header>

      {/* LISTING */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="grid gap-8 lg:grid-cols-2">

          {/* IMAGE */}

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="flex min-h-[420px] items-center justify-center bg-slate-100">

              {mainImage ? (
                <img
                  src={mainImage}
                  alt={listing.title}
                  className="h-full max-h-[600px] w-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <div className="text-8xl">📦</div>

                  <p className="mt-4 text-sm font-semibold text-slate-400">
                    No image available
                  </p>
                </div>
              )}

            </div>

            {/* ADDITIONAL IMAGES */}

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 p-3">
                {images.slice(0, 8).map((image) => (
                  <div
                    key={image.id}
                    className="h-20 overflow-hidden rounded-lg bg-slate-100"
                  >
                    <img
                      src={image.image_url}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* DETAILS */}

          <div>

            {listing.featured && (
              <div className="mb-4 inline-flex rounded-full bg-purple-600 px-4 py-2 text-sm font-black text-white">
                ⭐ TOP PRIORITY
              </div>
            )}

            {listing.status && (
              <div className="mb-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    listing.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {listing.status}
                </span>
              </div>
            )}

            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              {listing.category || "Marketplace"}
            </p>

            <h1 className="mt-3 text-4xl font-black text-slate-900">
              {listing.title}
            </h1>

            {listing.subcategory && (
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {listing.subcategory}
              </p>
            )}

            <div className="mt-6 text-3xl font-black text-blue-700">
              {formatPrice()}
            </div>

            {listing.location && (
              <div className="mt-3 text-slate-600">
                📍 {listing.location}
              </div>
            )}

            {/* ACTIONS */}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">

              <Link
                href={`/chat?listing=${listing.id}`}
                className="rounded-xl bg-blue-700 px-5 py-4 text-center font-black text-white hover:bg-blue-800"
              >
                💬 Contact Seller
              </Link>

              <button
                type="button"
                className="rounded-xl border border-blue-700 bg-white px-5 py-4 font-black text-blue-700 hover:bg-blue-50"
                onClick={async () => {
                  const {
                    data: { user },
                  } = await supabase.auth.getUser();

                  if (!user) {
                    window.location.href = "/login";
                    return;
                  }

                  const { error } = await supabase
                    .from("favorites")
                    .upsert(
                      {
                        user_id: user.id,
                        listing_id: listing.id,
                      },
                      {
                        onConflict:
                          "user_id,listing_id",
                      }
                    );

                  if (error) {
                    alert(
                      "Unable to save this listing."
                    );
                    return;
                  }

                  alert("Listing saved to your favourites.");
                }}
              >
                ♡ Save Listing
              </button>

            </div>

            {/* SAFETY */}

            <div className="mt-8 rounded-2xl bg-blue-50 p-5">
              <h3 className="font-black text-slate-900">
                🛡️ Shop safely
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Verify the item and seller before making
                payment. Never share sensitive account
                information with another person.
              </p>
            </div>

          </div>
        </div>

        {/* DESCRIPTION */}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_350px]">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              About this listing
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-900">
              Description
            </h2>

            <p className="mt-5 whitespace-pre-wrap leading-8 text-slate-600">
              {listing.description ||
                "The seller has not provided a description."}
            </p>

          </div>

          {/* DELIVERY */}

          <div className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">

            <div className="text-4xl">🚚</div>

            <h2 className="mt-4 text-2xl font-black">
              Delivery
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Delivery options can be arranged between
              the buyer and seller. BEST SALES GHANA
              tracked delivery can be connected to the
              marketplace delivery system.
            </p>

            <div className="mt-6 rounded-xl bg-white/10 p-4">
              <p className="text-sm font-bold">
                📍 Location
              </p>

              <p className="mt-1 text-sm text-slate-300">
                {listing.location || "Location not provided"}
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="mt-10 bg-slate-950 py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">

          <div className="text-xl font-black">
            BEST SALES GHANA
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Buy • Sell • Advertise • Connect
          </p>

          <p className="mt-6 text-sm text-slate-500">
            © 2026 All Prominent Ghana Limited. All rights reserved.
          </p>

        </div>
      </footer>

    </main>
  );
}
