
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/supabase-browser";

type Seller = {
  id: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  account_type: string | null;
  verified: boolean | null;
  verification_status: string | null;
  created_at: string | null;
};

type SellerListing = {
  id: number;
  seller_id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency_code: string | null;
  currency: string | null;
  location: string | null;
  status: string | null;
  featured: boolean | null;
  created_at: string | null;
  category: string | null;
};

type AdvertisingSetting = {
  setting_key: string;
  setting_value: number;
  description: string | null;
};

const promotionKeys = [
  {
    key: "individual_premium_price",
    name: "Premium",
    description: "Premium individual seller promotion",
  },
  {
    key: "individual_priority_price",
    name: "Priority",
    description: "Priority individual seller promotion",
  },
  {
    key: "individual_top_priority_price",
    name: "Top Priority",
    description: "Top Priority individual seller promotion",
  },
];

function formatMoney(value: number | null | undefined) {
  if (value == null || !Number.isFinite(Number(value))) {
    return "Not set";
  }

  return `GH₵${Number(value).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-GH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ManageSellersPage() {
  const supabase = supabaseBrowser();

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [settings, setSettings] = useState<AdvertisingSetting[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingListing, setSavingListing] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [sellerFilter, setSellerFilter] = useState("all");
  const [listingFilter, setListingFilter] = useState("all");
  const [selectedSeller, setSelectedSeller] = useState<string>("all");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [
        sellersResult,
        listingsResult,
        settingsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, full_name, phone, location, account_type, verified, verification_status, created_at"
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("listings")
          .select(
            "id, seller_id, title, description, price, currency_code, currency, location, status, featured, created_at, category"
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("advertising_settings")
          .select("setting_key, setting_value, description"),
      ]);

      if (sellersResult.error) throw sellersResult.error;
      if (listingsResult.error) throw listingsResult.error;
      if (settingsResult.error) throw settingsResult.error;

      setSellers((sellersResult.data || []) as Seller[]);
      setListings((listingsResult.data || []) as SellerListing[]);
      setSettings((settingsResult.data || []) as AdvertisingSetting[]);
    } catch (error) {
      console.error("Manage Sellers loading error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load seller information. Check your database permissions."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const individualSellers = sellers.filter((seller) => {
    const type = (seller.account_type || "").toLowerCase();
    return (
      type === "seller" ||
      type === "individual" ||
      type === "individual_seller"
    );
  });

  const visibleSellers = individualSellers.filter((seller) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      (seller.full_name || "").toLowerCase().includes(query) ||
      (seller.phone || "").toLowerCase().includes(query) ||
      seller.id.toLowerCase().includes(query);

    const status = (seller.verification_status || "").toLowerCase();

    const matchesStatus =
      sellerFilter === "all" ||
      (sellerFilter === "verified" &&
        (seller.verified === true || status === "verified")) ||
      (sellerFilter === "pending" &&
        seller.verified !== true &&
        (!status || status === "pending")) ||
      (sellerFilter === "unverified" &&
        seller.verified !== true &&
        status !== "pending");

    return matchesSearch && matchesStatus;
  });

  const visibleListings = listings.filter((listing) => {
    const matchesSeller =
      selectedSeller === "all" || listing.seller_id === selectedSeller;

    const status = (listing.status || "").toLowerCase();

    const matchesStatus =
      listingFilter === "all" ||
      (listingFilter === "pending" && status === "pending") ||
      (listingFilter === "active" &&
        ["active", "approved", "published"].includes(status)) ||
      (listingFilter === "rejected" && status === "rejected") ||
      (listingFilter === "featured" && listing.featured === true);

    return matchesSeller && matchesStatus;
  });

  function getSellerName(sellerId: string) {
    return (
      sellers.find((seller) => seller.id === sellerId)?.full_name ||
      "Seller name unavailable"
    );
  }

  function getPromotionPrice(key: string) {
    const setting = settings.find((item) => item.setting_key === key);
    return setting ? Number(setting.setting_value) : null;
  }

  async function updateListing(
    listing: SellerListing,
    action: "approve" | "reject" | "feature" | "unfeature"
  ) {
    const confirmed = window.confirm(
      action === "approve"
        ? "Approve this listing?"
        : action === "reject"
          ? "Reject this listing?"
          : action === "feature"
            ? "Mark this listing as featured?"
            : "Remove featured status from this listing?"
    );

    if (!confirmed) return;

    setSavingListing(listing.id);
    setMessage("");
    setErrorMessage("");

    try {
      const update: {
        status?: string;
        featured?: boolean;
      } = {};

      if (action === "approve") update.status = "active";
      if (action === "reject") update.status = "rejected";
      if (action === "feature") update.featured = true;
      if (action === "unfeature") update.featured = false;

      const { error } = await supabase
        .from("listings")
        .update(update)
        .eq("id", listing.id);

      if (error) throw error;

      setListings((current) =>
        current.map((item) =>
          item.id === listing.id ? { ...item, ...update } : item
        )
      );

      setMessage(
        `Listing "${listing.title}" updated successfully.`
      );
    } catch (error) {
      console.error("Listing update error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update this listing. Check database permissions."
      );
    } finally {
      setSavingListing(null);
    }
  }

  async function updateSellerVerification(
    seller: Seller,
    verified: boolean
  ) {
    const confirmed = window.confirm(
      verified
        ? `Mark ${seller.full_name || "this seller"} as verified?`
        : `Remove verification from ${seller.full_name || "this seller"}?`
    );

    if (!confirmed) return;

    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          verified,
          verification_status: verified ? "verified" : "pending",
        })
        .eq("id", seller.id);

      if (error) throw error;

      setSellers((current) =>
        current.map((item) =>
          item.id === seller.id
            ? {
                ...item,
                verified,
                verification_status: verified ? "verified" : "pending",
              }
            : item
        )
      );

      setMessage(
        `${seller.full_name || "Seller"} verification updated.`
      );
    } catch (error) {
      console.error("Seller verification error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update seller verification."
      );
    }
  }

  const verifiedCount = individualSellers.filter(
    (seller) =>
      seller.verified === true ||
      (seller.verification_status || "").toLowerCase() === "verified"
  ).length;

  const pendingCount = listings.filter(
    (listing) => (listing.status || "").toLowerCase() === "pending"
  ).length;

  const featuredCount = listings.filter(
    (listing) => listing.featured === true
  ).length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-3xl">👥</p>
          <h1 className="mt-3 text-xl font-black">
            Loading Seller Management
          </h1>
          <p className="mt-2 text-slate-500">
            Retrieving seller accounts and listings.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/admin"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold hover:bg-slate-50"
          >
            ← Admin Dashboard
          </Link>

          <button
            type="button"
            onClick={() => void loadData()}
            className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
          >
            Refresh Data
          </button>
        </div>

        <header className="mt-6 rounded-3xl bg-gradient-to-r from-blue-900 to-cyan-600 p-7 text-white sm:p-9">
          <p className="text-sm font-black uppercase tracking-widest text-cyan-100">
            Marketplace Management
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            👥 Manage Sellers
          </h1>
          <p className="mt-3 max-w-3xl leading-7 text-white/90">
            Review individual seller accounts, monitor their listings,
            control listing approval and manage featured placement.
            Advertising package prices are displayed below.
          </p>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800"
          >
            {errorMessage}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-800"
          >
            {message}
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Individual Sellers",
              value: individualSellers.length,
              icon: "👥",
            },
            {
              label: "Verified Sellers",
              value: verifiedCount,
              icon: "✅",
            },
            {
              label: "Pending Listings",
              value: pendingCount,
              icon: "⏳",
            },
            {
              label: "Featured Listings",
              value: featuredCount,
              icon: "⭐",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-500">
                  {stat.label}
                </p>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="mt-3 text-3xl font-black">
                {stat.value.toLocaleString("en-GH")}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-black">Individual Advertising Packages</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Prices are read from advertising_settings. This page does not
            charge sellers or record promotion purchases.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {promotionKeys.map((promotion) => {
              const price = getPromotionPrice(promotion.key);

              return (
                <div
                  key={promotion.key}
                  className="rounded-2xl border border-blue-100 bg-blue-50 p-5"
                >
                  <p className="font-black text-blue-900">
                    {promotion.name}
                  </p>
                  <p className="mt-2 text-2xl font-black text-blue-800">
                    {formatMoney(price)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {promotion.description}
                  </p>
                  <p className="mt-3 text-xs font-bold text-slate-500">
                    Standard duration: 30 days
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-sm text-slate-600">
            Free listings limit:{" "}
            <strong>
              {getPromotionPrice("individual_free_ads_limit") ?? 3}
            </strong>{" "}
            per individual seller.
          </p>

          <Link
            href="/admin/advertising"
            className="mt-5 inline-flex rounded-xl border border-blue-700 px-4 py-3 font-bold text-blue-700 hover:bg-blue-700 hover:text-white"
          >
            Configure Advertising →
          </Link>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-black">Seller Accounts</h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search seller name, phone or account ID"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />

            <select
              value={sellerFilter}
              onChange={(event) => setSellerFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              <option value="all">All verification statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending verification</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          {visibleSellers.length === 0 ? (
            <div className="mt-5 rounded-xl bg-slate-50 p-6 text-center">
              <p className="font-bold">No individual sellers found.</p>
              <p className="mt-2 text-sm text-slate-500">
                Check account_type values in profiles or change your search.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {visibleSellers.map((seller) => {
                const isVerified =
                  seller.verified === true ||
                  (seller.verification_status || "").toLowerCase() ===
                    "verified";

                const sellerListings = listings.filter(
                  (listing) => listing.seller_id === seller.id
                );

                return (
                  <article
                    key={seller.id}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div className="min-w-0">
                        <h3 className="break-words text-lg font-black">
                          {seller.full_name || "Name not provided"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {seller.phone || "No phone number"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {seller.location || "Location not provided"}
                        </p>
                        <p className="mt-2 break-all text-xs text-slate-400">
                          Account ID: {seller.id}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          Joined: {formatDate(seller.created_at)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isVerified ? "Verified" : "Not verified"}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            void updateSellerVerification(seller, !isVerified)
                          }
                          className="rounded-xl border border-blue-700 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-700 hover:text-white"
                        >
                          {isVerified ? "Remove Verification" : "Verify Seller"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <p className="text-sm text-slate-600">
                        Listings:{" "}
                        <strong>{sellerListings.length}</strong>
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSeller(
                            selectedSeller === seller.id ? "all" : seller.id
                          )
                        }
                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        {selectedSeller === seller.id
                          ? "Show All Sellers' Listings"
                          : "View Seller Listings"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-black">Seller Listings & Ads</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review seller postings, approve or reject them, and manage the
            featured flag. Featured status alone does not constitute a paid
            advertising promotion.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <select
              value={selectedSeller}
              onChange={(event) => setSelectedSeller(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              <option value="all">Listings from all sellers</option>
              {individualSellers.map((seller) => (
                <option key={seller.id} value={seller.id}>
                  {seller.full_name || seller.id}
                </option>
              ))}
            </select>

            <select
              value={listingFilter}
              onChange={(event) => setListingFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              <option value="all">All listing statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active / Published</option>
              <option value="rejected">Rejected</option>
              <option value="featured">Featured</option>
            </select>
          </div>

          {visibleListings.length === 0 ? (
            <div className="mt-5 rounded-xl bg-slate-50 p-6 text-center">
              <p className="font-bold">No listings match these filters.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {visibleListings.map((listing) => {
                const status = (listing.status || "unknown").toLowerCase();

                return (
                  <article
                    key={listing.id}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row">
                      <div className="min-w-0">
                        <h3 className="break-words text-lg font-black">
                          {listing.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Seller: {getSellerName(listing.seller_id)}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Category: {listing.category || "Not specified"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Location: {listing.location || "Not specified"}
                        </p>
                        <p className="mt-2 text-xl font-black text-blue-800">
                          {listing.currency_code || listing.currency || "GHS"}{" "}
                          {Number(listing.price || 0).toLocaleString("en-GH")}
                        </p>
                        {listing.description && (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                            {listing.description}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-slate-400">
                          Posted: {formatDate(listing.created_at)} · ID:{" "}
                          {listing.id}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col gap-2 lg:min-w-44">
                        <span className="rounded-full bg-slate-100 px-3 py-2 text-center text-xs font-black uppercase text-slate-700">
                          {status}
                        </span>

                        {listing.featured && (
                          <span className="rounded-full bg-amber-100 px-3 py-2 text-center text-xs font-black text-amber-800">
                            ⭐ Featured
                          </span>
                        )}

                        <button
                          type="button"
                          disabled={savingListing === listing.id}
                          onClick={() =>
                            void updateListing(listing, "approve")
                          }
                          className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                        >
                          Approve / Activate
                        </button>

                        <button
                          type="button"
                          disabled={savingListing === listing.id}
                          onClick={() =>
                            void updateListing(listing, "reject")
                          }
                          className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                        >
                          Reject Listing
                        </button>

                        <button
                          type="button"
                          disabled={savingListing === listing.id}
                          onClick={() =>
                            void updateListing(
                              listing,
                              listing.featured ? "unfeature" : "feature"
                            )
                          }
                          className="rounded-xl border border-blue-700 px-4 py-2.5 text-sm font-bold text-blue-700 disabled:opacity-50"
                        >
                          {listing.featured
                            ? "Remove Featured"
                            : "Mark Featured"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          <strong>Important security note:</strong> These controls use the
          Supabase browser client. Your database Row Level Security policies
          must independently restrict seller verification and listing updates
          to authorized administrators. Do not make unrestricted write access
          available to the public. Paid promotion purchases, payment
          verification, seller suspension and promotion expiry require
          additional implementation before they are operational.
        </div>
      </div>
    </main>
  );
}
