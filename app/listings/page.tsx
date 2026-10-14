
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
  "Phones & Tablets": [
    "Phones",
    "Tablets",
    "Accessories",
    "Smart Watches",
  ],
  Cars: [
    "Cars",
    "SUVs",
    "Trucks",
    "Buses",
    "Spare Parts",
  ],
  Property: [
    "Houses",
    "Apartments",
    "Land",
    "Commercial Property",
    "Rentals",
  ],
  Fashion: [
    "Men",
    "Women",
    "Children",
    "Shoes",
    "Bags",
  ],
  Electronics: [
    "TVs",
    "Computers",
    "Cameras",
    "Audio",
    "Accessories",
  ],
  "Jobs & Services": [
    "Jobs",
    "Repairs",
    "Design",
    "Cleaning",
    "Professional Services",
  ],
  "Home & Garden": [
    "Furniture",
    "Kitchen",
    "Garden",
    "Home Decor",
  ],
  Agriculture: [
    "Farm Produce",
    "Livestock",
    "Farm Equipment",
    "Seeds",
    "Fertilizer",
  ],
  Machinery: [
    "Industrial Machines",
    "Printing Machines",
    "Construction Machines",
    "Agricultural Machines",
  ],
  "Printing Equipment": [
    "DTF Printers",
    "Eco Solvent Printers",
    "UV Printers",
    "Screen Printing",
    "Printing Materials",
  ],
  "Construction Equipment": [
    "Excavators",
    "Loaders",
    "Concrete Machines",
    "Generators",
    "Tools",
  ],
  Vehicles: [
    "Cars",
    "Trucks",
    "Buses",
    "Motorcycles",
    "Spare Parts",
  ],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Printing Equipment": [
    "printer",
    "printing",
    "dtf",
    "eco solvent",
    "uv printer",
    "screen printing",
  ],
  Machinery: [
    "machine",
    "machinery",
    "printer",
    "industrial",
    "equipment",
  ],
  "Construction Equipment": [
    "excavator",
    "loader",
    "concrete",
    "generator",
    "construction",
    "bulldozer",
  ],
  Electronics: [
    "electronic",
    "computer",
    "phone",
    "tablet",
    "television",
    "camera",
  ],
  Vehicles: [
    "vehicle",
    "car",
    "truck",
    "bus",
    "motorcycle",
  ],
};

