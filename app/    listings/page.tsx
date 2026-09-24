"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  name: string;
  symbol: string;
  manual_rate_from_ghs: number | null;
};

const categoryIcons: Record<string, string> = {
  Vehicles: "🚗",
  Cars: "🚗",
  Property: "🏠",
  Electronics: "📱",
  Machinery: "🏭",
  Agriculture: "🚜",
  Services: "💼",
  "Jobs & Services": "💼",
  Fashion: "👕",
  "Home & Garden": "🏡",
  "Phones & Tablets": "📱",
};

const fallbackIcon = "🛍️";

/*
 * CENTRAL GHANA LOCATION SEARCH
 *
 * These are search groups.
 * Listings can still contain specific locations such as:
 *
 * East Legon
 * Cantonments
 * Kumasi
 * Adum
 * Tema
 * etc.
 */
const GHANA_LOCATION_GROUPS: Record<string, string[]> = {
  "Greater Accra": [
    "Accra",
    "Tema",
    "East Legon",
    "Cantonments",
    "Airport Residential",
    "Osu",
    "Labone",
    "Spintex",
    "Madina",
    "Adenta",
    "Kasoa",
  ],

  Ashanti: [
    "Kumasi",
    "Adum",
    "Bantama",
    "Asokwa",
    "Ahodwo",
    "Suame",
  ],

  Western: [
    "Takoradi",
    "Sekondi",
    "Tarkwa",
    "Axim",
  ],

  Central: [
    "Cape Coast",
    "Kasoa",
    "Winneba",
    "Elmina",
  ],

  Eastern: [
    "Koforidua",
    "Nkawkaw",
    "Nsawam",
    "Akropong",
  ],

  Volta: [
    "Ho",
    "Hohoe",
    "Keta",
    "Aflao",
  ],

  Northern: [
    "Tamale",
    "Yendi",
    "Savelugu",
  ],

  Bono: [
    "Sunyani",
    "Berekum",
    "Dormaa",
  ],

  "Bono East": [
    "Techiman",
    "Kintampo",
  ],

  Ahafo: [
    "Goaso",
    "Duayaw Nkwanta",
  ],

  "Upper East": [
    "Bolgatanga",
    "Navrongo",
    "Bawku",
  ],

  "Upper West": [
    "Wa",
    "Lawra",
    "Tumu",
  ],

  Oti: [
    "Dambai",
    "Jasikan",
  ],

  Savannah: [
    "Damongo",
    "Salaga",
  ],

  "North East": [
    "Nalerigu",
    "Walewale",
  ],

  "Western North": [
    "Sefwi Wiawso",
    "Bibiani",
  ],
};

