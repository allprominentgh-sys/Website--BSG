"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Listing = {
  id: number;
  title: string;
  price: string;
  location: string;
  category: string;
  seller: string;
  image: string;
  verified?: boolean;
  featured?: boolean;
};

const listings: Listing[] = [
  {
    id: 1,
    title: "iPhone 15 Pro Max",
    price: "GH₵ 14,500",
    location: "Accra",
    category: "Phones & Tablets",
    seller: "Prominent Store",
    image: "📱",
    verified: true,
    featured: true,
  },
  {
    id: 2,
    title: "Toyota Corolla 2020",
    price: "GH₵ 185,000",
    location: "Kumasi",
    category: "Cars & Vehicles",
    seller: "Ghana Auto Hub",
    image: "🚗",
    verified: true,
  },
  {
    id: 3,
    title: "Modern 3 Bedroom House",
    price: "GH₵ 850,000",
    location: "East Legon",
    category: "Property",
    seller: "Prime Properties",
    image: "🏠",
    verified: true,
    featured: true,
  },
  {
    id: 4,
    title: "HP Laptop Core i7",
    price: "GH₵ 8,500",
    location: "Accra",
    category: "Electronics",
    seller: "Tech World GH",
    image: "💻",
    verified: true,
  },
  {
    id: 5,
    title: "Men's Premium Shirt",
    price: "GH₵ 350",
    location: "Tema",
    category: "Fashion",
    seller: "Fashion House",
    image: "👕",
  },
  {
    id: 6,
    title: "Professional Plumbing Service",
    price: "From GH₵ 250",
    location: "Accra",
    category: "Jobs & Services",
    seller: "Pro Services GH",
    image: "🛠️",
    verified: true,
  },
  {
    id: 7,
    title: "Samsung Galaxy S24 Ultra",
    price: "GH₵ 13,800",
    location: "Accra",
    category: "Phones & Tablets",
    seller: "Mobile Centre",
    image: "📱",
    verified: true,
  },
  {
    id: 8,
    title: "Commercial Shop Space",
    price: "GH₵ 4,500 / month",
    location: "Spintex",
    category: "Property",
    seller: "City Properties",
    image: "🏢",
    verified: true,
  },
];

const categories = [
  "All Categories",
  "Phones & Tablets",
  "Cars & Vehicles",
  "Property",
  "Electronics",
  "Fashion",
  "Jobs & Services",
  "Industrial Machinery",
  "Printing Equipment",
  "Construction Equipment",
  "Agriculture",
  "Home & Garden",
];

