"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Listing = {
  id: number | string;
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
};

type ListingImage = {
  id?: number | string;
  listing_id: number | string;
  image_url: string;
};

export default function ListingDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const listingId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [listing, setListing] = useState<Listing | null>(null);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (listingId) {
      loadListing();
    }
  }, [listingId]);

  async function loadListing() {
    setLoading(true);
    setError("");

    try {
      const supabase = supabaseBrowser();

      // ---------------------------------------------
      // CHECK LOGIN
      // ---------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Please log in to view this advertisement.");
        setLoading(false);
        return;
      }

      // ---------------------------------------------
      // LOAD LISTING
      // ---------------------------------------------

      const {
        data: listingData,
        error: listingError,
      } = await supabase
        .from("listings")
        .select(
          `
            id,
            seller_id,
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
        .eq("id", listingId)
        .eq("seller_id", user.id)
        .single();

      if (listingError) {
        console.error(
          "LISTING DETAILS ERROR:",
          listingError
        );

        setError(
          listingError.message ||
            "Advertisement could not be found."
        );

        setLoading(false);
        return;
      }

      setListing(listingData as Listing);

      // ---------------------------------------------
      // LOAD IMAGES
      // ---------------------------------------------

      const {
        data: imageData,
        error: imageError,
      } = await supabase
        .from("listing_images")
        .select("id, listing_id, image_url")
        .eq("listing_id", listingId);

      if (imageError) {
        console.error(
          "LISTING IMAGE ERROR:",
          imageError
        );
      }

      setImages((imageData || []) as ListingImage[]);
    } catch (err) {
      console.error(
        "LOAD LISTING ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load advertisement."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteListing() {
    if (!listing) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this advertisement? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      const supabase = supabaseBrowser();

      // ---------------------------------------------
      // CHECK LOGIN
      // ---------------------------------------------

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in again.");
        setDeleting(false);
        return;
      }

      // ---------------------------------------------
      // DELETE LISTING
      // ---------------------------------------------

      const {
        error: deleteError,
      } = await supabase
        .from("listings")
        .delete()
        .eq("id", listing.id)
        .eq("seller_id", user.id);

      if (deleteError) {
        console.error(
          "DELETE LISTING ERROR:",
          deleteError
        );

        alert(
          `Unable to delete advertisement: ${deleteError.message}`
        );

        setDeleting(false);
        return;
      }

      alert("Advertisement deleted successfully.");

      router.push("/dashboard/listings");
      router.refresh();
    } catch (err) {
      console.error(
        "DELETE ERROR:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Unable to delete advertisement."
      );

      setDeleting(false);
    }
  }

  function formatPrice() {
    if (!listing) return "";

    const currency =
      listing.currency_code ||
      listing.currency ||
      "GHS";

    if (
      listing.price === null ||
      listing.price === undefined
    ) {
      return `${currency} —`;
    }

    return `${currency} ${Number(
      listing.price
    ).toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function formatDate() {
    if (!listing?.created_at) {
      return "";
    }

    return new Date(
      listing.created_at
    ).toLocaleDateString("en-GH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function statusClass() {
    const status =
      String(
        listing?.status || ""
      ).toLowerCase();

    if (status === "active") {
      return "bg-green-100 text-green-700";
    }

    if (status === "pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    if (status === "expired") {
      return "bg-slate-200 text-slate-700";
    }

    return "bg-blue-100 text-blue-700";
  }

  // ---------------------------------------------
  // LOADING
  // ---------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">

        <div className="flex min-h-screen items-center justify-center px-6">

          <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">

            <div className="text-5xl">
              ⏳
            </div>

            <h1 className="mt-4 text-2xl font-black">
              Loading advertisement...
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please wait while we retrieve your listing.
            </p>

          </div>

        </div>

      </main>
    );
  }

  // ---------------------------------------------
  // ERROR
  // ---------------------------------------------

  if (error || !listing) {
    return (
      <main className="min-h-screen bg-slate-50">

        <header className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

            <Link
              href="/dashboard/listings"
              className="text-xl font-black text-blue-700"
            >
              BEST SALES GHANA
            </Link>

          </div>
        </header>

        <section className="mx-auto max-w-2xl px-4 py-16 text-center">

          <div className="text-6xl">
            😕
          </div>

          <h1 className="mt-5 text-3xl font-black">
            Advertisement not found
          </h1>

          <p className="mt-3 text-slate-500">
            {error ||
              "This advertisement could not be found or you do not have access to it."}
          </p>

          <Link
            href="/dashboard/listings"
            className="mt-7 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-black text-white"
          >
            ← Back to My Listings
          </Link>

        </section>

      </main>
    );
  }

  // ---------------------------------------------
  // PAGE
  // ---------------------------------------------

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}

      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

          <Link
            href="/dashboard/listings"
            className="block"
          >
            <div className="text-xl font-black text-blue-700">
              BEST SALES GHANA
            </div>

            <div className="text-sm font-medium text-slate-500">
              Advertisement Details
            </div>
          </Link>

          <Link
            href="/sell"
            className="rounded-xl bg-blue-700 px-4 py-3 font-black text-white shadow-md hover:bg-blue-800"
          >
            ➕ Post an Ad
          </Link>

        </div>

      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* BACK */}

        <Link
          href="/dashboard/listings"
          className="text-sm font-black text-blue-700"
        >
          ← Back to My Listings
        </Link>

        {/* TITLE */}

        <div className="mt-6">

          <div className="flex flex-wrap items-start justify-between gap-4">

            <div>

              <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                My Advertisement
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                {listing.title}
              </h1>

            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm font-black uppercase ${statusClass()}`}
            >
              {listing.status || "Unknown"}
            </span>

          </div>

        </div>

        {/* MAIN GRID */}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* MEDIA */}

          <div className="lg:col-span-2">

            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">

              {images.length > 0 ? (

                <div className="grid gap-3 p-3 sm:grid-cols-2">

                  {images.map((image, index) => (

                    <div
                      key={`${image.image_url}-${index}`}
                      className={`overflow-hidden rounded-2xl bg-slate-100 ${
                        index === 0
                          ? "sm:col-span-2"
                          : ""
                      }`}
                    >

                      <img
                        src={image.image_url}
                        alt={`${listing.title} ${index + 1}`}
                        className={`w-full object-cover ${
                          index === 0
                            ? "max-h-[520px]"
                            : "h-64"
                        }`}
                      />

                    </div>

                  ))}

                </div>

              ) : (

                <div className="flex min-h-[350px] items-center justify-center bg-slate-100">

                  <div className="text-center">

                    <div className="text-7xl">
                      📦
                    </div>

                    <p className="mt-4 font-bold text-slate-500">
                      No photos uploaded
                    </p>

                  </div>

                </div>

              )}

            </div>

          </div>

          {/* SUMMARY */}

          <div className="space-y-5">

            {/* PRICE */}

            <div className="rounded-3xl border bg-white p-6 shadow-sm">

              <p className="text-sm font-bold text-slate-500">
                Asking Price
              </p>

              <div className="mt-2 text-3xl font-black text-blue-700">
                {formatPrice()}
              </div>

              {listing.featured && (
                <div className="mt-4 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-amber-700">
                  ⭐ Top Priority
                </div>
              )}

            </div>

            {/* QUICK STATS */}

            <div className="rounded-3xl border bg-white p-6 shadow-sm">

              <h2 className="text-lg font-black">
                Advertisement Performance
              </h2>

              <div className="mt-5 grid grid-cols-3 gap-3">

                <div className="rounded-xl bg-slate-50 p-4 text-center">

                  <div className="text-2xl">
                    👁️
                  </div>

                  <div className="mt-2 text-xl font-black">
                    0
                  </div>

                  <div className="text-xs text-slate-500">
                    Views
                  </div>

                </div>

                <div className="rounded-xl bg-slate-50 p-4 text-center">

                  <div className="text-2xl">
                    ❤️
                  </div>

                  <div className="mt-2 text-xl font-black">
                    0
                  </div>

                  <div className="text-xs text-slate-500">
                    Favourites
                  </div>

                </div>

                <div className="rounded-xl bg-slate-50 p-4 text-center">

                  <div className="text-2xl">
                    💬
                  </div>

                  <div className="mt-2 text-xl font-black">
                    0
                  </div>

                  <div className="text-xs text-slate-500">
                    Messages
                  </div>

                </div>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="rounded-3xl border bg-white p-6 shadow-sm">

              <h2 className="text-lg font-black">
                Manage Advertisement
              </h2>

              <div className="mt-5 space-y-3">

                <Link
                  href={`/dashboard/listings/${listing.id}/edit`}
                  className="flex w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3 font-black text-white hover:bg-blue-800"
                >
                  ✏️ Edit Advertisement
                </Link>

                <Link
                  href="/dashboard/promote"
                  className="flex w-full items-center justify-center rounded-xl border border-amber-400 bg-amber-50 px-5 py-3 font-black text-amber-700 hover:bg-amber-100"
                >
                  ⭐ Promote Advertisement
                </Link>

                <Link
                  href="/dashboard/analytics"
                  className="flex w-full items-center justify-center rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700 hover:bg-slate-200"
                >
                  📊 View Analytics
                </Link>

                <button
                  type="button"
                  onClick={deleteListing}
                  disabled={deleting}
                  className="w-full rounded-xl bg-red-50 px-5 py-3 font-black text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting
                    ? "Deleting..."
                    : "🗑️ Delete Advertisement"}
                </button>

              </div>

            </div>

          </div>

        </div>

        {/* DETAILS */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* DESCRIPTION */}

          <div className="rounded-3xl border bg-white p-6 shadow-sm lg:col-span-2">

            <h2 className="text-2xl font-black">
              Advertisement Details
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Category
                </div>

                <div className="mt-1 font-bold">
                  {listing.category || "—"}
                </div>
              </div>

              <div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Subcategory
                </div>

                <div className="mt-1 font-bold">
                  {listing.subcategory || "—"}
                </div>
              </div>

              <div className="sm:col-span-2">

                <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Location
                </div>

                <div className="mt-1 font-bold">
                  📍 {listing.location || "—"}
                </div>

              </div>

              <div className="sm:col-span-2">

                <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Date Published
                </div>

                <div className="mt-1 font-bold">
                  {formatDate()}
                </div>

              </div>

            </div>

            <div className="mt-8 border-t pt-6">

              <h3 className="text-lg font-black">
                Description
              </h3>

              <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
                {listing.description || "No description provided."}
              </p>

            </div>

          </div>

          {/* STATUS */}

          <div className="rounded-3xl border bg-white p-6 shadow-sm">

            <h2 className="text-xl font-black">
              Advertisement Status
            </h2>

            <div className="mt-5 rounded-2xl bg-slate-50 p-5">

              <div className="text-sm font-bold text-slate-500">
                Current status
              </div>

              <div className="mt-3">

                <span
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-black uppercase ${statusClass()}`}
                >
                  {listing.status || "Unknown"}
                </span>

              </div>

            </div>

            <div className="mt-5 rounded-2xl bg-blue-50 p-5">

              <div className="text-2xl">
                📢
              </div>

              <h3 className="mt-3 font-black">
                Want more customers?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Promote your advertisement to increase its visibility.
              </p>

              <Link
                href="/dashboard/promote"
                className="mt-4 inline-flex rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white"
              >
                ⭐ Promote Ad
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="mt-10 bg-slate-950 py-10 text-center text-white">

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
