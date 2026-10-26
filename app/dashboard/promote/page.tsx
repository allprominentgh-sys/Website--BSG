
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/supabase-browser";

type Listing = {
  id: number;
  title: string | null;
  price: number | null;
  currency_code: string | null;
  currency: string | null;
  status: string | null;
};

type Tier = "premium" | "priority" | "top-priority";
type DurationMonths = 1 | 2 | 3 | 6 | 12;

type PromotionPackage = {
  id: Tier;
  name: string;
  setting: string;
  bit: number;
  description: string;
  features: string[];
};

type SettingRow = {
  setting_key: string;
  setting_value: number | string;
};

const PACKAGES: PromotionPackage[] = [
  {
    id: "premium",
    name: "Premium",
    setting: "individual_premium_price",
    bit: 1,
    description: "Give your advertisement additional visibility.",
    features: [
      "Premium promotion tier",
      "Duration of your choice",
      "Online payment through Paystack",
    ],
  },
  {
    id: "priority",
    name: "Priority",
    setting: "individual_priority_price",
    bit: 2,
    description: "Give your advertisement stronger promotional placement.",
    features: [
      "Priority promotion tier",
      "Duration of your choice",
      "Online payment through Paystack",
    ],
  },
  {
    id: "top-priority",
    name: "Top Priority",
    setting: "individual_top_priority_price",
    bit: 4,
    description: "Choose the highest available promotion tier.",
    features: [
      "Top Priority promotion tier",
      "Duration of your choice",
      "Online payment through Paystack",
    ],
  },
];

const DURATIONS: DurationMonths[] = [1, 2, 3, 6, 12];