const locations = [
  "All Ghana",
  "Accra",
  "Kumasi",
  "Tema",
  "Takoradi",
  "Cape Coast",
  "Tamale",
  "East Legon",
  "Spintex",
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Ghana");
  const [sort, setSort] = useState("Featured");

  const filteredListings = useMemo(() => {
    const query = search.toLowerCase().trim();

    let result = listings.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.seller.toLowerCase().includes(query);

      const matchesCategory =
        category === "All Categories" || item.category === category;

      const matchesLocation =
        location === "All Ghana" || item.location === location;

      return matchesSearch && matchesCategory && matchesLocation;
    });

    if (sort === "Featured") {
      result = [...result].sort(
        (a, b) => Number(b.featured) - Number(a.featured)
      );
    }

    if (sort === "Newest") {
      result = [...result].sort((a, b) => b.id - a.id);
    }

    return result;
  }, [search, category, location, sort]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setLocation("All Ghana");
  };

  return (
    <main className="marketplace-page min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="site-header sticky top-0 z-50 border-b-2 border-cyan-400 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between gap-4">

            {/* ANIMATED LOGO */}

            <Link href="/" className="group flex min-w-0 items-center gap-3">

              <div className="animated-logo relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-700 shadow-lg">

                <div className="logo-ring absolute inset-1 rounded-xl border-2 border-cyan-300/70" />

                <span className="relative z-10 text-xl font-black text-white">
                  BS
                </span>

              </div>

              <div className="min-w-0">

                <div className="logo-brand text-xl font-black tracking-tight text-blue-700 sm:text-2xl">
                  BEST SALES GHANA
                </div>

                <div className="text-xs font-medium text-slate-500 sm:text-sm">
                  Buy • Sell • Advertise • Connect
                </div>

              </div>

            </Link>

            <Link
              href="/post-ad"
              className="btn-primary hidden rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-400 hover:text-slate-950 sm:block"
            >
              + Sell an Item
            </Link>

          </div>

          <nav className="nav-links flex items-center gap-5 overflow-x-auto whitespace-nowrap pb-1 text-sm font-semibold text-slate-600">

            <Link href="/" className="text-blue-700">
              Home
            </Link>

            <Link href="/listings" className="hover:text-blue-700">
              Marketplace
            </Link>

            <Link href="/post-ad" className="hover:text-blue-700">
              Sell an Item
            </Link>

            <Link href="/account" className="hover:text-blue-700">
              Sign In
            </Link>

          </nav>

        </div>

      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="hero relative overflow-hidden">

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-blue-900/30 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">

          <div className="max-w-4xl">

            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-cyan-100">
              BEST SALES GHANA MARKETPLACE
            </p>

            <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-7xl">

              Find what you need.

              <br />

              <span className="text-cyan-200">
                Sell what you have.
              </span>

            </h1>

            <p className="mt-6 max-w-3xl text-base leading-7 text-white/90 sm:text-lg">

              Discover products, vehicles, property, services, machinery,
              equipment and business opportunities from sellers across Ghana.

            </p>

          </div>

          {/* SEARCH */}

          <div className="hero-search-bar mt-9 rounded-2xl border border-white/30 bg-white/15 p-3 shadow-2xl backdrop-blur-xl">

            <div className="flex flex-col gap-3 lg:flex-row">

              <div className="input-group relative flex-1">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl">
                  🔍
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="What are you looking for?"
                  className="h-14 w-full rounded-xl border border-transparent bg-white pl-12 pr-4 text-base text-slate-900 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />

              </div>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-14 rounded-xl border border-transparent bg-white px-4 text-base text-slate-900 outline-none focus:border-cyan-400 lg:w-52"
              >
                {locations.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("latest-listings")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="h-14 rounded-xl bg-slate-950 px-8 text-base font-bold text-white transition hover:bg-cyan-400 hover:text-slate-950"
              >
                Search
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <section
        id="latest-listings"
        className="main-content mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">

          {/* FILTER SIDEBAR */}

          <aside className="filter-section h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-xl font-extrabold">
                Filters
              </h2>

              {(search ||
                category !== "All Categories" ||
                location !== "All Ghana") && (

                <button
                  type="button"
                  onClick={clearFilters}
                  className="font-bold text-blue-700 hover:underline"
                >
                  Clear
                </button>

              )}

            </div>

            <div className="space-y-5">

              <label className="filter-group block">

                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Search
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search marketplace"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

              </label>

              <label className="filter-group block">

                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Category
                </span>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-blue-600"
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>

              </label>

              <label className="filter-group block">

                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Location
                </span>

                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-blue-600"
                >
                  {locations.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>

              </label>

              <Link
                href="/post-ad"
                className="btn-primary flex h-12 items-center justify-center rounded-xl bg-blue-700 px-4 font-bold text-white transition hover:bg-cyan-400 hover:text-slate-950"
              >
                + Sell an Item
              </Link>

            </div>

          </aside>

          {/* RESULTS */}

          <div className="min-w-0">

            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

              <div>

                <p className="mb-1 text-sm font-bold uppercase tracking-wider text-blue-700">
                  MARKETPLACE
                </p>

                <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                  {search
                    ? `Results for "${search}"`
                    : "Latest Listings"}
                </h2>

                <p className="mt-2 text-slate-500">
                  {filteredListings.length} listings available
                </p>

              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 font-semibold outline-none"
              >
                <option>Featured</option>
                <option>Newest</option>
              </select>

            </div>

            {/* TOP ADS */}

            {!search && category === "All Categories" && (

              <div className="top-ads mb-8 overflow-hidden rounded-2xl p-6 text-white shadow-lg sm:p-8">

                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

                  <div>

                    <div className="mb-3 text-sm font-bold uppercase tracking-wider text-cyan-100">
                      ⭐ TOP ADS
                    </div>

                    <h3 className="text-2xl font-black sm:text-3xl">
                      Give your business more visibility
                    </h3>

                    <p className="mt-2 max-w-2xl text-blue-100">
                      Promote your products and services to more customers
                      across Ghana.
                    </p>

                  </div>

                  <Link
                    href="/post-ad"
                    className="inline-flex w-fit rounded-xl bg-white px-6 py-3 font-bold text-blue-700 transition hover:bg-cyan-300 hover:text-slate-950"
                  >
                    Advertise Now →
                  </Link>

                </div>

              </div>

            )}

            {/* LISTINGS */}

            {filteredListings.length > 0 ? (

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

                {filteredListings.map((item) => (

                  <Link
                    href={`/listings/${item.id}`}
                    key={item.id}
                    className="card group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >

                    <div className="relative flex h-48 items-center justify-center bg-slate-100">

                      {item.featured && (

                        <span className="absolute left-3 top-3 rounded-full bg-blue-700 px-3 py-1 text-xs font-bold text-white shadow">
                          TOP AD
                        </span>

                      )}

                      <span className="text-7xl transition duration-300 group-hover:scale-110">
                        {item.image}
                      </span>

                    </div>

                    <div className="p-5">

                      <p className="card-highlight mb-2 text-xs font-bold uppercase tracking-wide text-blue-700">
                        {item.category}
                      </p>

                      <h3 className="card-title line-clamp-2 min-h-[3.5rem] text-lg font-extrabold text-slate-900">
                        {item.title}
                      </h3>

                      <div className="mt-3 text-xl font-black text-slate-900">
                        {item.price}
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        📍 {item.location}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">

                        <span className="text-sm font-semibold text-slate-600">
                          {item.seller}
                        </span>

                        {item.verified && (

                          <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                            ✓ Verified
                          </span>

                        )}

                      </div>

                    </div>

                  </Link>

                ))}

              </div>

            ) : (

              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">

                <div className="text-5xl">
                  🔎
                </div>

                <h3 className="mt-5 text-2xl font-black">
                  No listings found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-slate-500">
                  Try another search, category or location.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-cyan-400 hover:text-slate-950"
                >
                  View all listings
                </button>

              </div>

            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          SELLER CTA
      ====================================================== */}

      <section className="border-y border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">

          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
            SELL ON BEST SALES GHANA
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Have something to sell?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            List your product, vehicle, property, service, machinery or
            business opportunity and reach customers across Ghana.
          </p>

          <Link
            href="/post-ad"
            className="btn-primary mt-7 inline-flex rounded-xl bg-blue-700 px-7 py-4 font-bold text-white shadow-sm transition hover:bg-cyan-400 hover:text-slate-950"
          >
            + Post an Ad
          </Link>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-slate-950 text-white">

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 font-black text-white">
                BS
              </div>

              <div className="text-xl font-black">
                BEST SALES GHANA
              </div>

            </div>

            <p className="mt-2 text-sm text-slate-400">
              Buy • Sell • Advertise • Connect
            </p>

            <p className="mt-5 text-sm text-slate-400">
              A marketplace operated by
              <br />
              <strong className="text-white">
                ALL PROMINENT GHANA LIMITED
              </strong>
            </p>

          </div>

          <div>

            <h3 className="font-bold">
              Marketplace
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">

              <Link href="/listings" className="hover:text-cyan-300">
                Browse Listings
              </Link>

              <Link href="/post-ad" className="hover:text-cyan-300">
                Sell an Item
              </Link>

              <Link href="/account" className="hover:text-cyan-300">
                My Account
              </Link>

            </div>

          </div>

          <div>

            <h3 className="font-bold">
              Company
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">

              <Link href="/" className="hover:text-cyan-300">
                Home
              </Link>

              <Link href="/account" className="hover:text-cyan-300">
                Sign In
              </Link>

              <Link href="/post-ad" className="hover:text-cyan-300">
                Advertise
              </Link>

            </div>

          </div>

        </div>

        <div className="border-t border-slate-800">

          <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-slate-500 sm:px-6 lg:px-8">

            © {new Date().getFullYear()} BEST SALES GHANA. All rights reserved.

            <br />

            ALL PROMINENT GHANA LIMITED

          </div>

        </div>

      </footer>

    </main>
  );
}
