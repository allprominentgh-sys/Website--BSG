"use client";

import { useEffect, useState } from "react";
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

export default function Home() {
  const supabase = supabaseBrowser();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-2xl font-bold">
              ALL PROMINENT GHANA
            </h1>
            <p className="text-sm text-gray-500">
              Buy • Sell • Connect
            </p>
          </div>

          <button className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">
            Sell an Item
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gray-100">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <h2 className="text-4xl font-bold">
            Find what you need
          </h2>

          <p className="mt-3 max-w-xl text-gray-600">
            Discover products, vehicles, property, services and
            more from sellers across Ghana.
          </p>

          <div className="mt-6 flex max-w-3xl gap-3">
            <input
              type="search"
              placeholder="Search products, cars, property..."
              className="flex-1 rounded-xl border bg-white px-5 py-4 outline-none"
            />

            <button className="rounded-xl bg-black px-6 font-semibold text-white">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-5 py-8">
        <h2 className="text-2xl font-bold">
          Popular Categories
        </h2>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {[
            "Phones & Tablets",
            "Cars",
            "Property",
            "Fashion",
            "Electronics",
            "Jobs & Services",
            "Home & Garden",
            "Agriculture",
          ].map((category) => (
            <button
              key={category}
              className="rounded-xl border bg-white p-4 text-sm font-medium shadow-sm transition hover:bg-gray-100"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* LISTINGS */}
      <section className="mx-auto max-w-7xl px-5 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Latest Listings
          </h2>

          <button
            onClick={loadListings}
            className="text-sm font-semibold underline"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">
            Loading listings...
          </div>
        ) : listings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed p-12 text-center">
            <h3 className="text-xl font-semibold">
              No listings yet
            </h3>

            <p className="mt-2 text-gray-500">
              Your marketplace is ready. Add your first product
              to Supabase and it will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {listings.map((listing) => (
              <article
                key={listing.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                <div className="flex h-44 items-center justify-center bg-gray-100 text-gray-400">
                  Product Image
                </div>

                <div className="p-4">
                  {listing.featured && (
                    <span className="mb-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold">
                      Featured
                    </span>
                  )}

                  <h3 className="font-bold">
                    {listing.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {listing.description ||
                      "No description provided."}
                  </p>

                  <p className="mt-4 text-xl font-bold">
                    {currencySymbol(listing.currency_code)}
                    {Number(listing.price).toLocaleString()}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {listing.location || "Ghana"}
                  </p>

                  <button className="mt-4 w-full rounded-xl bg-black py-3 text-sm font-semibold text-white">
                    View Listing
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-5 py-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} All Prominent Ghana.
          All rights reserved.
        </div>
      </footer>
    </main>
  );
}
