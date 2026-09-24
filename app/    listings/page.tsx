"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/supabase-browser";

type Listing = {
  id: number;
  title: string;
  category: string | null;
  subcategory: string | null;
  price: number | null;
  currency: string | null;
  currency_code: string | null;
  location: string | null;
  description: string | null;
  status: string | null;
  created_at: string;
};

type Currency = {
  code: string;
  name?: string | null;
  symbol?: string | null;
  rate_to_ghs?: number | null;
  manual_rate_from_ghs?: number | null;
};

const GHANA_LOCATION_GROUPS: Record<
  string,
  {
    cities: string[];
    areas: string[];
  }
> = {
  "Greater Accra": {
    cities: [
      "Accra",
      "Tema",
      "Madina",
      "Teshie",
      "Nungua",
      "Kasoa",
    ],
    areas: [
      "Osu",
      "East Legon",
      "Airport",
      "Cantonments",
      "Spintex",
      "Adabraka",
      "Dansoman",
      "Lapaz",
      "Achimota",
      "Dzorwulu",
      "North Legon",
      "Haatso",
      "Legon",
      "Kasoa",
      "Tema Community 1",
      "Tema Community 25",
    ],
  },

  "Ashanti": {
    cities: [
      "Kumasi",
      "Obuasi",
      "Konongo",
      "Ejisu",
      "Mampong",
    ],
    areas: [
      "Adum",
      "Bantama",
      "Suame",
      "Asokwa",
      "Ahodwo",
      "Kwadaso",
      "Oforikrom",
      "Tafo",
      "Dichemso",
    ],
  },

  "Western": {
    cities: [
      "Takoradi",
      "Sekondi",
      "Tarkwa",
      "Axim",
      "Elubo",
    ],
    areas: [
      "Market Circle",
      "Kojokrom",
      "Effia",
      "Anaji",
      "New Takoradi",
    ],
  },

  "Central": {
    cities: [
      "Cape Coast",
      "Kasoa",
      "Winneba",
      "Mankessim",
      "Elmina",
    ],
    areas: [
      "Kotokuraba",
      "Pedu",
      "Abura",
      "Ola",
      "Cape Coast Centre",
    ],
  },

  "Eastern": {
    cities: [
      "Koforidua",
      "Nkawkaw",
      "Suhum",
      "Nsawam",
      "Akropong",
    ],
    areas: [
      "Jackson Park",
      "Effiduase",
      "Adweso",
      "Betom",
      "Koforidua Centre",
    ],
  },

  "Volta": {
    cities: [
      "Ho",
      "Hohoe",
      "Keta",
      "Aflao",
      "Sogakope",
    ],
    areas: [
      "Ho Central",
      "Bankoe",
      "Klefe",
      "Adaklu",
    ],
  },

  "Northern": {
    cities: [
      "Tamale",
      "Yendi",
      "Salaga",
      "Savelugu",
    ],
    areas: [
      "Tamale Central",
      "Lamashegu",
      "Jisonayili",
      "Vittin",
      "Dungu",
    ],
  },

  "Bono": {
    cities: [
      "Sunyani",
      "Berekum",
      "Dormaa Ahenkro",
    ],
    areas: [
      "Sunyani Central",
      "New Dormaa",
      "Magazine",
    ],
  },

  "Bono East": {
    cities: [
      "Techiman",
      "Kintampo",
      "Nkoranza",
    ],
    areas: [
      "Techiman Central",
      "Tuobodom",
      "Kentikrono",
    ],
  },

  "Ahafo": {
    cities: [
      "Goaso",
      "Bechem",
      "Duayaw Nkwanta",
    ],
    areas: [
      "Goaso Central",
      "Bechem Central",
    ],
  },

  "Western North": {
    cities: [
      "Sefwi Wiawso",
      "Bibiani",
      "Enchi",
    ],
    areas: [
      "Wiawso Central",
      "Bibiani Central",
    ],
  },

  "Upper East": {
    cities: [
      "Bolgatanga",
      "Bawku",
      "Navrongo",
    ],
    areas: [
      "Bolga Central",
      "Zuarungu",
      "Daporetindongo",
    ],
  },

  "Upper West": {
    cities: [
      "Wa",
      "Lawra",
      "Tumu",
    ],
    areas: [
      "Wa Central",
      "Dondoli",
      "Kpaguri",
    ],
  },

  "Oti": {
    cities: [
      "Dambai",
      "Kete Krachi",
      "Nkwanta",
    ],
    areas: [
      "Dambai Central",
      "Nkwanta Central",
    ],
  },

  "Savannah": {
    cities: [
      "Damongo",
      "Bole",
      "Salaga",
    ],
    areas: [
      "Damongo Central",
      "Bole Central",
    ],
  },

  "North East": {
    cities: [
      "Nalerigu",
      "Walewale",
      "Gambaga",
    ],
    areas: [
      "Nalerigu Central",
      "Walewale Central",
    ],
  },
};

