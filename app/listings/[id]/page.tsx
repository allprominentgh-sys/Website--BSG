
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/supabase-browser";

type PromotionTier = "top-priority" | "priority" | "premium";
type ProductTab = "overview" | "details" | "delivery";

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

type Promotion = {
  listing_id: number;
  package_id: string;
  starts_at: string;
  ends_at: string;
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
  location: string | null;
  avatar_url: string | null;
  verified: boolean | null;
  account_type: string | null;
};

const TIER_ORDER: Record<PromotionTier, number> = {
  "top-priority": 0,
  priority: 1,
  premium: 2,
};

const TIER_LABEL: Record<PromotionTier, string> = {
  "top-priority": "TOP PRIORITY",
  priority: "PRIORITY",
  premium: "PREMIUM",
};

const TABS: { id: ProductTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Details" },
  { id: "delivery", label: "Delivery" },
];

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [listing, setListing] = useState<Listing | null>(null);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [promotionTier, setPromotionTier] =
    useState<PromotionTier | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [displayCurrency, setDisplayCurrency] = useState("GHS");
  const [isFavourite, setIsFavourite] = useState(false);
  const [savingFavourite, setSavingFavourite] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductTab>("overview");
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [viewerOpen, setViewerOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const imageUrl = images[selectedImage]?.image_url;
  const currentImageFailed = Boolean(imageErrors[selectedImage]);

  // Load the listing first, then fetch its related information in parallel.
  useEffect(() => {
    let cancelled = false;

    async function loadListing() {
      setLoading(true);
      setError("");
      setListing(null);
      setSeller(null);
      setImages([]);
      setCurrencies([]);
      setPromotionTier(null);
      setIsFavourite(false);
      setSelectedImage(0);
      setImageErrors({});
      setActiveTab("overview");
      setNotice("");

      const rawId = params.id;
      const listingId = Number(rawId);

      if (!rawId || !Number.isInteger(listingId) || listingId <= 0) {
        setError("Invalid listing.");
        setLoading(false);
        return;
      }

      try {
        const [listingResult, currencyResult, authResult] =
          await Promise.all([
            supabase
              .from("listings")
              .select(`
                id, title, description, price, currency_code, currency,
                location, status, featured, category, subcategory,
                created_at, seller_id
              `)
              .eq("id", listingId)
              .maybeSingle(),

            supabase
              .from("currencies")
              .select("code, name, symbol, manual_rate_from_ghs")
              .in("code", ["GHS", "USD", "CNY", "EUR", "GBP"]),

            // Read the local session rather than waiting for a user refresh.
            supabase.auth.getSession(),
          ]);

        if (cancelled) return;
        if (listingResult.error) throw listingResult.error;

        if (!listingResult.data) {
          setLoading(false);
          return;
        }

        const currentListing = listingResult.data as Listing;
        setListing(currentListing);

        if (!currencyResult.error) {
          setCurrencies((currencyResult.data || []) as Currency[]);
        } else {
          console.warn(
            "Could not load currencies:",
            currencyResult.error.message
          );
        }

        const user = authResult.data.session?.user ?? null;

        // These requests are independent, so run them together.
        const [
          promotionResult,
          imageResult,
          sellerResult,
          favouriteResult,
        ] = await Promise.all([
          supabase
            .from("active_listing_promotions")
            .select("listing_id, package_id, starts_at, ends_at")
            .eq("listing_id", listingId),

          supabase
            .from("listing_images")
            .select("id, listing_id, image_url")
            .eq("listing_id", listingId)
            .order("id", { ascending: true }),

          currentListing.seller_id
            ? supabase
                .from("profiles")
                .select(
                  "id, full_name, location, avatar_url, verified, account_type"
                )
                .eq("id", currentListing.seller_id)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),

          user
            ? supabase
                .from("favorites")
                .select("listing_id")
                .eq("user_id", user.id)
                .eq("listing_id", listingId)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);

        if (cancelled) return;

        if (promotionResult.error) {
          console.warn(
            "Could not load promotion:",
            promotionResult.error.message
          );
        } else {
          const now = Date.now();

          const validPromotions = (
            (promotionResult.data || []) as Promotion[]
          )
            .filter((promotion) => {
              const tier = promotion.package_id as PromotionTier;
              const start = Date.parse(promotion.starts_at);
              const end = Date.parse(promotion.ends_at);

              return (
                Object.prototype.hasOwnProperty.call(TIER_ORDER, tier) &&
                Number.isFinite(start) &&
                Number.isFinite(end) &&
                start <= now &&
                end > now
              );
            })
            .sort(
              (a, b) =>
                TIER_ORDER[a.package_id as PromotionTier] -
                TIER_ORDER[b.package_id as PromotionTier]
            );

          setPromotionTier(
            (validPromotions[0]?.package_id as PromotionTier) || null
          );
        }

        if (imageResult.error) {
          console.warn("Could not load images:", imageResult.error.message);
        } else {
          setImages(
            ((imageResult.data || []) as ListingImage[]).filter(
              (image) =>
                typeof image.image_url === "string" &&
                image.image_url.trim().length > 0
            )
          );
        }

        if (sellerResult.error) {
          console.warn("Could not load seller:", sellerResult.error.message);
        } else {
          setSeller(sellerResult.data as SellerProfile | null);
        }

        if (favouriteResult.error) {
          console.warn(
            "Could not load favourite:",
            favouriteResult.error.message
          );
        } else {
          setIsFavourite(Boolean(favouriteResult.data));
        }

        // Do not hold up the page while analytics are recorded.
        void supabase
          .from("ad_events")
          .insert({
            ad_id: listingId,
            event_type: "VIEW",
            viewer_id: user?.id || null,
          })
          .then(({ error: eventError }) => {
            if (eventError) {
              console.warn("Could not record view:", eventError.message);
            }
          });
      } catch (err: unknown) {
        console.error("Unable to load listing:", err);

        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load this listing."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadListing();

    return () => {
      cancelled = true;
    };
  }, [params.id, supabase]);

  const getCurrency = useCallback(
    (code: string) =>
      currencies.find(
        (currency) => currency.code.toUpperCase() === code.toUpperCase()
      ),
    [currencies]
  );

  const getSymbol = useCallback(
    (code: string) => {
      const currency = getCurrency(code);
      if (currency?.symbol) return currency.symbol;
      if (code === "GHS") return "GH₵";
      if (code === "USD") return "$";
      if (code === "CNY") return "¥";
      if (code === "EUR") return "€";
      if (code === "GBP") return "£";
      return code;
    },
    [getCurrency]
  );

  const convertPrice = useCallback(
    (amount: number, from: string, to: string) => {
      if (from === to) return amount;

      const source = getCurrency(from);
      const target = getCurrency(to);

      if (from === "GHS") {
        if (!target?.manual_rate_from_ghs) return null;
        return amount * target.manual_rate_from_ghs;
      }

      if (to === "GHS") {
        if (!source?.manual_rate_from_ghs) return null;
        return amount / source.manual_rate_from_ghs;
      }

      if (!source?.manual_rate_from_ghs || !target?.manual_rate_from_ghs) {
        return null;
      }

      return (
        (amount / source.manual_rate_from_ghs) *
        target.manual_rate_from_ghs
      );
    },
    [getCurrency]
  );

  const formatAmount = useCallback(
    (amount: number, code: string) =>
      `${getSymbol(code)} ${amount.toLocaleString("en-GH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    [getSymbol]
  );

  const originalCurrency = (
    listing?.currency_code || listing?.currency || "GHS"
  ).toUpperCase();

  const convertedPrice =
    listing?.price !== null && listing?.price !== undefined
      ? convertPrice(Number(listing.price), originalCurrency, displayCurrency)
      : null;

  function changeImage(direction: number) {
    if (images.length < 2) return;

    setSelectedImage(
      (current) => (current + direction + images.length) % images.length
    );
  }

  // Use the current session and return signed-out buyers to their intended page.
  async function requireLogin(nextPath?: string) {
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      const returnTo =
        nextPath || (listing ? `/listings/${listing.id}` : "/listings");

      window.location.href =
        `/login?error=login_required&next=${encodeURIComponent(returnTo)}`;

      return null;
    }

    return session.user;
  }

  async function contactSeller() {
    if (!listing || contactLoading) return;

    setContactLoading(true);
    setNotice("");

    const chatPath = `/chat?listing=${encodeURIComponent(String(listing.id))}`;

    try {
      const user = await requireLogin(chatPath);
      if (!user) return;

      window.location.href = chatPath;
    } catch (err) {
      console.error("Unable to open chat:", err);
      setNotice("Unable to open the chat. Please try again.");
      setContactLoading(false);
    }
  }

  async function callSeller() {
    if (!listing || contactLoading) return;

    setContactLoading(true);
    setNotice("");

    try {
      const user = await requireLogin(`/listings/${listing.id}`);
      if (!user) return;

      setNotice(
        "Phone contact is not available yet. The seller's phone number remains private."
      );
    } catch (err) {
      console.error("Unable to check contact access:", err);
      setNotice("Unable to continue. Please try again.");
    } finally {
      setContactLoading(false);
    }
  }

  async function toggleFavourite() {
    if (savingFavourite) return;

    const user = await requireLogin();
    if (!user || !listing) return;

    setSavingFavourite(true);
    setNotice("");

    try {
      if (isFavourite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listing.id);

        if (error) throw error;

        setIsFavourite(false);
        setNotice("Listing removed from your saved listings.");
      } else {
        const { error } = await supabase.from("favorites").upsert(
          { user_id: user.id, listing_id: listing.id },
          { onConflict: "user_id,listing_id" }
        );

        if (error) throw error;

        setIsFavourite(true);
        setNotice("Listing saved to your favourites.");
      }
    } catch (err) {
      console.error("Unable to update favourite:", err);
      setNotice("Unable to update your favourites. Please try again.");
    } finally {
      setSavingFavourite(false);
    }
  }

  async function shareListing() {
    if (!listing || sharing) return;

    setSharing(true);
    setNotice("");

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
        setNotice("Listing link copied.");
      } else {
        window.prompt("Copy this listing link:", url);
      }
    } catch {
      // The user may cancel the sharing dialog.
    } finally {
      setSharing(false);
    }
  }

  async function reportListing() {
    if (reporting) return;

    const user = await requireLogin();
    if (!user || !listing) return;

    const reason = window.prompt("Why are you reporting this listing?");
    if (!reason?.trim()) return;

    setReporting(true);
    setNotice("");

    try {
      const { error } = await supabase.from("ad_events").insert({
        ad_id: listing.id,
        event_type: "REPORT",
        viewer_id: user.id,
      });

      if (error) throw error;

      setNotice(
        "Your report event was recorded. The report reason is not currently stored for administrator review."
      );
    } catch (err) {
      console.error("Unable to report listing:", err);
      setNotice("Unable to submit your report. Please try again.");
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

  if (error || !listing) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-20 text-center">
        <div className="text-5xl">{error ? "⚠️" : "🔎"}</div>
        <h1 className="mt-5 text-2xl font-black text-slate-900">
          {error ? "Unable to load listing" : "Listing not found"}
        </h1>
        <p className="mt-3 text-slate-500">
          {error ||
            "This listing may have been removed or is no longer available."}
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

  const description =
    listing.description || "The seller has not provided a description.";

  const sellerType =
    seller?.account_type === "business"
      ? "Business Seller"
      : seller?.account_type === "seller"
        ? "Individual Seller"
        : "Seller";

  const displayPrice =
    listing.price === null
      ? "Price not set"
      : formatAmount(
          convertedPrice ?? Number(listing.price),
          convertedPrice === null ? originalCurrency : displayCurrency
        );

  return (
    <main className="min-h-screen bg-slate-50 pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-slate-900 sm:pb-0">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <Link href="/listings" className="font-bold text-blue-700">
            ← Back to Marketplace
          </Link>
          <Link
            href="/post-ad"
            className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800"
          >
            Post an Ad
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
          <div className="relative flex min-h-[260px] items-center justify-center bg-slate-100 sm:min-h-[480px]">
            {imageUrl && !currentImageFailed ? (
              <>
                <button
                  type="button"
                  onClick={() => setViewerOpen(true)}
                  className="flex min-h-[260px] w-full items-center justify-center sm:min-h-[480px]"
                  aria-label="Open full-screen product image"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
                      className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl font-bold shadow"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => changeImage(1)}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl font-bold shadow"
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
                <div className="text-7xl">📦</div>
                <p className="mt-4 text-sm font-semibold text-slate-500">
                  {images.length
                    ? "This image could not be loaded"
                    : "No image available"}
                </p>
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 p-3 sm:grid-cols-6">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View product image ${index + 1}`}
                  aria-pressed={selectedImage === index}
                  className={`h-16 overflow-hidden rounded-lg border-2 bg-slate-100 sm:h-24 ${
                    selectedImage === index
                      ? "border-blue-700 ring-2 ring-blue-100"
                      : "border-transparent hover:border-blue-300"
                  }`}
                >
                  {!imageErrors[index] ? (
                    // eslint-disable-next-line @next/next/no-img-element
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
                    <span className="flex h-full items-center justify-center">
                      📦
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:rounded-3xl sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            {promotionTier && (
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-black ${
                  promotionTier === "top-priority"
                    ? "bg-purple-600 text-white"
                    : promotionTier === "priority"
                      ? "bg-blue-700 text-white"
                      : "bg-amber-100 text-amber-900"
                }`}
              >
                ⭐ {TIER_LABEL[promotionTier]}
              </span>
            )}

            {listing.status && (
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  listing.status.toLowerCase() === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {listing.status}
              </span>
            )}
          </div>

          <p className="mt-3 text-xs font-black uppercase tracking-widest text-blue-700">
            {listing.category || "Marketplace"}
            {listing.subcategory ? ` / ${listing.subcategory}` : ""}
          </p>
          <h1 className="mt-2 text-2xl font-black leading-tight sm:text-4xl">
            {listing.title}
          </h1>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-3xl font-black text-blue-700">
              {displayPrice}
            </div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
              Currency
              <select
                value={displayCurrency}
                onChange={(event) => setDisplayCurrency(event.target.value)}
                className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 font-bold text-blue-800 outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="GHS">🇬🇭 GHS</option>
                <option value="USD">🇺🇸 USD</option>
                <option value="CNY">🇨🇳 CNY</option>
                <option value="EUR">🇪🇺 EUR</option>
                <option value="GBP">🇬🇧 GBP</option>
              </select>
            </label>
          </div>

          {listing.price !== null && displayCurrency !== originalCurrency && (
            <p className="mt-2 text-sm text-slate-500">
              Original price:{" "}
              {formatAmount(Number(listing.price), originalCurrency)}
              {convertedPrice === null && (
                <span className="ml-2 text-amber-700">
                  • Conversion rate not set
                </span>
              )}
            </p>
          )}

          <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
            <span aria-hidden="true">📍</span>
            <span>{listing.location || "Location not provided"}</span>
          </p>
        </section>

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-6 sm:rounded-3xl">
          <div
            role="tablist"
            aria-label="Product information"
            className="grid grid-cols-3 border-b border-slate-200"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-14 border-b-4 px-2 py-4 text-sm font-black transition sm:text-base ${
                  activeTab === tab.id
                    ? "border-blue-700 bg-blue-50 text-blue-800"
                    : "border-transparent text-slate-500 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div
              id="panel-overview"
              role="tabpanel"
              aria-labelledby="tab-overview"
              className="p-5 sm:p-8"
            >
              <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                Product overview
              </p>
              <h2 className="mt-2 text-2xl font-black">Description</h2>
              <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-600">
                {description}
              </p>
            </div>
          )}

          {activeTab === "details" && (
            <div
              id="panel-details"
              role="tabpanel"
              aria-labelledby="tab-details"
              className="p-5 sm:p-8"
            >
              <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                Listing information
              </p>
              <h2 className="mt-2 text-2xl font-black">Details</h2>
              <dl className="mt-4 divide-y divide-slate-100">
                {[
                  ["Product name", listing.title],
                  ["Category", listing.category || "Not specified"],
                  ["Subcategory", listing.subcategory || "Not specified"],
                  ["Status", listing.status || "Not specified"],
                  [
                    "Price",
                    listing.price === null
                      ? "Price not set"
                      : formatAmount(Number(listing.price), originalCurrency),
                  ],
                  ["Seller", seller?.full_name || "Marketplace Seller"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between"
                  >
                    <dt className="text-sm font-semibold text-slate-500">
                      {label}
                    </dt>
                    <dd className="font-bold sm:max-w-[65%] sm:text-right">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <h3 className="mt-5 text-lg font-black">Full description</h3>
              <p className="mt-3 whitespace-pre-wrap leading-8 text-slate-600">
                {description}
              </p>
            </div>
          )}

          {activeTab === "delivery" && (
            <div
              id="panel-delivery"
              role="tabpanel"
              aria-labelledby="tab-delivery"
              className="p-5 sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  🚚
                </div>
                <div>
                  <h2 className="text-xl font-black">Delivery information</h2>
                  <p className="mt-2 leading-7 text-slate-600">
                    Contact the seller to confirm delivery availability,
                    charges and timing before payment.
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Listing location
                </p>
                <p className="mt-2 font-bold">
                  📍 {listing.location || "Location not provided"}
                </p>
              </div>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-black text-amber-950">
                  Confirm before paying
                </h3>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  Agree on delivery costs and timing directly with the seller.
                  This page does not confirm a delivery booking or provide live
                  shipment tracking.
                </p>
              </div>
              <button
                type="button"
                onClick={contactSeller}
                disabled={contactLoading}
                className="mt-5 w-full rounded-xl bg-blue-700 px-5 py-4 font-black text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
              >
                {contactLoading
                  ? "Opening chat..."
                  : "💬 Ask Seller About Delivery"}
              </button>
            </div>
          )}
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:rounded-3xl sm:p-6">
          <div className="flex items-center gap-4">
            {seller?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={seller.avatar_url}
                alt={seller.full_name || "Seller"}
                loading="lazy"
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl">
                👤
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-black">
                  {seller?.full_name || "Marketplace Seller"}
                </h2>
                {seller?.verified && (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-black text-green-700">
                    ✓ VERIFIED
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">{sellerType}</p>
              {seller?.location && (
                <p className="mt-1 text-sm text-slate-500">
                  📍 {seller.location}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Seller contact
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              The seller's phone number is hidden. Sign in to request contact.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={contactLoading}
              onClick={callSeller}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-3 text-sm font-black text-white hover:bg-green-700 disabled:cursor-wait disabled:opacity-60"
            >
              {contactLoading ? "Please wait..." : "📞 Call"}
            </button>
            <button
              type="button"
              disabled={contactLoading}
              onClick={contactSeller}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 py-3 text-sm font-black text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
            >
              {contactLoading ? "Opening chat..." : "💬 Message"}
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:rounded-3xl sm:p-6">
          <h2 className="text-lg font-black">Listing actions</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              type="button"
              disabled={savingFavourite}
              onClick={toggleFavourite}
              className={`min-h-12 rounded-xl border px-4 py-3 font-black ${
                isFavourite
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
              } disabled:opacity-60`}
            >
              {savingFavourite
                ? "Saving..."
                : isFavourite
                  ? "♥ Saved"
                  : "♡ Save Listing"}
            </button>
            <button
              type="button"
              disabled={sharing}
              onClick={shareListing}
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              📤 {sharing ? "Sharing..." : "Share Listing"}
            </button>
            <button
              type="button"
              disabled={reporting}
              onClick={reportListing}
              className="min-h-12 rounded-xl border border-red-200 bg-white px-4 py-3 font-bold text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              🚩 {reporting ? "Reporting..." : "Report Listing"}
            </button>
          </div>

          {notice && (
            <p
              role="status"
              aria-live="polite"
              className="mt-4 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-900"
            >
              {notice}
            </p>
          )}
        </section>

        <section className="mt-4 rounded-2xl bg-blue-50 p-5 sm:mt-6 sm:rounded-3xl sm:p-7">
          <h2 className="text-lg font-black">🛡️ Shop safely</h2>
          <p className="mt-2 leading-7 text-slate-600">
            Verify the item and seller before making payment. Never share
            passwords, card details, verification codes or other sensitive
            account information with another person.
          </p>
        </section>
      </section>

      <footer className="mt-8 bg-slate-950 py-8 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="text-xl font-black">BEST SALES GHANA</div>
          <p className="mt-2 text-sm text-slate-400">
            Buy • Sell • Advertise • Connect
          </p>
          <p className="mt-5 text-sm text-slate-500">
            © 2026 All Prominent Ghana Limited. All rights reserved.
          </p>
        </div>
      </footer>

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

          {/* eslint-disable-next-line @next/next/no-img-element */}
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
