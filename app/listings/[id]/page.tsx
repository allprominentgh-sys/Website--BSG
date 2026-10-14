
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

type Currency = {
  code: string;
  name: string | null;
  symbol: string | null;
  manual_rate_from_ghs: number | null;
};

type SellerProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  verified: boolean | null;
  account_type: string | null;
};

export default function ProductPage() {
  const params = useParams();
  const supabase = supabaseBrowser();

  const [listing, setListing] = useState<Listing | null>(null);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [seller, setSeller] = useState<SellerProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [displayCurrency, setDisplayCurrency] = useState("GHS");
  const [isFavourite, setIsFavourite] = useState(false);
  const [savingFavourite, setSavingFavourite] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [reporting, setReporting] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [viewerOpen, setViewerOpen] = useState(false);

  const imageUrl = images[selectedImage]?.image_url;
  const currentImageFailed = Boolean(imageErrors[selectedImage]);

  useEffect(() => {
    let cancelled = false;

    async function loadListing() {
      setLoading(true);
      setError("");

      const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
      const listingId = Number(rawId);

      if (!rawId || !Number.isInteger(listingId) || listingId <= 0) {
        setError("Invalid listing.");
        setLoading(false);
        return;
      }

      try {
        const { data, error: listingError } = await supabase
          .from("listings")
          .select(`
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
          `)
          .eq("id", listingId)
          .maybeSingle();

        if (listingError) throw listingError;
        if (cancelled) return;

        if (!data) {
          setListing(null);
          setLoading(false);
          return;
        }

        setListing(data as Listing);

        const { data: imageData, error: imageError } = await supabase
          .from("listing_images")
          .select("id,listing_id,image_url")
          .eq("listing_id", listingId)
          .order("id", { ascending: true });

        if (!cancelled && !imageError) {
          const validImages = ((imageData || []) as ListingImage[]).filter(
            (image) =>
              typeof image.image_url === "string" &&
              image.image_url.trim().length > 0,
          );

          setImages(validImages);
          setSelectedImage(0);
          setImageErrors({});
        } else if (imageError) {
          console.warn("Could not load listing images:", imageError.message);
        }

        const { data: currencyData, error: currencyError } = await supabase
          .from("currencies")
          .select("code,name,symbol,manual_rate_from_ghs")
          .in("code", ["GHS", "USD", "CNY", "EUR", "GBP"]);

        if (!cancelled && !currencyError) {
          setCurrencies((currencyData || []) as Currency[]);
        }

        if (data.seller_id) {
          const { data: sellerData, error: sellerError } = await supabase
            .from("profiles")
            .select(`
              id,
              full_name,
              phone,
              location,
              avatar_url,
              verified,
              account_type
            `)
            .eq("id", data.seller_id)
            .maybeSingle();

          if (!cancelled && !sellerError) {
            setSeller(sellerData as SellerProfile | null);
          }
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (user) {
          const { data: favouriteData } = await supabase
            .from("favorites")
            .select("listing_id")
            .eq("user_id", user.id)
            .eq("listing_id", listingId)
            .maybeSingle();

          if (!cancelled) {
            setIsFavourite(Boolean(favouriteData));
          }
        }

        const { error: eventError } = await supabase
          .from("ad_events")
          .insert({
            ad_id: listingId,
            event_type: "VIEW",
            viewer_id: user?.id || null,
          });

        if (eventError) {
          console.warn(
            "Listing view could not be recorded:",
            eventError.message,
          );
        }
      } catch (err: unknown) {
        console.error(err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load this listing.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadListing();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  function getCurrency(code: string) {
    return currencies.find((currency) => currency.code === code);
  }

  function getSymbol(code: string) {
    const currency = getCurrency(code);

    if (currency?.symbol) return currency.symbol;
    if (code === "GHS") return "GH₵";
    if (code === "USD") return "$";
    if (code === "CNY") return "¥";
    if (code === "EUR") return "€";
    if (code === "GBP") return "£";

    return code;
  }

  function convertPrice(amount: number, fromCode: string, toCode: string) {
    if (fromCode === toCode) return amount;

    const source = getCurrency(fromCode);
    const target = getCurrency(toCode);

    if (fromCode === "GHS") {
      if (!target?.manual_rate_from_ghs) return null;
      return amount * target.manual_rate_from_ghs;
    }

    if (toCode === "GHS") {
      if (!source?.manual_rate_from_ghs) return null;
      return amount / source.manual_rate_from_ghs;
    }

    if (
      !source?.manual_rate_from_ghs ||
      !target?.manual_rate_from_ghs
    ) {
      return null;
    }

    return (
      (amount / source.manual_rate_from_ghs) *
      target.manual_rate_from_ghs
    );
  }

  function formatAmount(amount: number, currencyCode: string) {
    return `${getSymbol(currencyCode)} ${amount.toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function originalCurrency() {
    return (
      listing?.currency_code ||
      listing?.currency ||
      "GHS"
    ).toUpperCase();
  }

  function convertedListingPrice() {
    if (!listing || listing.price === null) return null;

    return convertPrice(
      Number(listing.price),
      originalCurrency(),
      displayCurrency,
    );
  }

  function changeImage(direction: number) {
    if (images.length < 2) return;

    setSelectedImage((current) => {
      return (current + direction + images.length) % images.length;
    });
  }

  async function contactSeller() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href =
        `/login?error=login_required&next=${encodeURIComponent(
          `/listings/${listing?.id}`,
        )}`;
      return;
    }

    if (!listing) return;

    window.location.href = `/chat?listing=${listing.id}`;
  }

  async function toggleFavourite() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href =
        `/login?error=login_required&next=${encodeURIComponent(
          `/listings/${listing?.id}`,
        )}`;
      return;
    }

    if (!listing) return;

    setSavingFavourite(true);

    try {
      if (isFavourite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listing.id);

        if (error) throw error;
        setIsFavourite(false);
      } else {
        const { error } = await supabase
          .from("favorites")
          .upsert(
            {
              user_id: user.id,
              listing_id: listing.id,
            },
            { onConflict: "user_id,listing_id" },
          );

        if (error) throw error;
        setIsFavourite(true);
      }
    } catch (err) {
      console.error(err);
      alert("Unable to update your favourites.");
    } finally {
      setSavingFavourite(false);
    }
  }

  async function shareListing() {
    if (!listing) return;

    setSharing(true);

    try {
      const url = window.location.href;

      if (navigator.share) {
        await navigator.share({
          title: listing.title,
          text: `Check out this listing on BEST SALES GHANA: ${listing.title}`,
          url,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert("Listing link copied.");
      } else {
        window.prompt("Copy this listing link:", url);
      }
    } catch {
      // Sharing may be cancelled by the user.
    } finally {
      setSharing(false);
    }
  }

  async function reportListing() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href =
        `/login?error=login_required&next=${encodeURIComponent(
          `/listings/${listing?.id}`,
        )}`;
      return;
    }

    if (!listing) return;

    const reason = window.prompt("Why are you reporting this listing?");
    if (!reason?.trim()) return;

    setReporting(true);

    try {
      const { error } = await supabase.from("ad_events").insert({
        ad_id: listing.id,
        event_type: "REPORT",
        viewer_id: user.id,
      });

      if (error) throw error;

      alert(
        "Your report event has been recorded. Note that this does not yet save the report reason for administrator review.",
      );
    } catch (err) {
      console.error(err);
      alert("Unable to submit the report.");
    } finally {
      setReporting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-5xl">📦</div>
          <p className="mt-4 font-semibold text-slate-600">
            Loading listing...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-20 text-center">
        <div className="text-5xl">⚠️</div>
        <h1 className="mt-5 text-2xl font-black text-slate-900">
          Unable to load listing
        </h1>
        <p className="mt-3 text-slate-500">{error}</p>
        <Link
          href="/listings"
          className="mt-6 inline-block rounded-xl bg-blue-700 px-6 py-3 font-bold text-white"
        >
          ← Back to Marketplace
        </Link>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-20 text-center">
        <div className="text-5xl">🔎</div>
        <h1 className="mt-5 text-2xl font-black text-slate-900">
          Listing not found
        </h1>
        <p className="mt-3 text-slate-500">
          This listing may have been removed or is no longer available.
        </p>
        <Link
          href="/listings"
          className="mt-6 inline-block rounded-xl bg-blue-700 px-6 py-3 font-bold text-white"
        >
          ← Back to Marketplace
        </Link>
      </main>
    );
  }

  const convertedPrice = convertedListingPrice();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/listings"
            className="font-bold text-blue-700"
          >
            ← Back to Marketplace
          </Link>

          <Link
            href="/post-ad"
            className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
          >
            Post an Ad
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* PRODUCT PHOTO GALLERY */}
          <div className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative flex min-h-[320px] items-center justify-center bg-slate-100 sm:min-h-[480px]">
              {imageUrl && !currentImageFailed ? (
                <>
                  <button
                    type="button"
                    onClick={() => setViewerOpen(true)}
                    className="flex min-h-[320px] w-full items-center justify-center sm:min-h-[480px]"
                    aria-label="Open full-screen product image"
                  >
                    <img
                      src={imageUrl}
                      alt={listing.title}
                      className="max-h-[600px] w-full object-contain"
                      onError={() =>
                        setImageErrors((previous) => ({
                          ...previous,
                          [selectedImage]: true,
                        }))
                      }
                    />
                  </button>

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => changeImage(-1)}
                        aria-label="Previous image"
                        className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl font-bold text-slate-900 shadow hover:bg-white"
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        onClick={() => changeImage(1)}
                        aria-label="Next image"
                        className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl font-bold text-slate-900 shadow hover:bg-white"
                      >
                        ›
                      </button>

                      <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/75 px-3 py-1.5 text-sm font-bold text-white">
                        {selectedImage + 1} / {images.length}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <div className="px-6 py-16 text-center">
                  <div className="text-8xl">📦</div>
                  <p className="mt-4 text-sm font-semibold text-slate-400">
                    {images.length
                      ? "This image could not be loaded"
                      : "No image available"}
                  </p>
                </div>
              )}
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 p-3 sm:grid-cols-5">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={selectedImage === index}
                    className={`relative h-20 overflow-hidden rounded-xl border-2 bg-slate-100 sm:h-24 ${
                      selectedImage === index
                        ? "border-blue-700 ring-2 ring-blue-100"
                        : "border-transparent hover:border-blue-300"
                    }`}
                  >
                    {!imageErrors[index] ? (
                      <img
                        src={image.image_url}
                        alt={`${listing.title} photo ${index + 1}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={() =>
                          setImageErrors((previous) => ({
                            ...previous,
                            [index]: true,
                          }))
                        }
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-2xl">
                        📦
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {images.length > 0 && (
              <p className="px-4 pb-4 text-center text-xs text-slate-500">
                Tap a photo to view it larger.
              </p>
            )}
          </div>

          {/* LISTING DETAILS */}
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

            <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              {listing.title}
            </h1>

            {listing.subcategory && (
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {listing.subcategory}
              </p>
            )}

            <div className="mt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-3xl font-black text-blue-700">
                  {listing.price !== null
                    ? formatAmount(
                        convertedPrice ?? Number(listing.price),
                        convertedPrice === null
                          ? originalCurrency()
                          : displayCurrency,
                      )
                    : "Price not set"}
                </div>

                <select
                  value={displayCurrency}
                  onChange={(event) =>
                    setDisplayCurrency(event.target.value)
                  }
                  className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-bold text-blue-800 outline-none"
                >
                  <option value="GHS">🇬🇭 GHS</option>
                  <option value="USD">🇺🇸 USD</option>
                  <option value="CNY">🇨🇳 CNY</option>
                  <option value="EUR">🇪🇺 EUR</option>
                  <option value="GBP">🇬🇧 GBP</option>
                </select>
              </div>

              {listing.price !== null &&
                displayCurrency !== originalCurrency() && (
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Original price:{" "}
                    {formatAmount(
                      Number(listing.price),
                      originalCurrency(),
                    )}
                    {convertedPrice === null && (
                      <span className="ml-2 text-amber-600">
                        • Conversion rate not set
                      </span>
                    )}
                  </p>
                )}
            </div>

            {listing.location && (
              <div className="mt-3 text-slate-600">
                📍 {listing.location}
              </div>
            )}

            {/* SELLER */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                {seller?.avatar_url ? (
                  <img
                    src={seller.avatar_url}
                    alt={seller.full_name || "Seller"}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">
                    👤
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-slate-900">
                      {seller?.full_name || "Marketplace Seller"}
                    </h3>

                    {seller?.verified && (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-black text-green-700">
                        ✓ VERIFIED
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {seller?.account_type === "business"
                      ? "Business Seller"
                      : seller?.account_type === "seller"
                        ? "Individual Seller"
                        : "Seller"}
                  </p>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={contactSeller}
                className="rounded-xl bg-blue-700 px-5 py-4 text-center font-black text-white hover:bg-blue-800"
              >
                💬 Contact Seller
              </button>

              <button
                type="button"
                disabled={savingFavourite}
                onClick={toggleFavourite}
                className={`rounded-xl border px-5 py-4 font-black transition ${
                  isFavourite
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-blue-700 bg-white text-blue-700 hover:bg-blue-50"
                }`}
              >
                {savingFavourite
                  ? "Saving..."
                  : isFavourite
                    ? "♥ Saved"
                    : "♡ Save Listing"}
              </button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={sharing}
                onClick={shareListing}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
              >
                📤 {sharing ? "Sharing..." : "Share Listing"}
              </button>

              <button
                type="button"
                disabled={reporting}
                onClick={reportListing}
                className="rounded-xl border border-red-200 bg-white px-5 py-3 font-bold text-red-700 hover:bg-red-50"
              >
                🚩 {reporting ? "Reporting..." : "Report Listing"}
              </button>
            </div>

            <div className="mt-8 rounded-2xl bg-blue-50 p-5">
              <h3 className="font-black text-slate-900">
                🛡️ Shop safely
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Verify the item and seller before making payment.
                Never share passwords, card details, verification codes,
                or other sensitive account information with another person.
              </p>
            </div>
          </div>
        </div>

        {/* DESCRIPTION AND DELIVERY */}
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

          <div className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
            <div className="text-4xl">🚚</div>

            <h2 className="mt-4 text-2xl font-black">Delivery</h2>

            <p className="mt-3 leading-7 text-slate-300">
              Delivery options can be arranged between the buyer and seller.
              Integrated delivery booking and tracking must be connected
              to the marketplace delivery system.
            </p>

            <div className="mt-6 rounded-xl bg-white/10 p-4">
              <p className="text-sm font-bold">📍 Location</p>
              <p className="mt-1 text-sm text-slate-300">
                {listing.location || "Location not provided"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-10 bg-slate-950 py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="text-xl font-black">BEST SALES GHANA</div>
          <p className="mt-2 text-sm text-slate-400">
            Buy • Sell • Advertise • Connect
          </p>
          <p className="mt-6 text-sm text-slate-500">
            © 2026 All Prominent Ghana Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* FULL-SCREEN IMAGE VIEWER */}
      {viewerOpen && imageUrl && !currentImageFailed && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Product image viewer"
          onClick={() => setViewerOpen(false)}
        >
          <button
            type="button"
            onClick={() => setViewerOpen(false)}
            aria-label="Close image viewer"
            className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-3xl font-bold text-black"
          >
            ×
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(event) => {
                  event.stopPropagation();
                  changeImage(-1);
                }}
                className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-3xl font-bold text-black"
              >
                ‹
              </button>

              <button
                type="button"
                aria-label="Next image"
                onClick={(event) => {
                  event.stopPropagation();
                  changeImage(1);
                }}
                className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-3xl font-bold text-black"
              >
                ›
              </button>
            </>
          )}

          <img
            src={imageUrl}
            alt={listing.title}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] max-w-full object-contain"
          />

          {images.length > 1 && (
            <span className="absolute bottom-5 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white">
              {selectedImage + 1} of {images.length}
            </span>
          )}
        </div>
      )}
    </main>
  );
}