function money(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function durationLabel(months: number) {
  return months === 1 ? "1 month" : `${months} months`;
}

export default function PromoteAdsPage() {
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState("");
  const [selectedTier, setSelectedTier] = useState<Tier>("premium");
  const [durationMonths, setDurationMonths] =
    useState<DurationMonths>(1);

  const [settings, setSettings] = useState<Record<string, number>>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      try {
        const db = supabaseBrowser();

        // Read the listing selected from the seller dashboard URL.
        const requestedListingId =
          new URLSearchParams(window.location.search).get("listingId") || "";

        const {
          data: { user },
          error: authError,
        } = await db.auth.getUser();

        if (authError || !user) {
          router.replace(
            `/login?redirect=${encodeURIComponent(
              window.location.pathname + window.location.search
            )}`
          );
          return;
        }

        const { data: listingData, error: listingError } = await db
          .from("listings")
          .select(
            "id,title,price,currency_code,currency,status"
          )
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false });

        if (listingError) {
          throw new Error(
            `Could not load your advertisements: ${listingError.message}`
          );
        }

        if (cancelled) return;

        const ownListings = (listingData || []) as Listing[];
        setListings(ownListings);

        if (requestedListingId) {
          const requestedListing = ownListings.find(
            (listing) => String(listing.id) === requestedListingId
          );

          if (requestedListing) {
            setSelectedListing(String(requestedListing.id));
          } else {
            setNotice(
              "The requested advertisement was not found in your account. Please select one of your own listings."
            );

            if (ownListings.length > 0) {
              setSelectedListing(String(ownListings[0].id));
            }
          }
        } else if (ownListings.length > 0) {
          setSelectedListing(String(ownListings[0].id));
        }

        // Prices are read from the database. The server independently
        // recalculates and validates the final payment amount.
        const settingKeys = [
          "individual_premium_price",
          "individual_priority_price",
          "individual_top_priority_price",
          "promotion_discount_percent",
          "promotion_discount_packages",
        ];

        const { data: settingsData, error: settingsError } = await db
          .from("advertising_settings")
          .select("setting_key,setting_value")
          .in("setting_key", settingKeys);

        if (settingsError) {
          throw new Error(
            `Could not load promotion prices: ${settingsError.message}`
          );
        }

        if (cancelled) return;

        const mapped: Record<string, number> = {};

        ((settingsData || []) as SettingRow[]).forEach((row) => {
          mapped[row.setting_key] = Number(row.setting_value);
        });

        setSettings(mapped);
        setSettingsLoaded(true);
      } catch (err) {
        console.error("PROMOTION PAGE ERROR:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load the promotion page."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const selectedPackage = useMemo(
    () => PACKAGES.find((item) => item.id === selectedTier)!,
    [selectedTier]
  );

  const selectedAd = useMemo(
    () =>
      listings.find(
        (listing) => String(listing.id) === selectedListing
      ),
    [listings, selectedListing]
  );

  const priceDetails = useMemo(() => {
    const monthlyPrice = settings[selectedPackage.setting];
    const discountSetting = settings.promotion_discount_percent;
    const eligiblePackages = settings.promotion_discount_packages;

    const validSettings =
      Number.isFinite(monthlyPrice) &&
      monthlyPrice > 0 &&
      Number.isFinite(discountSetting) &&
      discountSetting >= 0 &&
      discountSetting <= 100 &&
      Number.isInteger(eligiblePackages) &&
      eligiblePackages >= 0 &&
      eligiblePackages <= 7;

    if (!validSettings) return null;

    const discountEligible =
      (eligiblePackages & selectedPackage.bit) !== 0;

    const discountPercent = discountEligible ? discountSetting : 0;
    const baseAmount =
      Math.round(
        (monthlyPrice * durationMonths + Number.EPSILON) * 100
      ) / 100;

    const discountAmount =
      Math.round(
        (baseAmount * discountPercent / 100 + Number.EPSILON) * 100
      ) / 100;

    const finalAmount =
      Math.round(
        (baseAmount - discountAmount + Number.EPSILON) * 100
      ) / 100;

    return {
      monthlyPrice,
      baseAmount,
      discountPercent,
      discountAmount,
      finalAmount,
    };
  }, [settings, selectedPackage, durationMonths]);

  async function startPayment() {
    if (submitting) return;

    setError("");
    setNotice("");

    if (!selectedListing) {
      setError("Please select an advertisement first.");
      return;
    }

    if (!priceDetails || priceDetails.finalAmount <= 0) {
      setError(
        "Promotion pricing is unavailable or invalid. Please contact support."
      );
      return;
    }

    const listing = listings.find(
      (item) => String(item.id) === selectedListing
    );

    if (!listing) {
      setError("Please select a valid advertisement.");
      return;
    }

    if ((listing.status || "").toLowerCase() !== "active") {
      setError(
        "Only active advertisements can be promoted. Please check your listing status."
      );
      return;
    }

    setSubmitting(true);

    try {
      const db = supabaseBrowser();

      const {
        data: { session },
        error: sessionError,
      } = await db.auth.getSession();

      if (sessionError || !session?.access_token) {
        router.replace(
          `/login?redirect=${encodeURIComponent(
            window.location.pathname + window.location.search
          )}`
        );
        return;
      }

      const response = await fetch("/api/promotions/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          listingId: selectedListing,
          tier: selectedTier,
          durationMonths,
        }),
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.authorizationUrl) {
        setError(
          result.error ||
            "We could not start your payment. Please try again."
        );
        return;
      }

      // Use the server's price as the final price authority.
      if (
        result.pricing &&
        typeof result.pricing.finalAmount === "number" &&
        Math.abs(
          result.pricing.finalAmount - priceDetails.finalAmount
        ) > 0.01
      ) {
        console.warn(
          "Displayed price differed from server-calculated price.",
          {
            displayed: priceDetails.finalAmount,
            server: result.pricing.finalAmount,
          }
        );
      }

      window.location.assign(result.authorizationUrl);
    } catch (err) {
      console.error("START PROMOTION PAYMENT ERROR:", err);

      setError(
        "Unable to connect to payment checkout. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const canPay =
    !loading &&
    !submitting &&
    settingsLoaded &&
    listings.length > 0 &&
    Boolean(selectedListing) &&
    Boolean(priceDetails) &&
    (selectedAd?.status || "").toLowerCase() === "active";

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-32 pt-6 text-slate-900 sm:px-6 sm:pb-12 sm:pt-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard/listings"
          className="font-bold text-blue-700 hover:underline"
        >
          ← Back to My Listings
        </Link>

        <header className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
            BEST SALES GHANA
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Promote Your Advertisement
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Choose your advertisement, promotion tier and duration.
            Prices and eligible discounts are loaded from your marketplace
            settings. Your payment will be verified by our server.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800"
          >
            {notice}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="font-bold text-slate-600">
              Loading your advertisements and promotion prices...
            </p>
          </div>
        ) : listings.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="text-5xl">📦</div>
            <h2 className="mt-4 text-xl font-black">
              No advertisements found
            </h2>
            <p className="mt-2 text-slate-600">
              Publish an advertisement before requesting promotion.
            </p>
            <Link
              href="/sell"
              className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-bold text-white"
            >
              Post an Ad
            </Link>
          </div>
        ) : (
          <>
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <h2 className="text-xl font-black">
                1. Choose Your Advertisement
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                If you selected Promote Ad from your dashboard, that
                advertisement will already be selected.
              </p>

              <div className="mt-5 space-y-3">
                {listings.map((listing) => {
                  const selected =
                    String(listing.id) === selectedListing;

                  return (
                    <label
                      key={String(listing.id)}
                      className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                        selected
                          ? "border-blue-600 bg-blue-50 ring-1 ring-blue-100"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="promotion-listing"
                        value={String(listing.id)}
                        checked={selected}
                        onChange={() => setSelectedListing(String(listing.id))}
                        className="mt-1 h-4 w-4 accent-blue-700"
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block break-words font-bold">
                          {listing.title || "Untitled Advertisement"}
                        </span>
                        <span className="mt-1 block text-sm text-slate-600">
                          {listing.price === null
                            ? "Price on request"
                            : `${listing.currency_code || listing.currency || "GHS"} ${Number(listing.price).toLocaleString("en-GH")}`}
                        </span>
                        <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                          {listing.status || "Unknown status"}
                        </span>
                      </span>

                      {selected && (
                        <span className="rounded-full bg-blue-700 px-3 py-1 text-xs font-bold text-white">
                          Selected
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-black">
                2. Select a Promotion Tier
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Choose one tier. The final price depends on the tier,
                selected duration and the current admin discount settings.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-3">
                {PACKAGES.map((item) => {
                  const selected = selectedTier === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedTier(item.id)}
                      aria-pressed={selected}
                      className={`flex h-full flex-col rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:border-blue-400 ${
                        selected
                          ? "border-blue-600 ring-2 ring-blue-100"
                          : "border-slate-200"
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-widest text-blue-700">
                        {item.id === "top-priority"
                          ? "Highest Tier"
                          : item.id === "priority"
                            ? "Enhanced Visibility"
                            : "Extra Visibility"}
                      </span>

                      <span className="mt-3 text-2xl font-black">
                        {item.name}
                      </span>

                      <span className="mt-3 text-sm leading-6 text-slate-600">
                        {item.description}
                      </span>

                      <span className="mt-5 space-y-2 text-sm text-slate-700">
                        {item.features.map((feature) => (
                          <span key={feature} className="block">
                            ✓ {feature}
                          </span>
                        ))}
                      </span>

                      <span
                        className={`mt-6 rounded-xl px-4 py-3 text-center text-sm font-bold ${
                          selected
                            ? "bg-blue-700 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {selected ? "✓ Selected" : "Select Tier"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <h2 className="text-xl font-black">
                3. Choose the Duration
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Longer durations use the monthly price configured by your
                administrator. Any eligible discount is shown below.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {DURATIONS.map((months) => {
                  const selected = durationMonths === months;

                  return (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setDurationMonths(months)}
                      aria-pressed={selected}
                      className={`rounded-2xl border p-4 text-center transition ${
                        selected
                          ? "border-blue-700 bg-blue-50 ring-2 ring-blue-100"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <span className="block text-2xl font-black">
                        {months}
                      </span>
                      <span className="mt-1 block text-sm font-semibold">
                        {months === 1 ? "Month" : "Months"}
                      </span>
                      {selected && (
                        <span className="mt-2 block text-xs font-black text-blue-700">
                          SELECTED
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <h2 className="text-xl font-black">
                4. Review Your Payment
              </h2>

              {!settingsLoaded ? (
                <p className="mt-4 text-slate-600">
                  Loading current prices...
                </p>
              ) : !priceDetails ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  A valid price or discount setting is missing. Please
                  contact your administrator to correct the promotion settings.
                </div>
              ) : (
                <>
                  <div className="mt-5 space-y-4 rounded-2xl bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-slate-600">Advertisement</span>
                      <span className="max-w-[65%] break-words text-right font-bold">
                        {selectedAd?.title || "Select an advertisement"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-600">Promotion tier</span>
                      <span className="font-bold">
                        {selectedPackage.name}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-600">Duration</span>
                      <span className="font-bold">
                        {durationLabel(durationMonths)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-600">Monthly price</span>
                      <span className="font-bold">
                        {money(priceDetails.monthlyPrice)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-600">Base amount</span>
                      <span className="font-bold">
                        {money(priceDetails.baseAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-600">
                        Discount ({priceDetails.discountPercent}%)
                      </span>
                      <span className="font-bold text-green-700">
                        −{money(priceDetails.discountAmount)}
                      </span>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex items-end justify-between gap-4">
                        <span className="font-black">Total to pay</span>
                        <span className="text-2xl font-black text-blue-700">
                          {money(priceDetails.finalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    This is a price preview based on the current settings.
                    The server recalculates the amount before starting Paystack.
                    Your promotion is not active until payment is successfully
                    verified.
                  </p>
                </>
              )}
            </section>

            <section className="mt-8 rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
              <h2 className="text-2xl font-black">
                Ready to Promote?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Confirm your selected advertisement, tier and duration.
                You'll be redirected to Paystack to complete payment.
              </p>

              <button
                type="button"
                onClick={startPayment}
                disabled={!canPay}
                className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-4 font-black text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Connecting to Paystack..."
                  : priceDetails
                    ? `Pay ${money(priceDetails.finalAmount)} with Paystack`
                    : "Payment Unavailable"}
              </button>

              <p className="mt-3 text-center text-xs text-slate-400">
                Secure checkout · Payment verification required
              </p>
            </section>
          </>
        )}

        <footer className="py-8 text-center text-xs text-slate-500">
          © 2026 All Prominent Ghana Limited. All rights reserved.
        </footer>
      </div>

      {!loading && listings.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-500">
                {selectedPackage.name} · {durationLabel(durationMonths)}
              </p>
              <p className="text-lg font-black text-blue-700">
                {priceDetails ? money(priceDetails.finalAmount) : "—"}
              </p>
            </div>

            <button
              type="button"
              onClick={startPayment}
              disabled={!canPay}
              className="min-h-12 rounded-xl bg-blue-700 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Please wait..." : "Pay Now →"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
