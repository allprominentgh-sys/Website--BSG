
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Listing = {
  id: number;
  title: string | null;
  description: string | null;
  price: number | null;
  currency_code: string | null;
  currency: string | null;
  location: string | null;
  category: string | null;
  subcategory: string | null;
  seller_id: string | null;
  status: string | null;
  featured: boolean | null;
  created_at: string | null;
  item_region: string | null;
  item_city: string | null;
  item_area: string | null;
  item_ghana_post_gps: string | null;
  item_latitude: number | null;
  item_longitude: number | null;
};

type Currency = {
  code: string;
  name: string | null;
  symbol: string | null;
  rate_to_ghs: number | null;
  manual_rate_from_ghs: number | null;
};

type GhanaRegion = {
  id: number;
  name: string;
  sort_order: number;
};

type GhanaLocation = {
  id: number;
  region_id: number;
  name: string;
  location_type: "city" | "town" | "area";
  parent_name: string | null;
  sort_order: number;
};

type ListingImage = {
  listing_id: number;
  image_url: string;
};

type Promotion = {
  listing_id: number;
  package_id: string;
  promotion_rank: number;
  starts_at: string | null;
  ends_at: string | null;
};

const CATEGORY_OPTIONS = [
  "All Categories",
  "Phones & Tablets",
  "Cars",
  "Property",
  "Fashion",
  "Electronics",
  "Jobs & Services",
  "Home & Garden",
  "Agriculture",
  "Machinery",
  "Printing Equipment",
  "Construction Equipment",
  "Vehicles",
];

const SUBCATEGORY_OPTIONS: Record<string, string[]> = {
  "Phones & Tablets": ["Phones", "Tablets", "Accessories", "Smart Watches"],
  Cars: ["Cars", "SUVs", "Trucks", "Buses", "Spare Parts"],
  Property: ["Houses", "Apartments", "Land", "Commercial Property", "Rentals"],
  Fashion: ["Men", "Women", "Children", "Shoes", "Bags"],
  Electronics: ["TVs", "Computers", "Cameras", "Audio", "Accessories"],
  "Jobs & Services": ["Jobs", "Repairs", "Design", "Cleaning", "Professional Services"],
  "Home & Garden": ["Furniture", "Kitchen", "Garden", "Home Decor"],
  Agriculture: ["Farm Produce", "Livestock", "Farm Equipment", "Seeds", "Fertilizer"],
  Machinery: ["Industrial Machines", "Printing Machines", "Construction Machines", "Agricultural Machines"],
  "Printing Equipment": ["DTF Printers", "Eco Solvent Printers", "UV Printers", "Screen Printing", "Printing Materials"],
  "Construction Equipment": ["Excavators", "Loaders", "Concrete Machines", "Generators", "Tools"],
  Vehicles: ["Cars", "Trucks", "Buses", "Motorcycles", "Spare Parts"],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Printing Equipment": ["printer", "printing", "dtf", "eco solvent", "uv printer", "screen printing"],
  Machinery: ["machine", "machinery", "printer", "industrial", "equipment"],
  "Construction Equipment": ["excavator", "loader", "concrete", "generator", "construction", "bulldozer"],
  Electronics: ["electronic", "computer", "phone", "tablet", "television", "camera"],
  Vehicles: ["vehicle", "car", "truck", "bus", "motorcycle"],
};

