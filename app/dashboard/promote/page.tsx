"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Listing = {
  id: string | number;
  title: string | null;
  price: number | null;
  currency_code: string | null;
  currency: string | null;
  status: string | null;
};

type PromotionPackage = {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  description: string;
  features: string[];
};

const packages: PromotionPackage[] = [
  {
    id: "7-day",
    name: "7-Day Promotion",
    durationDays: 7,
    price: 50,
    description: "Give your advertisement extra visibility.",
    features: [
      "7 days of promotion",
      "Promotion request tracking",
      "Suitable for new advertisements",
    ],
  },
  {
    id: "14-day",
    name: "14-Day Promotion",
    durationDays: 14,
    price: 90,
    description: "Keep your advertisement promoted for longer.",
    features: [
      "14 days of promotion",
      "Promotion request tracking",
      "Suitable for growing businesses",
    ],
  },
  {
    id: "30-day",
    name: "30-Day Promotion",
    durationDays: 30,
    price: 180,
    description: "Promote your advertisement for a full month.",
    features: [
      "30 days of promotion",
      "Promotion request tracking",
      "Suitable for established sellers",
    ],
  },
];

function formatPrice(listing: Listing) {
  if (listing.price === null || listing.price === undefined) {
    return "Price not available";
  }

  const currency = listing.currency_code || listing.currency || "GHS";

  const symbols: Record<string, string> = {
    GHS: "GH₵",
    USD: "$",
    EUR: "€",
    GBP: "£",
    CNY: "¥",
  };

  return `${symbols[currency] || currency} ${Number(
    listing.price
  ).toLocaleString()}`;
}

export default function PromoteAdsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("14-day");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      try {
        const supabase = supabaseBrowser();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          window.location.replace(
            "/login?redirect=/dashboard/promote"
          );
          return;
        }

        const { data, error: listingsError } = await supabase
          .from("listings")
          .select(
            "id, title, price, currency_code, currency, status"
          )
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false });

        if (cancelled) return;

        if (listingsError) {
          console.error("PROMOTION LISTINGS ERROR:", listingsError);
          setError("Could not load your advertisements. Please refresh.");
          return;
        }

        const ownListings = (data || []) as Listing[];

        setListings(ownListings);

        if (ownListings.length > 0) {
          setSelectedListing(String(ownListings[0].id));
        }
      } catch (err) {
        console.error("PROMOTION PAGE ERROR:", err);

        if (!cancelled) {
          setError("Something went wrong while loading your advertisements.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadListings();

    return () => {
      cancelled = true;
    };
  }, []);

  async function startPayment() {
    setError("");

    if (!selectedListing) {
      setError("Please select an advertisement.");
      return;
    }

    const chosenPackage = packages.find(
      (item) => item.id === selectedPackage
    );

    if (!chosenPackage) {
      setError("Please select a valid promotion package.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = supabaseBrowser();

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        window.location.replace(
          "/login?redirect=/dashboard/promote"
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
          packageId: chosenPackage.id,
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

      // Redirect the seller to Paystack's hosted checkout.
      window.location.assign(result.authorizationUrl);
    } catch (err) {
      console.error("START PROMOTION PAYMENT ERROR:", err);
      setError("Unable to connect to payment checkout. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const chosenPackage = packages.find(
    (item) => item.id === selectedPackage
  );

  return (
    <main className="min-h-screen bg-[#f3f7fb] px-4 py-6 text-[#15365d] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="font-bold text-blue-700 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <header className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
            BEST SALES GHANA
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Promote Your Ads
          </h1>
          <p className="mt-2 text-slate-500">
            Select your advertisement, choose a package, and proceed to
            secure payment through Paystack.
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

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-black text-slate-950">
            1. Choose Your Advertisement
          </h2>

          {loading ? (
            <p className="mt-5 text-slate-500">
              Loading your advertisements...
            </p>
          ) : listings.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-slate-50 p-6 text-center">
              <h3 className="font-bold text-slate-900">
                No advertisements found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Post an advertisement before requesting promotion.
              </p>
              <Link
                href="/sell"
                className="mt-5 inline-block rounded-xl bg-blue-700 px-5 py-3 font-bold text-white"
              >
                Post an Ad
              </Link>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {listings.map((listing) => (
                <label
                  key={String(listing.id)}
                  className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 ${
                    selectedListing === String(listing.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="listing"
                    value={String(listing.id)}
                    checked={selectedListing === String(listing.id)}
                    onChange={() =>
                      setSelectedListing(String(listing.id))
                    }
                    className="mt-1 h-4 w-4 accent-blue-700"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block break-words font-bold text-slate-900">
                      {listing.title || "Untitled Advertisement"}
                    </span>
                    <span className="mt-1 block font-semibold text-blue-700">
                      {formatPrice(listing)}
                    </span>
                    <span className="mt-2 block text-xs text-slate-500">
                      Status: {listing.status || "Unknown"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-black text-slate-950">
            2. Choose a Promotion Package
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {packages.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedPackage(item.id)}
                className={`flex flex-col rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
                  selectedPackage === item.id
                    ? "border-blue-600 ring-2 ring-blue-100"
                    : "border-slate-200"
                }`}
              >
                <span className="text-sm font-black uppercase text-blue-700">
                  {item.durationDays} days
                </span>
                <span className="mt-3 text-xl font-black text-slate-950">
                  {item.name}
                </span>
                <span className="mt-3 text-3xl font-black text-blue-700">
                  GH₵{item.price}
                </span>
                <span className="mt-3 text-sm leading-6 text-slate-500">
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
                    selectedPackage === item.id
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {selectedPackage === item.id
                    ? "Selected"
                    : "Choose Package"}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-black text-slate-950">
            3. Review and Pay
          </h2>

          <div className="mt-5 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Selected advertisement
            </p>
            <p className="mt-1 break-words font-bold text-slate-900">
              {listings.find(
                (item) => String(item.id) === selectedListing
              )?.title || "No advertisement selected"}
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Selected package
            </p>
            <p className="mt-1 font-bold text-slate-900">
              {chosenPackage?.name}
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Total to pay
            </p>
            <p className="mt-1 text-3xl font-black text-blue-700">
              GH₵{chosenPackage?.price ?? 0}
            </p>
          </div>

          <button
            type="button"
            onClick={startPayment}
            disabled={
              loading ||
              submitting ||
              listings.length === 0 ||
              !selectedListing
            }
            className="mt-6 w-full rounded-xl bg-blue-700 px-6 py-4 font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {submitting
              ? "Connecting to Paystack..."
              : `Proceed to Pay GH₵${chosenPackage?.price ?? 0}`}
          </button>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Your payment is handled by Paystack. Do not pay again if money
            has been deducted; check the transaction status first.
          </p>
        </section>

        <footer className="py-8 text-center text-sm text-slate-500">
          © 2026 All Prominent Ghana Limited. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