export default function ListingsPage() {
  const supabase = supabaseBrowser();
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<Listing[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All Categories");

  const [selectedSubcategory, setSelectedSubcategory] =
    useState("All Subcategories");

  const [selectedLocation, setSelectedLocation] =
    useState("All Ghana");

  const [selectedRegion, setSelectedRegion] =
    useState("All Regions");

  const [displayCurrency, setDisplayCurrency] =
    useState("GHS");

  /*
   * READ SEARCH PARAMETERS FROM URL
   *
   * Supports:
   *
   * /listings?q=Apartment
   *
   * /listings?search=Apartment
   *
   * /listings?category=Property
   *
   * /listings?subcategory=Apartments
   *
   * /listings?location=Accra
   *
   * All can be combined.
   */
  useEffect(() => {
    const query =
      searchParams.get("q") ||
      searchParams.get("search") ||
      searchParams.get("query") ||
      "";

    const category =
      searchParams.get("category") || "";

    const subcategory =
      searchParams.get("subcategory") || "";

    const location =
      searchParams.get("location") || "";

    const region =
      searchParams.get("region") || "";

    setSearch(query);

    setSelectedCategory(
      category || "All Categories"
    );

    setSelectedSubcategory(
      subcategory || "All Subcategories"
    );

    setSelectedLocation(
      location || "All Ghana"
    );

    setSelectedRegion(
      region || "All Regions"
    );
  }, [searchParams]);

  /*
   * LOAD MARKETPLACE DATA
   */
  useEffect(() => {
    async function loadMarketplace() {
      setLoading(true);
      setErrorMessage("");

      try {
        const [
          listingsResult,
          currenciesResult,
        ] = await Promise.all([
          supabase
            .from("listings")
            .select(
              "id,title,category,subcategory,price,currency,currency_code,location,description,status,created_at"
            )
            .eq("status", "active")
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("currencies")
            .select(
              "code,name,symbol,manual_rate_from_ghs"
            )
            .in("code", [
              "GHS",
              "USD",
              "CNY",
              "EUR",
              "GBP",
            ]),
        ]);

        if (listingsResult.error) {
          throw listingsResult.error;
        }

        if (currenciesResult.error) {
          throw currenciesResult.error;
        }

        setListings(
          (listingsResult.data || []) as Listing[]
        );

        setCurrencies(
          (currenciesResult.data || []) as Currency[]
        );
      } catch (error: any) {
        console.error(
          "Marketplace loading error:",
          error
        );

        setErrorMessage(
          error?.message ||
            "Unable to load marketplace listings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMarketplace();
  }, [supabase]);

  /*
   * CURRENCY HELPERS
   */
  function getCurrency(code: string) {
    return currencies.find(
      (currency) => currency.code === code
    );
  }

  function getCurrencySymbol(code: string) {
    const currency = getCurrency(code);

    if (currency?.symbol) {
      return currency.symbol;
    }

    if (code === "GHS") return "GH₵";
    if (code === "USD") return "$";
    if (code === "CNY") return "¥";
    if (code === "EUR") return "€";
    if (code === "GBP") return "£";

    return code;
  }

  /*
   * PRICE CONVERSION
   *
   * manual_rate_from_ghs means:
   *
   * 1 GHS = X foreign currency
   */
  function convertPrice(
    amount: number,
    fromCode: string,
    toCode: string
  ) {
    if (fromCode === toCode) {
      return amount;
    }

    if (fromCode === "GHS") {
      const targetCurrency =
        getCurrency(toCode);

      if (
        !targetCurrency?.manual_rate_from_ghs
      ) {
        return null;
      }

      return (
        amount *
        targetCurrency.manual_rate_from_ghs
      );
    }

    if (toCode === "GHS") {
      const sourceCurrency =
        getCurrency(fromCode);

      if (
        !sourceCurrency?.manual_rate_from_ghs
      ) {
        return null;
      }

      return (
        amount /
        sourceCurrency.manual_rate_from_ghs
      );
    }

    const sourceCurrency =
      getCurrency(fromCode);

    const targetCurrency =
      getCurrency(toCode);

    if (
      !sourceCurrency?.manual_rate_from_ghs ||
      !targetCurrency?.manual_rate_from_ghs
    ) {
      return null;
    }

    const amountInGhs =
      amount /
      sourceCurrency.manual_rate_from_ghs;

    return (
      amountInGhs *
      targetCurrency.manual_rate_from_ghs
    );
  }

  function formatPrice(
    amount: number,
    currencyCode: string
  ) {
    return `${getCurrencySymbol(
      currencyCode
    )} ${amount.toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /*
   * GET CATEGORY
   */
  const categories = useMemo(() => {
    const values = new Set<string>();

    listings.forEach((item) => {
      if (item.category) {
        values.add(item.category);
      }
    });

    return Array.from(values).sort();
  }, [listings]);

  /*
   * GET SUBCATEGORIES
   */
  const subcategories = useMemo(() => {
    const values = new Set<string>();

    listings.forEach((item) => {
      if (
        selectedCategory === "All Categories" ||
        item.category === selectedCategory
      ) {
        if (item.subcategory) {
          values.add(item.subcategory);
        }
      }
    });

    return Array.from(values).sort();
  }, [
    listings,
    selectedCategory,
  ]);

  /*
   * GET REGIONS
   */
  const regions = useMemo(() => {
    return Object.keys(
      GHANA_LOCATION_GROUPS
    );
  }, []);

  /*
   * GET SPECIFIC LOCATIONS
   */
  const locations = useMemo(() => {
    const values = new Set<string>();

    listings.forEach((item) => {
      if (item.location) {
        values.add(item.location);
      }
    });

    Object.values(
      GHANA_LOCATION_GROUPS
    ).forEach((areas) => {
      areas.forEach((area) => {
        values.add(area);
      });
    });

    return Array.from(values).sort();
  }, [listings]);

  /*
   * LOCATION MATCHING
   *
   * This allows:
   *
   * Region → all locations in that region
   *
   * City/Area → exact/specific location
   */
  function locationMatches(
    listingLocation: string | null
  ) {
    if (!listingLocation) {
      return false;
    }

    if (
      selectedLocation === "All Ghana" &&
      selectedRegion === "All Regions"
    ) {
      return true;
    }

    const normalized =
      listingLocation
        .trim()
        .toLowerCase();

    /*
     * Specific location
     */
    if (
      selectedLocation !== "All Ghana"
    ) {
      return (
        normalized ===
          selectedLocation
            .trim()
            .toLowerCase() ||
        normalized.includes(
          selectedLocation
            .trim()
            .toLowerCase()
        )
      );
    }

    /*
     * Region search
     */
    if (
      selectedRegion !== "All Regions"
    ) {
      const areas =
        GHANA_LOCATION_GROUPS[
          selectedRegion
        ] || [];

      return areas.some((area) =>
        normalized.includes(
          area.toLowerCase()
        )
      );
    }

    return true;
  }

  /*
   * CENTRAL SEARCH FILTER
   */
  const filteredListings = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return listings.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.title
          ?.toLowerCase()
          .includes(searchText) ||
        item.description
          ?.toLowerCase()
          .includes(searchText) ||
        item.category
          ?.toLowerCase()
          .includes(searchText) ||
        item.subcategory
          ?.toLowerCase()
          .includes(searchText) ||
        item.location
          ?.toLowerCase()
          .includes(searchText);

      const matchesCategory =
        selectedCategory ===
          "All Categories" ||
        item.category ===
          selectedCategory ||
        item.subcategory ===
          selectedCategory;

      const matchesSubcategory =
        selectedSubcategory ===
          "All Subcategories" ||
        item.subcategory ===
          selectedSubcategory;

      const matchesLocation =
        locationMatches(item.location);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubcategory &&
        matchesLocation
      );
    });
  }, [
    listings,
    search,
    selectedCategory,
    selectedSubcategory,
    selectedRegion,
    selectedLocation,
  ]);

  /*
   * LISTING HELPERS
   */
  function getListingCurrency(
    item: Listing
  ) {
    return (
      item.currency_code ||
      item.currency ||
      "GHS"
    ).toUpperCase();
  }

  function getListingIcon(
    item: Listing
  ) {
    return (
      categoryIcons[
        item.category || ""
      ] ||
      categoryIcons[
        item.subcategory || ""
      ] ||
      fallbackIcon
    );
  }

  /*
   * CLEAR FILTERS
   */
  function clearFilters() {
    setSearch("");
    setSelectedCategory(
      "All Categories"
    );
    setSelectedSubcategory(
      "All Subcategories"
    );
    setSelectedRegion(
      "All Regions"
    );
    setSelectedLocation(
      "All Ghana"
    );
  }

  /*
   * CHANGE CATEGORY
   */
  function handleCategoryChange(
    value: string
  ) {
    setSelectedCategory(value);

    setSelectedSubcategory(
      "All Subcategories"
    );
  }

  /*
   * CHANGE REGION
   */
  function handleRegionChange(
    value: string
  ) {
    setSelectedRegion(value);

    setSelectedLocation(
      "All Ghana"
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-2xl text-white shadow-md">
              ⭐
            </div>

            <div>
              <div className="text-lg font-black text-slate-900">
                BEST SALES GHANA
              </div>

              <div className="text-xs text-slate-500">
                Buy • Sell • Advertise • Connect
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">

            <Link
              href="/"
              className="font-semibold text-slate-700 hover:text-blue-700"
            >
              Home
            </Link>

            <Link
              href="/categories"
              className="font-semibold text-slate-700 hover:text-blue-700"
            >
              Categories
            </Link>

            <Link
              href="/listings"
              className="font-semibold text-blue-700"
            >
              Listings
            </Link>

            <Link
              href="/sell"
              className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
            >
              Post an Ad
            </Link>

          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-400 text-white">

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">
            BEST SALES GHANA Marketplace
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl lg:text-6xl">
            Browse Listings
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/90">
            Search vehicles, property, electronics,
            machinery, agriculture, services and more
            across Ghana.
          </p>

        </div>
      </section>

      {/* CENTRAL SEARCH */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">
              Search BEST SALES GHANA
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search by item, category, subcategory,
              region or specific location.
            </p>
          </div>

          {/* SEARCH ROW */}
          <div className="grid gap-3 lg:grid-cols-[1fr_190px_190px_190px_150px]">

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search products, vehicles, property, machinery..."
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />

            {/* CATEGORY */}
            <select
              value={selectedCategory}
              onChange={(event) =>
                handleCategoryChange(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            >
              <option>
                All Categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>

            {/* SUBCATEGORY */}
            <select
              value={selectedSubcategory}
              onChange={(event) =>
                setSelectedSubcategory(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            >
              <option>
                All Subcategories
              </option>

              {subcategories.map(
                (subcategory) => (
                  <option
                    key={subcategory}
                    value={subcategory}
                  >
                    {subcategory}
                  </option>
                )
              )}
            </select>

            {/* REGION */}
            <select
              value={selectedRegion}
              onChange={(event) =>
                handleRegionChange(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            >
              <option>
                All Regions
              </option>

              {regions.map(
                (region) => (
                  <option
                    key={region}
                    value={region}
                  >
                    {region}
                  </option>
                )
              )}
            </select>

            {/* CURRENCY */}
            <select
              value={displayCurrency}
              onChange={(event) =>
                setDisplayCurrency(
                  event.target.value
                )
              }
              className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-bold text-blue-800 outline-none"
            >
              <option value="GHS">
                🇬🇭 GHS
              </option>

              <option value="USD">
                🇺🇸 USD
              </option>

              <option value="CNY">
                🇨🇳 RMB
              </option>

              <option value="EUR">
                🇪🇺 EUR
              </option>

              <option value="GBP">
                🇬🇧 GBP
              </option>
            </select>

          </div>

          {/* SPECIFIC LOCATION */}
          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">

            <select
              value={selectedLocation}
              onChange={(event) =>
                setSelectedLocation(
                  event.target.value
                )
              }
              className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 outline-none"
            >
              <option value="All Ghana">
                📍 All Ghana / Any Location
              </option>

              {locations.map(
                (location) => (
                  <option
                    key={location}
                    value={location}
                  >
                    📍 {location}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 hover:bg-slate-50"
            >
              Clear Filters
            </button>

          </div>

          {/* LOCATION INFORMATION */}
          <div className="mt-4 rounded-xl bg-blue-50 p-4">

            <p className="font-black text-slate-900">
              📍 Item / Seller Location
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Select the location where the item,
              vehicle, property or service is located.
              Buyer GPS will be handled separately for
              delivery and nearby searches.
            </p>

          </div>

        </div>
      </section>

      {/* RESULTS */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">

        <div className="mb-8 flex items-end justify-between">

          <div>

            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Marketplace
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Search Results
            </h2>

            <p className="mt-2 text-slate-500">

              {loading
                ? "Loading marketplace listings..."
                : `${filteredListings.length} listings found`}

            </p>

          </div>

          <Link
            href="/sell"
            className="hidden rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800 sm:inline-flex"
          >
            + Post an Ad
          </Link>

        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">

            <p className="font-black">
              Unable to load listings
            </p>

            <p className="mt-1 text-sm">
              {errorMessage}
            </p>

          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {Array.from({
              length: 8,
            }).map((_, index) => (

              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >

                <div className="h-48 bg-slate-200" />

                <div className="space-y-3 p-5">

                  <div className="h-3 w-20 rounded bg-slate-200" />

                  <div className="h-5 w-3/4 rounded bg-slate-200" />

                  <div className="h-4 w-full rounded bg-slate-200" />

                  <div className="h-6 w-1/2 rounded bg-slate-200" />

                </div>

              </div>
            ))}

          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !errorMessage &&
          filteredListings.length === 0 && (

            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <div className="text-5xl">
                🔎
              </div>

              <h3 className="mt-4 text-2xl font-black">
                No listings found
              </h3>

              <p className="mt-2 text-slate-500">
                Try another keyword, category,
                subcategory or location.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
              >
                Clear Filters
              </button>

            </div>
          )}

        {/* LISTINGS */}
        {!loading &&
          filteredListings.length > 0 && (

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {filteredListings.map(
                (item) => {

                  const originalCurrency =
                    getListingCurrency(item);

                  const originalPrice =
                    Number(item.price || 0);

                  const convertedPrice =
                    item.price != null
                      ? convertPrice(
                          originalPrice,
                          originalCurrency,
                          displayCurrency
                        )
                      : null;

                  const hasConversion =
                    convertedPrice !== null;

                  return (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >

                      <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-7xl">
                        {getListingIcon(item)}
                      </div>

                      <div className="p-5">

                        <div className="text-xs font-black uppercase tracking-wider text-blue-700">
                          {item.category ||
                            item.subcategory ||
                            "Marketplace"}
                        </div>

                        {item.subcategory && (
                          <div className="mt-1 text-xs font-bold text-slate-400">
                            {item.subcategory}
                          </div>
                        )}

                        <h3 className="mt-2 text-lg font-black text-slate-900">
                          {item.title}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                          {item.description ||
                            "Contact the seller for more information."}
                        </p>

                        {item.price != null ? (

                          <div className="mt-4">

                            <div className="text-lg font-black text-blue-700">
                              {formatPrice(
                                originalPrice,
                                originalCurrency
                              )}
                            </div>

                            {displayCurrency !==
                              originalCurrency && (

                              <div className="mt-1 text-sm font-bold text-slate-500">

                                {hasConversion
                                  ? `≈ ${formatPrice(
                                      convertedPrice!,
                                      displayCurrency
                                    )}`
                                  : `Rate not set for ${displayCurrency}`}

                              </div>
                            )}

                          </div>

                        ) : (

                          <div className="mt-4 text-lg font-black text-blue-700">
                            Contact Seller
                          </div>

                        )}

                        <div className="mt-2 text-sm text-slate-500">
                          📍{" "}
                          {item.location ||
                            "Ghana"}
                        </div>

                        <Link
                          href={`/chat?listing=${item.id}`}
                          className="mt-5 block rounded-xl border border-blue-700 px-4 py-3 text-center font-bold text-blue-700 hover:bg-blue-50"
                        >
                          Contact Seller
                        </Link>

                        <Link
                          href={`/listings/${item.id}`}
                          className="mt-2 block rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800"
                        >
                          View Listing
                        </Link>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

      </section>

      {/* DELIVERY */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">

        <div className="rounded-3xl bg-slate-950 p-8 text-white sm:p-10">

          <div className="grid gap-8 md:grid-cols-3">

            <div>
              <div className="text-3xl">
                🚚
              </div>

              <h3 className="mt-3 text-xl font-black">
                Optional Delivery
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Individual sellers can choose whether
                to offer BEST SALES GHANA delivery.
              </p>
            </div>

            <div>
              <div className="text-3xl">
                📍
              </div>

              <h3 className="mt-3 text-xl font-black">
                GhanaPost GPS
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Buyer and seller locations can later
                be captured for delivery.
              </p>
            </div>

            <div>
              <div className="text-3xl">
                📦
              </div>

              <h3 className="mt-3 text-xl font-black">
                Track Your Item
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Marketplace deliveries can receive a
                tracking number.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-10 text-white">

        <div className="mx-auto max-w-7xl px-4 text-center">

          <div className="text-xl font-black">
            BEST SALES GHANA
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Buy • Sell • Advertise • Connect
          </p>

          <p className="mt-6 text-sm text-slate-500">
            © 2026 All Prominent Ghana Limited.
            All rights reserved.
          </p>

        </div>

      </footer>

    </main>
  );
}