const CATEGORY_OPTIONS = [
  "Property",
  "Vehicles",
  "Electronics",
  "Machinery",
  "Agriculture",
  "Services",
  "Phones & Tablets",
  "Cars",
  "Fashion",
  "Jobs & Services",
  "Home & Garden",
];

const SUBCATEGORY_OPTIONS: Record<string, string[]> = {
  Property: [
    "Houses",
    "Apartments",
    "Land",
    "Commercial Property",
    "Office Space",
    "Warehouses",
    "Shops",
  ],

  Vehicles: [
    "Cars",
    "Motorcycles",
    "Trucks",
    "Buses",
    "Heavy Equipment",
    "Spare Parts",
  ],

  Electronics: [
    "Televisions",
    "Computers",
    "Laptops",
    "Printers",
    "Cameras",
    "Audio",
    "Accessories",
  ],

  Machinery: [
    "Industrial Machines",
    "Printing Equipment",
    "Construction Equipment",
    "Agricultural Machines",
    "Generators",
    "Factory Equipment",
  ],

  Agriculture: [
    "Farm Produce",
    "Livestock",
    "Farm Equipment",
    "Seeds",
    "Fertilizer",
    "Poultry",
  ],

  Services: [
    "Business Services",
    "Repairs",
    "Graphic Design",
    "Construction",
    "Transport",
    "Cleaning",
    "Professional Services",
  ],

  "Phones & Tablets": [
    "Mobile Phones",
    "Tablets",
    "Smart Watches",
    "Phone Accessories",
  ],

  Cars: [
    "Toyota",
    "Mercedes-Benz",
    "BMW",
    "Hyundai",
    "Kia",
    "Honda",
    "Other Cars",
  ],

  Fashion: [
    "Men",
    "Women",
    "Children",
    "Shoes",
    "Bags",
    "Accessories",
  ],

  "Jobs & Services": [
    "Jobs",
    "Freelance",
    "Professional Services",
    "Domestic Services",
  ],

  "Home & Garden": [
    "Furniture",
    "Kitchen",
    "Home Appliances",
    "Garden",
    "Decor",
  ],
};

