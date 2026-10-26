
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/supabase-browser";

type Tier = "top-priority" | "priority" | "premium";

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
  listing_id: number;
  image_url: string;
};

type Promotion = {
  listing_id: number;
  package_id: string;
  starts_at: string;
  ends_at: string;
};

type CategoryData = {
  name: string;
  icon: string;
  description: string;
  subcategories: string[];
  searchTerms: string[];
};

const TIER_ORDER: Record<Tier, number> = {
  "top-priority": 0,
  priority: 1,
  premium: 2,
};

const TIER_LABEL: Record<Tier, string> = {
  "top-priority": "TOP PRIORITY",
  priority: "PRIORITY",
  premium: "PREMIUM",
};

function isTier(value: string): value is Tier {
  return (
    value === "top-priority" ||
    value === "priority" ||
    value === "premium"
  );
}

const categoryData: Record<string, CategoryData> = {
  vehicles: {
    name: "Vehicles",
    icon: "🚗",
    description:
      "Buy and sell cars, trucks, buses, motorcycles and other vehicles across Ghana.",
    subcategories: [
      "Cars", "SUVs", "Trucks", "Buses", "Motorcycles",
      "Commercial Vehicles", "Heavy Equipment", "Vehicle Parts",
      "Vehicle Accessories",
    ],
    searchTerms: ["vehicle", "vehicles", "car", "cars", "automobile"],
  },
  property: {
    name: "Property",
    icon: "🏠",
    description:
      "Find houses, apartments, land, commercial properties and real estate opportunities.",
    subcategories: [
      "Houses", "Apartments", "Land", "Commercial Property",
      "Office Space", "Shops", "Warehouses", "Hotels",
      "Industrial Property",
    ],
    searchTerms: ["property", "real estate", "properties"],
  },
  electronics: {
    name: "Electronics",
    icon: "📱",
    description:
      "Shop phones, laptops, televisions, computers and other electronic products.",
    subcategories: [
      "Phones", "Tablets", "Laptops", "Desktop Computers",
      "Televisions", "Cameras", "Audio Equipment", "Gaming",
      "Computer Accessories", "Phone Accessories",
    ],
    searchTerms: ["electronics", "electronic"],
  },
  machinery: {
    name: "Machinery",
    icon: "⚙️",
    description:
      "Discover industrial machinery, printing equipment, construction equipment and tools.",
    subcategories: [
      "Industrial Machinery", "Printing Equipment",
      "DTF Printing Machines", "Eco-Solvent Printers",
      "Construction Equipment", "Mining Equipment", "Generators",
      "Factory Equipment", "Packaging Machines", "Machine Parts", "Tools",
    ],
    searchTerms: ["machinery", "machine", "machines", "industrial equipment"],
  },
  agriculture: {
    name: "Agriculture",
    icon: "🌾",
    description:
      "Agricultural machinery, farming equipment, livestock and farming opportunities.",
    subcategories: [
      "Tractors", "Farm Machinery", "Irrigation", "Poultry Equipment",
      "Livestock", "Seeds", "Fertilizer", "Processing Equipment",
      "Greenhouse Equipment", "Farm Tools",
    ],
    searchTerms: ["agriculture", "agricultural", "farming", "farm"],
  },
  services: {
    name: "Services",
    icon: "🛠️",
    description:
      "Find professional, business, technical, transport and other services across Ghana.",
    subcategories: [
      "Business Services", "Construction", "Graphic Design", "IT Services",
      "Transport", "Delivery", "Repairs", "Cleaning",
      "Professional Services", "Photography",
    ],
    searchTerms: ["services", "service"],
  },
};

