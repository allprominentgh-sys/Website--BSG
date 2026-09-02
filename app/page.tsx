"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "./supabase-browser";

type Listing = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  currency_code: string | null;
  location: string | null;
  featured: boolean;
};

const categories = [
  { name: "Phones & Tablets", icon: "📱" },
  { name: "Cars", icon: "🚗" },
  { name: "Property", icon: "🏠" },
  { name: "Fashion", icon: "👕" },
  { name: "Electronics", icon: "📺" },
  { name: "Jobs & Services", icon: "💼" },
  { name: "Home & Garden", icon: "🛋️" },
  { name: "Agriculture", icon: "🌿" },
];

export default function Home() {
  const supabase = supabaseBrowser();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);

    const { data, error } = await supabase
      .from("listings")
      .select(
        "id,title,description,price,currency_code,location,featured"
      )
      .eq("status", "active")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load listings:", error);
      setListings([]);
    } else {
      setListings(data || []);
    }

    setLoading(false);
  }

  function currencySymbol(code: string | null) {
    const symbols: Record<string, string> = {
      GHS: "GH₵",
      USD: "$",
      EUR: "€",
      GBP: "£",
      CNY: "¥",
    };

    return symbols[code || "GHS"] || code || "GHS";
  }

  const filteredListings = listings.filter((listing) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      !search ||
      listing.title.toLowerCase().includes(searchText) ||
      (listing.description || "").toLowerCase().includes(searchText) ||
      (listing.location || "").toLowerCase().includes(searchText);

    return matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#101828]">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4">

          <Link href="/" className="shrink-0">
            <h1 className="text-xl font-extrabold tracking-tight text-[#155EEF] sm:text-2xl">
              ALL PROMINENT GHANA
            </h1>

            <p className="text-xs font-medium text-[#667085]">
              Buy • Sell • Advertise • Connect
            </p>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
            <Link href="/" className="text-[#155EEF]">
              Home
            </Link>

            <Link
              href="#categories"
              className="text-[#344054] hover:text-[#155EEF]"
            >
              Categories
            </Link>

            <Link
              href="#listings"
              className="text-[#344054] hover:text-[#155EEF]"
            >
              Marketplace
            </Link>

            <Link
              href="/ads"
              className="text-[#344054] hover:text-[#155EEF]"
            >
              Advertise
            </Link>

            <Link
              href="/dashboard"
              className="text-[#344054] hover:text-[#155EEF]"
            >
              My Account
            </Link>
          </nav>

          <Link
            href="/ads"
            className="rounded-xl bg-[#155EEF] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0F4BC9]"
          >
            + Post an Ad
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#DCEBFF]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20">

          <div className="max-w-3xl">

            <div className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#155EEF] shadow-sm">
              🇬🇭 Ghana's Marketplace
            </div>

            <h2 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              Find what{" "}
              <span className="text-[#155EEF]">
                you need
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#475467]">
              Discover products, vehicles, property, jobs, services
              and more from sellers across Ghana.
            </p>

            {/* SEARCH */}
            <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-xl sm:flex-row">

              <div className="flex flex-1 items-center rounded-xl border border-gray-200 px-4">

                <span className="mr-3 text-xl">
                  🔍
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, cars, property..."
                  className="w-full py-3 outline-none"
                />

              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none"
              >
                <option>All Categories</option>

                {categories.map((item) => (
                  <option key={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  document
                    .getElementById("listings")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-xl bg-[#155EEF] px-7 py-3 font-bold text-white transition hover:bg-[#0F4BC9]"
              >
                Search
              </button>

            </div>
          </div>
        </div>

        <div className="absolute -right-20 -top-20 hidden h-72 w-72 rounded-full bg-[#9EC5FF] opacity-50 lg:block" />
        <div className="absolute -bottom-24 right-20 hidden h-56 w-56 rounded-full bg-white opacity-50 lg:block" />
      </section>

      {/* TRUST BAR */}
      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:grid-cols-3">

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DCEBFF] text-xl">
              🛡️
            </div>

            <div>
              <p className="font-bold">Safe & Secure</p>
              <p className="text-sm text-[#667085]">
                Secure marketplace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DCEBFF] text-xl">
              🚚
            </div>

            <div>
              <p className="font-bold">Nationwide Delivery</p>
              <p className="text-sm text-[#667085]">
                Delivery across Ghana
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DCEBFF] text-xl">
              🎧
            </div>

            <div>
              <p className="font-bold">24/7 Support</p>
              <p className="text-sm text-[#667085]">
                We're here to help
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* CATEGORIES */}
      <section
        id="categories"
        className="mx-auto max-w-7xl px-5 py-12"
      >

        <div className="mb-6 flex items-center justify-between">

          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-[#155EEF]">
              Explore
            </p>

            <h2 className="text-3xl font-extrabold">
              Popular Categories
            </h2>
          </div>

          <button className="hidden font-bold text-[#155EEF] sm:block">
            View all categories →
          </button>

        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">

          {categories.map((item) => (

            <button
              key={item.name}
              onClick={() => setCategory(item.name)}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#9EC5FF] hover:shadow-lg"
            >

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DCEBFF] text-2xl transition group-hover:bg-[#155EEF]">
                {item.icon}
              </div>

              <p className="mt-4 text-sm font-bold leading-5 text-[#344054]">
                {item.name}
              </p>

            </button>

          ))}

        </div>
      </section>

      {/* LISTINGS */}
      <section
        id="listings"
        className="mx-auto max-w-7xl px-5 pb-14"
      >

        <div className="flex items-end justify-between">

          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-[#155EEF]">
              Marketplace
            </p>

            <h2 className="text-3xl font-extrabold">
              Latest Listings
            </h2>

            {category !== "All Categories" && (
              <p className="mt-2 text-sm text-[#667085]">
                Category:{" "}
                <span className="font-bold text-[#155EEF]">
                  {category}
                </span>
              </p>
            )}
          </div>

          <button
            onClick={loadListings}
            className="font-bold text-[#155EEF]"
          >
            Refresh ↻
          </button>

        </div>

        {loading ? (

          <div className="mt-8 rounded-2xl border bg-white p-16 text-center">
            <div className="text-lg font-semibold text-[#475467]">
              Loading listings...
            </div>
          </div>

        ) : filteredListings.length === 0 ? (

          <div className="mt-8 rounded-2xl border-2 border-dashed border-[#9EC5FF] bg-white p-16 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#DCEBFF] text-3xl">
              🛍️
            </div>

            <h3 className="mt-5 text-2xl font-extrabold">
              No listings yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-[#667085]">
              Your marketplace is ready. Add your first product
              to Supabase and it will appear here automatically.
            </p>

            <Link
              href="/ads"
              className="mt-6 inline-block rounded-xl bg-[#155EEF] px-6 py-3 font-bold text-white"
            >
              + Post an Ad
            </Link>

          </div>

        ) : (

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {filteredListings.map((listing) => (

              <article
                key={listing.id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >

                <div className="relative flex h-48 items-center justify-center bg-[#DCEBFF]">

                  {listing.featured && (
                    <span className="absolute left-3 top-3 rounded-lg bg-[#155EEF] px-3 py-1 text-xs font-bold text-white">
                      Featured
                    </span>
                  )}

                  <span className="text-5xl">
                    🛍️
                  </span>

                </div>

                <div className="p-5">

                  <h3 className="truncate text-lg font-extrabold">
                    {listing.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm text-[#667085]">
                    {listing.description ||
                      "No description provided."}
                  </p>

                  <p className="mt-4 text-xl font-extrabold text-[#155EEF]">
                    {currencySymbol(listing.currency_code)}
                    {Number(listing.price).toLocaleString()}
                  </p>

                  <p className="mt-2 text-sm text-[#667085]">
                    📍 {listing.location || "Ghana"}
                  </p>

                  <Link
                    href={`/listings/${listing.id}`}
                    className="mt-5 block w-full rounded-xl bg-[#155EEF] py-3 text-center font-bold text-white transition hover:bg-[#0F4BC9]"
                  >
                    View Listing
                  </Link>

                </div>

              </article>

            ))}

          </div>
        )}

      </section>

      {/* SELLER CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-14">

        <div className="overflow-hidden rounded-3xl bg-[#155EEF] px-7 py-10 text-white shadow-xl sm:px-12">

          <div className="flex flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">

            <div>
              <p className="text-3xl font-extrabold">
                Ready to sell?
              </p>

              <p className="mt-2 max-w-lg text-blue-100">
                Reach more buyers across Ghana and grow your
                business with All Prominent Ghana.
              </p>
            </div>

            <Link
              href="/ads"
              className="rounded-xl bg-white px-7 py-4 font-extrabold text-[#155EEF] shadow-lg"
            >
              Post an Ad →
            </Link>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-white">

        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-5">

          <div className="lg:col-span-2">

            <h2 className="text-2xl font-extrabold text-[#155EEF]">
              ALL PROMINENT GHANA
            </h2>

            <p className="mt-2 text-sm font-medium text-[#667085]">
              Buy • Sell • Advertise • Connect
            </p>

            <p className="mt-5 max-w-sm text-sm leading-6 text-[#667085]">
              Ghana's marketplace for buying and selling
              products, vehicles, property, services, jobs and more.
            </p>

          </div>

          <div>
            <h3 className="font-extrabold">
              Quick Links
            </h3>

            <div className="mt-4 space-y-3 text-sm text-[#667085]">
              <p>Home</p>
              <p>Categories</p>
              <p>Marketplace</p>
              <p>Advertise</p>
              <p>My Account</p>
            </div>
          </div>

          <div>
            <h3 className="font-extrabold">
              Categories
            </h3>

            <div className="mt-4 space-y-3 text-sm text-[#667085]">
              <p>Phones & Tablets</p>
              <p>Cars</p>
              <p>Property</p>
              <p>Fashion</p>
              <p>Electronics</p>
            </div>
          </div>

          <div>
            <h3 className="font-extrabold">
              Support
            </h3>

            <div className="mt-4 space-y-3 text-sm text-[#667085]">
              <p>Help Center</p>
              <p>Safety Tips</p>
              <p>Terms of Service</p>
              <p>Privacy Policy</p>
              <p>Contact Us</p>
            </div>
          </div>

        </div>

        <div className="border-t bg-[#155EEF] px-5 py-5 text-center text-sm text-white">
          © {new Date().getFullYear()} All Prominent Ghana. All rights reserved. 🇬🇭
        </div>

      </footer>

    </main>
  );
}