function ListingsContent() {
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<Listing[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [region, setRegion] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const q =
      searchParams.get("q") ||
      searchParams.get("search") ||
      searchParams.get("query") ||
      "";

    const categoryParam =
      searchParams.get("category") || "";

    const subcategoryParam =
      searchParams.get("subcategory") || "";

    const locationParam =
      searchParams.get("location") || "";

    const regionParam =
      searchParams.get("region") || "";

    setSearch(q);
    setCategory(categoryParam);
    setSubcategory(subcategoryParam);
    setLocation(locationParam);
    setRegion(regionParam);
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    try {
      const [
        { data: listingsData, error: listingsError },
        { data: currenciesData, error: currenciesError },
      ] = await Promise.all([
        supabaseBrowser
          .from("listings")
          .select(
            `
              id,
              title,
              category,
              subcategory,
              price,
              currency,
              currency_code,
              location,
              description,
              status,
              created_at
            `
          )
          .eq("status", "active")
          .order("created_at", {
            ascending: false,
          }),

        supabaseBrowser
          .from("currencies")
          .select(
            `
              code,
              name,
              symbol,
              rate_to_ghs,
              manual_rate_from_ghs
            `
          ),
      ]);

      if (listingsError) {
        console.error(
          "Listings loading error:",
          listingsError
        );
      }

      if (currenciesError) {
        console.error(
          "Currency loading error:",
          currenciesError
        );
      }

      setListings(
        (listingsData as Listing[]) || []
      );

      setCurrencies(
        (currenciesData as Currency[]) || []
      );
    } catch (error) {
      console.error(
        "Marketplace search loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredListings = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const normalizedLocation =
      location.trim().toLowerCase();

    return listings.filter((listing) => {
      const title =
        listing.title?.toLowerCase() || "";

      const description =
        listing.description?.toLowerCase() || "";

      const listingCategory =
        listing.category?.toLowerCase() || "";

      const listingSubcategory =
        listing.subcategory?.toLowerCase() || "";

      const listingLocation =
        listing.location?.toLowerCase() || "";

      const matchesSearch =
        !normalizedSearch ||
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        listingCategory.includes(normalizedSearch) ||
        listingSubcategory.includes(
          normalizedSearch
        ) ||
        listingLocation.includes(
          normalizedSearch
        );

      const matchesCategory =
        !category ||
        listingCategory ===
          category.toLowerCase() ||
        listingCategory.includes(
          category.toLowerCase()
        ) ||
        category
          .toLowerCase()
          .includes(listingCategory);

      const matchesSubcategory =
        !subcategory ||
        listingSubcategory ===
          subcategory.toLowerCase() ||
        listingSubcategory.includes(
          subcategory.toLowerCase()
        ) ||
        subcategory
          .toLowerCase()
          .includes(listingSubcategory);

      const matchesRegion =
        !region ||
        listingLocation.includes(
          region.toLowerCase()
        );

      const matchesLocation =
        !normalizedLocation ||
        listingLocation.includes(
          normalizedLocation
        );

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubcategory &&
        matchesRegion &&
        matchesLocation
      );
    });
  }, [
    listings,
    search,
    category,
    subcategory,
    region,
    location,
  ]);

  const currentSubcategories = useMemo(() => {
    if (!category) {
      return [];
    }

    return (
      SUBCATEGORY_OPTIONS[category] || []
    );
  }, [category]);

  const availableLocations = useMemo(() => {
    if (!region) {
      return [];
    }

    return [
      ...(GHANA_LOCATION_GROUPS[region]?.cities ||
        []),
      ...(GHANA_LOCATION_GROUPS[region]?.areas ||
        []),
    ];
  }, [region]);

  function getCurrency(code: string | null) {
    if (!code) {
      return null;
    }

    return (
      currencies.find(
        (currency) =>
          currency.code.toUpperCase() ===
          code.toUpperCase()
      ) || null
    );
  }

  function formatPrice(listing: Listing) {
    if (
      listing.price === null ||
      listing.price === undefined
    ) {
      return "Price on request";
    }

    const code =
      listing.currency_code ||
      listing.currency ||
      "GHS";

    const currency = getCurrency(code);

    const symbol =
      currency?.symbol ||
      (code === "GHS"
        ? "GH₵"
        : code === "USD"
          ? "$"
          : code === "EUR"
            ? "€"
            : code === "GBP"
              ? "£"
              : code === "CNY"
                ? "¥"
                : `${code} `);

    return `${symbol}${Number(
      listing.price
    ).toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function clearFilters() {
    setSearch("");
    setCategory("");
    setSubcategory("");
    setRegion("");
    setLocation("");
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href="/"
                className="text-2xl font-extrabold tracking-tight text-blue-700"
              >
                BEST SALES GHANA
              </Link>

              <p className="mt-1 text-sm text-gray-500">
                Search products, vehicles, property,
                machinery, agriculture and services.
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/post-ad"
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Post an Ad
              </Link>

              <Link
                href="/account"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Account
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH AREA */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <form
            onSubmit={(event) => {
              event.preventDefault();

              const params =
                new URLSearchParams();

              if (search.trim()) {
                params.set("q", search.trim());
              }

              if (category) {
                params.set("category", category);
              }

              if (subcategory) {
                params.set(
                  "subcategory",
                  subcategory
                );
              }

              if (region) {
                params.set("region", region);
              }

              if (location) {
                params.set(
                  "location",
                  location
                );
              }

              window.location.href =
                `/listings?${params.toString()}`;
            }}
            className="grid gap-3 md:grid-cols-2 lg:grid-cols-6"
          >
            <div className="lg:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                What are you looking for?
              </label>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search products, cars, land, machines..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Category
              </label>

              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setSubcategory("");
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-600"
              >
                <option value="">
                  All categories
                </option>

                {CATEGORY_OPTIONS.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Subcategory
              </label>

              <select
                value={subcategory}
                onChange={(event) =>
                  setSubcategory(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-600"
              >
                <option value="">
                  All subcategories
                </option>

                {currentSubcategories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Region
              </label>

              <select
                value={region}
                onChange={(event) => {
                  setRegion(event.target.value);
                  setLocation("");
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-600"
              >
                <option value="">
                  All Ghana
                </option>

                {Object.keys(
                  GHANA_LOCATION_GROUPS
                ).map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                City / Area
              </label>

              <select
                value={location}
                onChange={(event) =>
                  setLocation(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-600"
              >
                <option value="">
                  Any location
                </option>

                {availableLocations.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex items-end gap-2 md:col-span-2 lg:col-span-6">
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-6 py-3 text-sm font-bold text-white hover:bg-blue-800"
              >
                Search
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(
                    "Location detection will be connected to the Ghana location and delivery system."
                  );
                }}
                className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                Detect Location
              </button>
            </div>
          </form>

          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800">
            <strong>Location:</strong>{" "}
            Marketplace search uses the seller/item
            location. Buyer GPS and GhanaPost GPS will
            be used separately for delivery and nearby
            services.
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Marketplace Search
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {loading
                ? "Loading listings..."
                : `${filteredListings.length} listing${
                    filteredListings.length === 1
                      ? ""
                      : "s"
                  } found`}
            </p>
          </div>

          {(search ||
            category ||
            subcategory ||
            region ||
            location) && (
            <div className="flex flex-wrap gap-2">
              {search && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                  Search: {search}
                </span>
              )}

              {category && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                  {category}
                </span>
              )}

              {subcategory && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                  {subcategory}
                </span>
              )}

              {region && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                  {region}
                </span>
              )}

              {location && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                  {location}
                </span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <div className="h-48 animate-pulse bg-gray-200" />

                <div className="space-y-3 p-4">
                  <div className="h-4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
              🔎
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              No listings found
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
              Try another search term, category,
              region or location.
            </p>

            <button
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map(
              (listing) => (
                <article
                  key={listing.id}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <Link
                    href={`/listings/${listing.id}`}
                    className="block"
                  >
                    <div className="flex h-48 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-5xl">
                      🛍️
                    </div>

                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase text-blue-700">
                          {listing.category ||
                            "Marketplace"}
                        </span>

                        <span className="text-[10px] text-gray-400">
                          {new Date(
                            listing.created_at
                          ).toLocaleDateString(
                            "en-GH"
                          )}
                        </span>
                      </div>

                      <h2 className="line-clamp-2 min-h-[48px] text-base font-bold text-gray-900 group-hover:text-blue-700">
                        {listing.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 min-h-[40px] text-xs text-gray-500">
                        {listing.description ||
                          "View this listing for more details."}
                      </p>

                      <div className="mt-4 text-lg font-extrabold text-blue-700">
                        {formatPrice(listing)}
                      </div>

                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                        <span>📍</span>

                        <span className="line-clamp-1">
                          {listing.location ||
                            "Location not specified"}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="grid grid-cols-2 gap-2 border-t border-gray-100 p-3">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="rounded-lg bg-gray-100 px-3 py-2 text-center text-xs font-semibold text-gray-700 hover:bg-gray-200"
                    >
                      View
                    </Link>

                    <Link
                      href={`/chat?listing=${listing.id}`}
                      className="rounded-lg bg-blue-700 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-blue-800"
                    >
                      Chat Seller
                    </Link>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      {/* DELIVERY INFORMATION */}
      <section className="border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-xl border bg-white p-5">
              <div className="mb-3 text-2xl">
                📍
              </div>

              <h3 className="font-bold">
                Seller / Item Location
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Search listings by the physical
                location of the item or seller.
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <div className="mb-3 text-2xl">
                🛰️
              </div>

              <h3 className="font-bold">
                GhanaPost GPS
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Buyer delivery addresses will support
                GhanaPost GPS digital addresses for
                accurate delivery.
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <div className="mb-3 text-2xl">
                🚚
              </div>

              <h3 className="font-bold">
                Delivery & Tracking
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Delivery tracking will be connected to
                the marketplace order and delivery
                system.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-700" />

            <p className="text-sm font-medium text-gray-600">
              Loading marketplace...
            </p>
          </div>
        </main>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}