function formatPrice(
  price: number | null,
  currencyCode: string | null,
  currency: string | null
) {
  if (price === null || price === undefined) {
    return "Price on request";
  }

  const code = (currencyCode || currency || "GHS").toUpperCase();

  try {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${code} ${Number(price).toLocaleString("en-GH")}`;
  }
}

function getListingLocation(listing: Listing) {
  return (
    [
      listing.item_area,
      listing.item_city,
      listing.item_region,
    ]
      .filter(Boolean)
      .join(", ") ||
    listing.location ||
    "Location not provided"
  );
}

export default function CategoryPage() {
  const params = useParams<{ category: string }>();
  const categorySlug = String(params.category || "").toLowerCase();
  const data = categoryData[categorySlug];

  const supabase = useMemo(() => supabaseBrowser(), []);

  const [listings, setListings] = useState<Listing[]>([]);
  const [images, setImages] = useState<Record<number, string>>({});
  const [promotions, setPromotions] = useState<Record<number, Tier>>({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const loadListings = useCallback(async () => {
    if (!data) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const [listingResult, promotionResult] = await Promise.all([
        supabase
          .from("listings")
          .select(`
            id, title, description, price, currency_code, currency,
            category, subcategory, location, item_region, item_city,
            item_area, featured, created_at
          `)
          .eq("status", "active")
          .order("created_at", { ascending: false }),
        supabase
          .from("active_listing_promotions")
          .select("listing_id, package_id, starts_at, ends_at"),
      ]);

      if (listingResult.error) {
        console.error("Category listings error:", listingResult.error);
        setErrorMessage(
          "We couldn't load listings right now. Please try again."
        );
        setListings([]);
        setImages({});
        setPromotions({});
        return;
      }

      const allListings = (listingResult.data || []) as Listing[];
      const categoryTerms = data.searchTerms.map((term) =>
        term.toLowerCase()
      );

      const categoryListings = allListings.filter((listing) => {
        const categoryValue = (listing.category || "")
          .trim()
          .toLowerCase();

        return (
          categoryValue === categorySlug ||
          categoryValue === data.name.toLowerCase() ||
          categoryTerms.includes(categoryValue)
        );
      });

      const now = Date.now();
      const tierByListing: Record<number, Tier> = {};

      if (promotionResult.error) {
        console.warn(
          "Could not load active listing promotions:",
          promotionResult.error.message
        );
      } else {
        ((promotionResult.data || []) as Promotion[]).forEach((promotion) => {
          if (
            !isTier(promotion.package_id) ||
            !Number.isFinite(Date.parse(promotion.starts_at)) ||
            !Number.isFinite(Date.parse(promotion.ends_at)) ||
            Date.parse(promotion.starts_at) > now ||
            Date.parse(promotion.ends_at) <= now
          ) {
            return;
          }

          const listingId = Number(promotion.listing_id);

          // Ignore promotions for listings that are not active in this category.
          if (!categoryListings.some((item) => item.id === listingId)) {
            return;
          }

          const tier = promotion.package_id;
          const currentTier = tierByListing[listingId];

          if (
            !currentTier ||
            TIER_ORDER[tier] < TIER_ORDER[currentTier]
          ) {
            tierByListing[listingId] = tier;
          }
        });
      }

      const sortedListings = [...categoryListings].sort((a, b) => {
        const tierA = tierByListing[a.id];
        const tierB = tierByListing[b.id];

        if (tierA && !tierB) return -1;
        if (!tierA && tierB) return 1;

        if (tierA && tierB) {
          const difference = TIER_ORDER[tierA] - TIER_ORDER[tierB];
          if (difference !== 0) return difference;
        }

        const dateA = a.created_at ? Date.parse(a.created_at) || 0 : 0;
        const dateB = b.created_at ? Date.parse(b.created_at) || 0 : 0;
        return dateB - dateA;
      });

      setListings(sortedListings);
      setPromotions(tierByListing);

      if (sortedListings.length === 0) {
        setImages({});
        return;
      }

      const listingIds = sortedListings.map((listing) => listing.id);

      const { data: imageRows, error: imageError } = await supabase
        .from("listing_images")
        .select("listing_id, image_url")
        .in("listing_id", listingIds);

      if (imageError) {
        console.error("Category listing images error:", imageError);
        setImages({});
      } else {
        const imageMap: Record<number, string> = {};

        ((imageRows || []) as ListingImage[]).forEach((image) => {
          if (image.image_url && !imageMap[image.listing_id]) {
            imageMap[image.listing_id] = image.image_url;
          }
        });

        setImages(imageMap);
      }
    } catch (error) {
      console.error("Unable to load category listings:", error);
      setErrorMessage(
        "Something went wrong while loading products. Please try again."
      );
      setListings([]);
      setImages({});
      setPromotions({});
    } finally {
      setLoading(false);
    }
  }, [data, categorySlug, supabase]);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (
        selectedSubcategory &&
        (listing.subcategory || "").toLowerCase() !==
          selectedSubcategory.toLowerCase()
      ) {
        return false;
      }

      if (selectedLocation) {
        const location = [
          listing.location,
          listing.item_region,
          listing.item_city,
          listing.item_area,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!location.includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      if (searchText.trim()) {
        const query = searchText.trim().toLowerCase();

        const searchableText = [
          listing.title,
          listing.description,
          listing.category,
          listing.subcategory,
          listing.location,
          listing.item_region,
          listing.item_city,
          listing.item_area,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(query)) return false;
      }

      return true;
    });
  }, [listings, selectedSubcategory, selectedLocation, searchText]);

  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-5 text-center">
        <div className="text-6xl">🔎</div>
        <h1 className="mt-5 text-3xl font-black text-slate-900">
          Category not found
        </h1>
        <p className="mt-3 text-slate-600">
          Please select a valid marketplace category.
        </p>
        <Link
          href="/categories"
          className="mt-6 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white"
        >
          Browse Categories
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-2xl shadow-md">
              ⭐
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-slate-900">
                BEST SALES GHANA
              </div>
              <div className="text-xs text-slate-500">
                Buy • Sell • Advertise • Connect
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="font-semibold text-slate-700 hover:text-blue-700">
              Home
            </Link>
            <Link href="/categories" className="font-semibold text-blue-700">
              Categories
            </Link>
            <Link href="/listings" className="font-semibold text-slate-700 hover:text-blue-700">
              Listings
            </Link>
            <Link
              href="/sell"
              className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-md hover:bg-blue-800"
            >
              Post an Ad
            </Link>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-400 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <Link href="/categories" className="font-bold text-cyan-100 hover:text-white">
            ← All Categories
          </Link>
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/15 text-6xl shadow-xl">
              {data.icon}
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">
                Marketplace Category
              </p>
              <h1 className="mt-2 text-4xl font-black sm:text-6xl">
                {data.name}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-white/90">
                {data.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-widest text-blue-700">
            Explore
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">
            {data.name} Subcategories
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSelectedSubcategory("")}
              className={`rounded-full border px-4 py-2.5 text-sm font-bold transition ${
                selectedSubcategory === ""
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              All Subcategories
            </button>
            {data.subcategories.map((subcategory) => (
              <button
                key={subcategory}
                type="button"
                onClick={() =>
                  setSelectedSubcategory((current) =>
                    current === subcategory ? "" : subcategory
                  )
                }
                className={`rounded-full border px-4 py-2.5 text-sm font-bold transition ${
                  selectedSubcategory === subcategory
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {subcategory}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">
            Find {data.name}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Search real seller listings by product, subcategory or location.
          </p>
          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px_auto]">
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={`Search ${data.name.toLowerCase()}...`}
              className="min-w-0 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />
            <select
              value={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="">All Ghana</option>
              {[
                "Greater Accra", "Ashanti", "Western", "Central", "Eastern",
                "Volta", "Northern", "Bono", "Bono East", "Ahafo",
                "Upper East", "Upper West", "Oti", "Savannah",
                "North East", "Western North",
              ].map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setSearchText("");
                setSelectedLocation("");
                setSelectedSubcategory("");
              }}
              className="rounded-xl border border-slate-200 px-6 py-3 font-bold text-slate-700 hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
          <div className="mt-4 rounded-xl bg-blue-50 p-4">
            <p className="font-black text-slate-900">📍 Delivery in Ghana</p>
            <p className="mt-1 text-sm text-slate-600">
              Check the individual listing and checkout options for delivery
              arrangements and available tracked delivery.
            </p>
          </div>
        </div>

        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Marketplace
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {data.name} Listings
            </h2>
            <p className="mt-2 text-slate-500">
              {loading
                ? "Loading active listings..."
                : `${filteredListings.length} real listing${filteredListings.length === 1 ? "" : "s"} found`}
            </p>
          </div>
          <Link
            href="/sell"
            className="inline-flex justify-center rounded-xl bg-blue-700 px-6 py-3 font-black text-white shadow-lg hover:bg-blue-800"
          >
            + Post an Ad
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
            <p className="mt-4 font-semibold text-slate-600">
              Loading real {data.name.toLowerCase()} listings...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <p className="font-bold text-red-700">{errorMessage}</p>
            <button
              type="button"
              onClick={() => void loadListings()}
              className="mt-5 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white"
            >
              Try Again
            </button>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="text-6xl">{data.icon}</div>
            <h3 className="mt-5 text-2xl font-black text-slate-900">
              No listings found
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              There are no active listings matching these filters. Try
              another search or check back when sellers publish more products.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchText("");
                setSelectedLocation("");
                setSelectedSubcategory("");
              }}
              className="mt-6 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
            >
              Show All Listings
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => {
              const tier = promotions[listing.id];

              return (
                <article
                  key={listing.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  <Link
                    href={`/listings/${listing.id}`}
                    className="block"
                    aria-label={`View ${listing.title || "listing"}`}
                  >
                    <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100">
                      {images[listing.id] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={images[listing.id]}
                          alt={listing.title || "Product image"}
                          loading="lazy"
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-7xl">{data.icon}</span>
                      )}

                      {tier && (
                        <span className="absolute left-3 top-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900 shadow-sm">
                          ⭐ {TIER_LABEL[tier]}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-5">
                    <p className="text-xs font-black uppercase tracking-wider text-blue-700">
                      {listing.category || data.name}
                      {listing.subcategory ? ` • ${listing.subcategory}` : ""}
                    </p>
                    <h3 className="mt-2 line-clamp-2 text-lg font-black text-slate-900">
                      {listing.title || "Untitled Listing"}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {listing.description || "No description provided."}
                    </p>
                    <div className="mt-4 text-xl font-black text-blue-700">
                      {formatPrice(
                        listing.price,
                        listing.currency_code,
                        listing.currency
                      )}
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      📍 {getListingLocation(listing)}
                    </p>
                    <Link
                      href={`/listings/${listing.id}`}
                      className="mt-5 block rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white transition hover:bg-blue-800"
                    >
                      View Listing
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <section className="mt-14 rounded-3xl bg-blue-900 p-8 text-white sm:p-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-cyan-300">
                BEST SALES GHANA DELIVERY
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Choose tracked delivery when available.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/80">
                Delivery arrangements depend on the individual listing and
                checkout options. Review the available delivery method
                before completing your purchase.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-5">
                <div className="text-3xl">📍</div>
                <p className="mt-3 font-black">Location</p>
                <p className="mt-1 text-sm text-white/70">Seller location</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5">
                <div className="text-3xl">🔢</div>
                <p className="mt-3 font-black">Tracking</p>
                <p className="mt-1 text-sm text-white/70">When offered</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5">
                <div className="text-3xl">🚚</div>
                <p className="mt-3 font-black">Delivery</p>
                <p className="mt-1 text-sm text-white/70">Check at checkout</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 rounded-3xl bg-slate-950 p-8 text-white sm:p-12">
          <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
            Sell on BEST SALES GHANA
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Have {data.name.toLowerCase()} to sell?
          </h2>
          <p className="mt-4 max-w-2xl text-white/70">
            Publish your listing and connect with buyers across Ghana.
          </p>
          <Link
            href="/sell"
            className="mt-7 inline-flex rounded-xl bg-blue-600 px-7 py-4 font-black text-white hover:bg-cyan-400 hover:text-slate-950"
          >
            Create a Listing →
          </Link>
        </section>
      </section>

      <footer className="bg-slate-950 py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="text-xl font-black">BEST SALES GHANA</div>
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