function formatPrice(
  price: number | null,
  currencyCode: string | null,
  currency: string | null
) {
  if (price === null || price === undefined) return "Price on request";

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

function normalise(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function listingMatchesCategory(listing: Listing, category: string) {
  if (!category || category === "All Categories") return true;

  const selected = normalise(category);

  if (
    normalise(listing.category) === selected ||
    normalise(listing.subcategory) === selected
  ) {
    return true;
  }

  const searchable = [
    listing.title,
    listing.description,
    listing.category,
    listing.subcategory,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const keywords = CATEGORY_KEYWORDS[category] || [selected];

  return keywords.some((keyword) =>
    searchable.includes(keyword.toLowerCase())
  );
}

function promotionRank(packageId: string | null | undefined) {
  switch ((packageId || "").toLowerCase()) {
    case "top-priority":
      return 1;
    case "priority":
      return 2;
    case "premium":
      return 3;
    default:
      return 4;
  }
}

function promotionLabel(packageId: string) {
  switch (packageId.toLowerCase()) {
    case "top-priority":
      return "TOP PRIORITY";
    case "priority":
      return "PRIORITY";
    case "premium":
      return "PREMIUM";
    default:
      return "";
  }
}

function promotionStyle(packageId: string) {
  switch (packageId.toLowerCase()) {
    case "top-priority":
      return "bg-yellow-100 text-yellow-900";
    case "priority":
      return "bg-purple-100 text-purple-900";
    default:
      return "bg-sky-100 text-sky-900";
  }
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingImages, setListingImages] = useState<Record<number, string>>({});
  const [promotions, setPromotions] = useState<Record<number, Promotion>>({});
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [regions, setRegions] = useState<GhanaRegion[]>([]);
  const [locations, setLocations] = useState<GhanaLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotionWarning, setPromotionWarning] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [subcategory, setSubcategory] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get("q") || params.get("search") || params.get("query") || "");
    setCategory(params.get("category") || "All Categories");
    setSubcategory(params.get("subcategory") || "");
    setRegion(params.get("region") || "");
    setCity(params.get("city") || "");
    setArea(params.get("area") || "");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setPromotionWarning("");

      try {
        const db = supabaseBrowser() as any;

        const [
          listingsResponse,
          currenciesResponse,
          regionsResponse,
          locationsResponse,
          promotionsResponse,
        ] = await Promise.all([
          db
            .from("listings")
            .select(`
              id,title,description,price,currency_code,currency,location,
              category,subcategory,seller_id,status,featured,created_at,
              item_region,item_city,item_area,item_ghana_post_gps,
              item_latitude,item_longitude
            `)
            .eq("status", "active")
            .order("created_at", { ascending: false }),

          db
            .from("currencies")
            .select("code,name,symbol,rate_to_ghs,manual_rate_from_ghs"),

          db
            .from("ghana_regions")
            .select("id,name,sort_order")
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),

          db
            .from("ghana_locations")
            .select("id,region_id,name,location_type,parent_name,sort_order")
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),

          db
            .from("active_listing_promotions")
            .select("listing_id,package_id,promotion_rank,starts_at,ends_at"),
        ]);

        if (cancelled) return;

        if (listingsResponse.error) {
          console.error("Listings loading error:", listingsResponse.error);
        } else {
          setListings((listingsResponse.data || []) as Listing[]);
        }

        if (currenciesResponse.error) {
          console.error("Currencies loading error:", currenciesResponse.error);
        } else {
          setCurrencies((currenciesResponse.data || []) as Currency[]);
        }

        if (regionsResponse.error) {
          console.error("Regions loading error:", regionsResponse.error);
        } else {
          setRegions((regionsResponse.data || []) as GhanaRegion[]);
        }

        if (locationsResponse.error) {
          console.error("Locations loading error:", locationsResponse.error);
        } else {
          setLocations((locationsResponse.data || []) as GhanaLocation[]);
        }

        if (promotionsResponse.error) {
          console.error("Promotion loading error:", promotionsResponse.error);
          setPromotionWarning(
            "Promotional placements are temporarily unavailable. Listings are still shown."
          );
          setPromotions({});
        } else {
          const promotionMap: Record<number, Promotion> = {};

          for (const item of (promotionsResponse.data || []) as Promotion[]) {
            const id = Number(item.listing_id);
            if (!Number.isFinite(id)) continue;

            const existing = promotionMap[id];
            if (
              !existing ||
              promotionRank(item.package_id) < promotionRank(existing.package_id)
            ) {
              promotionMap[id] = item;
            }
          }

          setPromotions(promotionMap);
        }

        const loadedListings = (listingsResponse.data || []) as Listing[];
        const ids = loadedListings.map((listing) => listing.id);

        if (ids.length) {
          const imagesResponse = await db
            .from("listing_images")
            .select("listing_id,image_url")
            .in("listing_id", ids);

          if (cancelled) return;

          if (imagesResponse.error) {
            console.error("Listing images loading error:", imagesResponse.error);
          } else {
            const imageMap: Record<number, string> = {};

            for (const image of (imagesResponse.data || []) as ListingImage[]) {
              const id = Number(image.listing_id);
              const url = typeof image.image_url === "string"
                ? image.image_url.trim()
                : "";

              if (Number.isFinite(id) && url && !imageMap[id]) {
                imageMap[id] = url;
              }
            }

            setListingImages(imageMap);
          }
        } else {
          setListingImages({});
        }
      } catch (error) {
        console.error("Marketplace loading error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const regionLocations = useMemo(() => {
    const selected = regions.find((item) => item.name === region);
    return selected
      ? locations.filter((item) => item.region_id === selected.id)
      : [];
  }, [region, regions, locations]);

  const cities = useMemo(
    () =>
      regionLocations
        .filter((item) => item.location_type === "city" || item.location_type === "town")
        .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    [regionLocations]
  );

  const areas = useMemo(
    () =>
      city
        ? regionLocations
            .filter((item) => item.location_type === "area" && item.parent_name === city)
            .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
        : [],
    [city, regionLocations]
  );

  const filteredListings = useMemo(() => {
    const q = normalise(search);

    return listings
      .filter((listing) => {
        const searchableText = [
          listing.title,
          listing.description,
          listing.category,
          listing.subcategory,
          listing.location,
          listing.item_region,
          listing.item_city,
          listing.item_area,
          listing.item_ghana_post_gps,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = !q || searchableText.includes(q);
        const matchesCategory = listingMatchesCategory(listing, category);

        const matchesSubcategory =
          !subcategory ||
          normalise(listing.subcategory) === normalise(subcategory) ||
          normalise(listing.title).includes(normalise(subcategory));

        const oldLocation = normalise(listing.location);

        const matchesRegion =
          !region ||
          normalise(listing.item_region) === normalise(region) ||
          oldLocation.includes(normalise(region));

        const matchesCity =
          !city ||
          normalise(listing.item_city) === normalise(city) ||
          oldLocation.includes(normalise(city));

        const matchesArea =
          !area ||
          normalise(listing.item_area) === normalise(area) ||
          oldLocation.includes(normalise(area));

        return (
          matchesSearch &&
          matchesCategory &&
          matchesSubcategory &&
          matchesRegion &&
          matchesCity &&
          matchesArea
        );
      })
      .sort((a, b) => {
        const aPromotion = promotions[a.id];
        const bPromotion = promotions[b.id];

        const aRank = aPromotion ? promotionRank(aPromotion.package_id) : 4;
        const bRank = bPromotion ? promotionRank(bPromotion.package_id) : 4;

        if (aRank !== bRank) return aRank - bRank;

        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;

        return bDate - aDate;
      });
  }, [
    listings,
    promotions,
    search,
    category,
    subcategory,
    region,
    city,
    area,
  ]);

  function performSearch(event?: React.FormEvent) {
    event?.preventDefault();

    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (category !== "All Categories") params.set("category", category);
    if (subcategory) params.set("subcategory", subcategory);
    if (region) params.set("region", region);
    if (city) params.set("city", city);
    if (area) params.set("area", area);

    const query = params.toString();
    window.history.pushState({}, "", query ? `/listings?${query}` : "/listings");
  }

  function clearFilters() {
    setSearch("");
    setCategory("All Categories");
    setSubcategory("");
    setRegion("");
    setCity("");
    setArea("");
    window.history.replaceState({}, "", "/listings");
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      alert("Location detection is not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("GPS coordinates:", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        alert(
          "Your phone location was detected. Select your Region, City/Town and Area to filter listings. GPS-based automatic filtering is not connected yet."
        );
      },
      () => alert("Unable to detect your location. Please select your location manually."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="bg-gradient-to-r from-blue-800 via-blue-700 to-sky-500 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link href="/" className="text-sm font-semibold text-blue-100 hover:text-white">
                ← BEST SALES GHANA
              </Link>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Search Marketplace</h1>
              <p className="mt-2 max-w-2xl text-blue-100">
                Find products, vehicles, property, machinery, electronics, agriculture, services and more across Ghana.
              </p>
            </div>
            <Link href="/post-ad" className="inline-flex w-fit rounded-xl bg-white px-5 py-3 font-bold text-blue-800 shadow-lg hover:bg-blue-50">
              + Post an Ad
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={performSearch} className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-gray-200">
          <div className="grid gap-3 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Search products</label>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Printer, phone, car, location..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Category</label>
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setSubcategory("");
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3"
              >
                {CATEGORY_OPTIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Subcategory</label>
              <select
                value={subcategory}
                onChange={(event) => setSubcategory(event.target.value)}
                disabled={category === "All Categories" || !SUBCATEGORY_OPTIONS[category]}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 disabled:bg-gray-100"
              >
                <option value="">All Subcategories</option>
                {(SUBCATEGORY_OPTIONS[category] || []).map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Region</label>
              <select
                value={region}
                onChange={(event) => {
                  setRegion(event.target.value);
                  setCity("");
                  setArea("");
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3"
              >
                <option value="">All Ghana</option>
                {regions.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">City / Town</label>
              <select
                value={city}
                onChange={(event) => {
                  setCity(event.target.value);
                  setArea("");
                }}
                disabled={!region}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 disabled:bg-gray-100"
              >
                <option value="">{region ? "All Cities / Towns" : "Select Region First"}</option>
                {cities.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Area</label>
              <select
                value={area}
                onChange={(event) => setArea(event.target.value)}
                disabled={!city}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 disabled:bg-gray-100"
              >
                <option value="">{city ? "All Areas" : "Select City/Town First"}</option>
                {areas.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="submit" className="rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800">🔍 Search</button>
            <button type="button" onClick={clearFilters} className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">Clear Filters</button>
            <button type="button" onClick={detectLocation} className="rounded-xl border border-sky-300 bg-sky-50 px-6 py-3 font-semibold text-sky-800 hover:bg-sky-100">📍 Detect Location</button>
          </div>
        </form>

        {promotionWarning && (
          <p role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {promotionWarning}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Marketplace Listings</h2>
            <p className="text-sm text-gray-600">
              {loading ? "Loading listings..." : `${filteredListings.length} listing${filteredListings.length === 1 ? "" : "s"} found`}
            </p>
          </div>
          {(search || category !== "All Categories" || subcategory || region || city || area) && (
            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800">Filters active</span>
          )}
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
            <p className="mt-4 text-gray-600">Loading marketplace listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
            <div className="text-5xl">🔎</div>
            <h3 className="mt-4 text-xl font-bold text-gray-900">No listings found</h3>
            <p className="mx-auto mt-2 max-w-lg text-gray-600">Try another search term or change your category and location filters.</p>
            <button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800">Clear Search</button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => {
              const imageUrl = listingImages[listing.id];
              const showImage = Boolean(imageUrl) && !imageErrors[listing.id];
              const promotion = promotions[listing.id];
              const label = promotion ? promotionLabel(promotion.package_id) : "";

              return (
                <article key={listing.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {showImage ? (
                      <img
                        src={imageUrl}
                        alt={listing.title || "Marketplace product"}
                        loading="lazy"
                        className="h-full w-full object-contain"
                        onError={() => setImageErrors((previous) => ({ ...previous, [listing.id]: true }))}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <span className="text-5xl">🛍️</span>
                        <span className="text-xs">Product image unavailable</span>
                      </div>
                    )}

                    {label && (
                      <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-extrabold shadow-sm ${promotionStyle(promotion.package_id)}`}>
                        {label}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="mt-1 line-clamp-2 text-lg font-bold text-gray-900">{listing.title || "Untitled Listing"}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">{listing.description || "No description provided."}</p>
                    <div className="mt-3 text-xl font-bold text-blue-700">
                      {formatPrice(listing.price, listing.currency_code, listing.currency)}
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-gray-500">
                      {(listing.item_region || listing.item_city || listing.item_area || listing.location) && (
                        <div>📍 {[
                          listing.item_area,
                          listing.item_city,
                          listing.item_region,
                        ].filter(Boolean).join(", ") || listing.location}</div>
                      )}
                      {(listing.category || listing.subcategory) && (
                        <div>🏷️ {[listing.category, listing.subcategory].filter(Boolean).join(" • ")}</div>
                      )}
                      {listing.item_ghana_post_gps && (
                        <div className="break-words">📮 GhanaPostGPS: {listing.item_ghana_post_gps}</div>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link href={`/listings/${listing.id}`} className="rounded-xl bg-blue-700 px-3 py-2.5 text-center text-sm font-bold text-white hover:bg-blue-800">View Listing</Link>
                      <Link href={`/chat?listing=${listing.id}`} className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-center text-sm font-bold text-blue-800 hover:bg-blue-100">Chat Seller</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <section className="mt-12 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Search across BEST SALES GHANA</h2>
          <p className="mt-2 text-gray-600">Find listings across the marketplace using one search page.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.slice(1).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setCategory(item);
                  setSubcategory("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