function formatPrice(
  price: number | null,
  currencyCode: string | null,
  currency: string | null,
) {
  if (price === null || price === undefined) {
    return "Price on request";
  }

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

function listingMatchesCategory(
  listing: Listing,
  category: string,
) {
  if (!category || category === "All Categories") {
    return true;
  }

  const listingCategory = normalise(listing.category);
  const listingSubcategory = normalise(listing.subcategory);
  const selectedCategory = normalise(category);

  if (
    listingCategory === selectedCategory ||
    listingSubcategory === selectedCategory
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

  const keywords = CATEGORY_KEYWORDS[category] || [
    selectedCategory,
  ];

  return keywords.some((keyword) =>
    searchable.includes(keyword.toLowerCase()),
  );
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingImages, setListingImages] = useState<
    Record<number, string>
  >({});
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [regions, setRegions] = useState<GhanaRegion[]>([]);
  const [locations, setLocations] = useState<GhanaLocation[]>([]);

  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<
    Record<number, boolean>
  >({});

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [subcategory, setSubcategory] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setSearch(
      params.get("q") ||
        params.get("search") ||
        params.get("query") ||
        "",
    );

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

      try {
        const db = supabaseBrowser as any;

        const [
          listingsResponse,
          currenciesResponse,
          regionsResponse,
          locationsResponse,
        ] = await Promise.all([
          db
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
              category,
              subcategory,
              seller_id,
              status,
              featured,
              created_at,
              item_region,
              item_city,
              item_area,
              item_ghana_post_gps,
              item_latitude,
              item_longitude
            `,
            )
            .eq("status", "active")
            .order("featured", { ascending: false })
            .order("created_at", { ascending: false }),

          db
            .from("currencies")
            .select(
              "code,name,symbol,rate_to_ghs,manual_rate_from_ghs",
            ),

          db
            .from("ghana_regions")
            .select("id,name,sort_order")
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),

          db
            .from("ghana_locations")
            .select(
              "id,region_id,name,location_type,parent_name,sort_order",
            )
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),
        ]);

        if (cancelled) return;

        let loadedListings: Listing[] = [];

        if (listingsResponse.error) {
          console.error(
            "Listings loading error:",
            listingsResponse.error,
          );
        } else {
          loadedListings = (listingsResponse.data ||
            []) as Listing[];

          setListings(loadedListings);
        }

        if (currenciesResponse.error) {
          console.error(
            "Currencies loading error:",
            currenciesResponse.error,
          );
        } else {
          setCurrencies(
            (currenciesResponse.data || []) as Currency[],
          );
        }

        if (regionsResponse.error) {
          console.error(
            "Ghana regions loading error:",
            regionsResponse.error,
          );
        } else {
          setRegions(
            (regionsResponse.data || []) as GhanaRegion[],
          );
        }

        if (locationsResponse.error) {
          console.error(
            "Ghana locations loading error:",
            locationsResponse.error,
          );
        } else {
          setLocations(
            (locationsResponse.data || []) as GhanaLocation[],
          );
        }

        const listingIds = loadedListings.map(
          (listing) => listing.id,
        );

        if (listingIds.length > 0) {
          const imagesResponse = await db
            .from("listing_images")
            .select("listing_id,image_url")
            .in("listing_id", listingIds);

          if (cancelled) return;

          if (imagesResponse.error) {
            console.error(
              "Listing images loading error:",
              imagesResponse.error,
            );
          } else {
            const imageMap: Record<number, string> = {};

            for (const image of (imagesResponse.data ||
              []) as ListingImage[]) {
              const id = Number(image.listing_id);
              const url =
                typeof image.image_url === "string"
                  ? image.image_url.trim()
                  : "";

              if (
                Number.isFinite(id) &&
                url &&
                !imageMap[id]
              ) {
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

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const regionLocations = useMemo(() => {
    if (!region) return [];

    const selectedRegion = regions.find(
      (item) => item.name === region,
    );

    if (!selectedRegion) return [];

    return locations.filter(
      (item) => item.region_id === selectedRegion.id,
    );
  }, [region, regions, locations]);

  const cities = useMemo(() => {
    return regionLocations
      .filter(
        (item) =>
          item.location_type === "city" ||
          item.location_type === "town",
      )
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }

        return a.name.localeCompare(b.name);
      });
  }, [regionLocations]);

  const areas = useMemo(() => {
    if (!city) return [];

    return regionLocations
      .filter(
        (item) =>
          item.location_type === "area" &&
          item.parent_name === city,
      )
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }

        return a.name.localeCompare(b.name);
      });
  }, [city, regionLocations]);

  const filteredListings = useMemo(() => {
    const q = normalise(search);

    return listings.filter((listing) => {
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

      const matchesSearch =
        !q || searchableText.includes(q);

      const matchesCategory = listingMatchesCategory(
        listing,
        category,
      );

      const matchesSubcategory =
        !subcategory ||
        normalise(listing.subcategory) ===
          normalise(subcategory) ||
        normalise(listing.title).includes(
          normalise(subcategory),
        );

      const oldLocation = normalise(listing.location);

      const matchesRegion =
        !region ||
        normalise(listing.item_region) ===
          normalise(region) ||
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
    });
  }, [
    listings,
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

    if (category && category !== "All Categories") {
      params.set("category", category);
    }

    if (subcategory) params.set("subcategory", subcategory);
    if (region) params.set("region", region);
    if (city) params.set("city", city);
    if (area) params.set("area", area);

    const queryString = params.toString();

    window.history.pushState(
      {},
      "",
      queryString ? `/listings?${queryString}` : "/listings",
    );
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

  function handleRegionChange(value: string) {
    setRegion(value);
    setCity("");
    setArea("");
  }

  function handleCityChange(value: string) {
    setCity(value);
    setArea("");
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      alert(
        "Location detection is not supported on this device.",
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("GPS coordinates:", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        alert(
          "Your phone location was detected. Select your Region, City/Town and Area to filter listings. GhanaPostGPS delivery matching must be connected separately.",
        );
      },
      () => {
        alert(
          "Unable to detect your location. Please select your Region, City/Town and Area manually.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="bg-gradient-to-r from-blue-800 via-blue-700 to-sky-500 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href="/"
                className="text-sm font-semibold text-blue-100 hover:text-white"
              >
                ← BEST SALES GHANA
              </Link>

              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                Search Marketplace
              </h1>

              <p className="mt-2 max-w-2xl text-blue-100">
                Find products, vehicles, property, machinery,
                electronics, agriculture, services and more
                across Ghana.
              </p>
            </div>

            <Link
              href="/post-ad"
              className="inline-flex w-fit rounded-xl bg-white px-5 py-3 font-bold text-blue-800 shadow-lg hover:bg-blue-50"
            >
              + Post an Ad
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <form
          onSubmit={performSearch}
          className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-gray-200"
        >
          <div className="grid gap-3 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Search products
              </label>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Printer, phone, car, location..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Category
              </label>

              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setSubcategory("");
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 outline-none focus:border-blue-600"
              >
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Subcategory
              </label>

              <select
                value={subcategory}
                onChange={(event) =>
                  setSubcategory(event.target.value)
                }
                disabled={
                  category === "All Categories" ||
                  !SUBCATEGORY_OPTIONS[category]
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 outline-none focus:border-blue-600 disabled:bg-gray-100"
              >
                <option value="">All Subcategories</option>

                {(SUBCATEGORY_OPTIONS[category] || []).map(
                  (item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Region
              </label>

              <select
                value={region}
                onChange={(event) =>
                  handleRegionChange(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 outline-none focus:border-blue-600"
              >
                <option value="">All Ghana</option>

                {regions.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                City / Town
              </label>

              <select
                value={city}
                onChange={(event) =>
                  handleCityChange(event.target.value)
                }
                disabled={!region}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 outline-none focus:border-blue-600 disabled:bg-gray-100"
              >
                <option value="">
                  {region
                    ? "All Cities / Towns"
                    : "Select Region First"}
                </option>

                {cities.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Area
              </label>

              <select
                value={area}
                onChange={(event) =>
                  setArea(event.target.value)
                }
                disabled={!city}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 outline-none focus:border-blue-600 disabled:bg-gray-100"
              >
                <option value="">
                  {city ? "All Areas" : "Select City/Town First"}
                </option>

                {areas.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
            >
              🔍 Search
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>

            <button
              type="button"
              onClick={detectLocation}
              className="rounded-xl border border-sky-300 bg-sky-50 px-6 py-3 font-semibold text-sky-800 hover:bg-sky-100"
            >
              📍 Detect Location
            </button>
          </div>
        </form>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="text-2xl">📍</div>
            <h3 className="mt-2 font-bold text-blue-900">
              Item / Seller Location
            </h3>
            <p className="mt-1 text-sm text-blue-800">
              Check where the seller or product is located
              before making a purchase.
            </p>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5">
            <div className="text-2xl">🗺️</div>
            <h3 className="mt-2 font-bold text-sky-900">
              GhanaPost GPS
            </h3>
            <p className="mt-1 text-sm text-sky-800">
              Product listings can display their saved GhanaPostGPS
              digital address when available.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-2xl">🚚</div>
            <h3 className="mt-2 font-bold text-gray-900">
              Delivery & Tracking
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Delivery tracking requires connection to the
              marketplace order and delivery system.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Marketplace Listings
            </h2>

            <p className="text-sm text-gray-600">
              {loading
                ? "Loading listings..."
                : `${filteredListings.length} listing${
                    filteredListings.length === 1 ? "" : "s"
                  } found`}
            </p>
          </div>

          {(search ||
            category !== "All Categories" ||
            subcategory ||
            region ||
            city ||
            area) && (
            <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800">
              Filters active
            </div>
          )}
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
            <p className="mt-4 text-gray-600">
              Loading marketplace listings...
            </p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
            <div className="text-5xl">🔎</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              No listings found
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-gray-600">
              Try a different search term or change your category
              and location filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => {
              const imageUrl = listingImages[listing.id];
              const showImage =
                Boolean(imageUrl) && !imageErrors[listing.id];

              return (
                <article
                  key={listing.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {showImage ? (
                      <img
                        src={imageUrl}
                        alt={listing.title || "Marketplace product"}
                        loading="lazy"
                        className="h-full w-full object-contain"
                        onError={() =>
                          setImageErrors((previous) => ({
                            ...previous,
                            [listing.id]: true,
                          }))
                        }
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <span className="text-5xl">🛍️</span>
                        <span className="text-xs">
                          Product image unavailable
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {listing.featured && (
                      <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-800">
                        TOP PRIORITY
                      </span>
                    )}

                    <h3 className="mt-2 line-clamp-2 text-lg font-bold text-gray-900">
                      {listing.title || "Untitled Listing"}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {listing.description ||
                        "No description provided."}
                    </p>

                    <div className="mt-3 text-xl font-bold text-blue-700">
                      {formatPrice(
                        listing.price,
                        listing.currency_code,
                        listing.currency,
                      )}
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-gray-500">
                      {(listing.item_region ||
                        listing.item_city ||
                        listing.item_area ||
                        listing.location) && (
                        <div>
                          📍{" "}
                          {[
                            listing.item_area,
                            listing.item_city,
                            listing.item_region,
                          ]
                            .filter(Boolean)
                            .join(", ") || listing.location}
                        </div>
                      )}

                      {(listing.category || listing.subcategory) && (
                        <div>
                          🏷️{" "}
                          {listing.category || listing.subcategory}
                          {listing.category && listing.subcategory
                            ? ` • ${listing.subcategory}`
                            : ""}
                        </div>
                      )}

                      {listing.item_ghana_post_gps && (
                        <div className="break-words">
                          📮 GhanaPostGPS:{" "}
                          {listing.item_ghana_post_gps}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="rounded-xl bg-blue-700 px-3 py-2.5 text-center text-sm font-bold text-white hover:bg-blue-800"
                      >
                        View Listing
                      </Link>

                      <Link
                        href={`/chat?listing=${listing.id}`}
                        className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-center text-sm font-bold text-blue-800 hover:bg-blue-100"
                      >
                        Chat Seller
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <section className="mt-12 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Search across BEST SALES GHANA
          </h2>

          <p className="mt-2 text-gray-600">
            Find listings across the marketplace using one search
            page.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.slice(1).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setCategory(item);
                  setSubcategory("");
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
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
