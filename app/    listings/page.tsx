"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const products = [
  {
    id: 1,
    title: "iPhone 15 Pro",
    price: "GH₵12,500",
    location: "Accra",
    category: "Phones & Tablets",
    image:
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Toyota Camry",
    price: "GH₵185,000",
    location: "Kumasi",
    category: "Cars & Vehicles",
    image:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "3 Bedroom House",
    price: "GH₵950,000",
    location: "East Legon",
    category: "Property",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Premium Laptop",
    price: "GH₵8,500",
    location: "Tema",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "Designer Sneakers",
    price: "GH₵1,200",
    location: "Accra",
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    title: "Modern Sofa",
    price: "GH₵6,500",
    location: "Tema",
    category: "Home & Garden",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  },
];

const categories = [
  "All",
  "Phones & Tablets",
  "Cars & Vehicles",
  "Property",
  "Electronics",
  "Fashion",
  "Home & Garden",
];

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()) ||
        product.location.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

          <Link href="/" className="font-extrabold text-blue-700">
            ALL PROMINENT GHANA
          </Link>

          <div className="flex gap-4">
            <Link href="/" className="font-semibold">
              Home
            </Link>

            <Link
              href="/post-ad"
              className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white"
            >
              + Sell
            </Link>
          </div>

        </div>
      </header>

      {/* TITLE */}
      <section className="bg-gradient-to-r from-blue-700 to-sky-500 px-4 py-12">
        <div className="mx-auto max-w-7xl text-white">

          <p className="font-bold text-blue-100">
            ALL PROMINENT MARKETPLACE
          </p>

          <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">
            Find what you need.
          </h1>

          <p className="mt-3 text-blue-50">
            Buy and sell products, vehicles, property and services.
          </p>

        </div>
      </section>

      {/* SEARCH + FILTER */}
      <section className="mx-auto max-w-7xl px-4 py-8">

        <div className="flex flex-col gap-3 md:flex-row">

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search marketplace..."
            className="flex-1 rounded-xl border bg-white px-5 py-4 outline-none focus:border-blue-500"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border bg-white px-5 py-4 outline-none"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

        </div>

        {/* RESULTS */}
        <div className="mt-8 flex items-center justify-between">

          <h2 className="text-2xl font-extrabold">
            Marketplace
          </h2>

          <span className="text-sm text-slate-500">
            {filteredProducts.length} listings
          </span>

        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {filteredProducts.map((product) => (
            <Link
              href={`/listings/${product.id}`}
              key={product.id}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >

              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-5">

                <p className="text-xs font-bold uppercase text-blue-600">
                  {product.category}
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  {product.title}
                </h3>

                <p className="mt-3 text-2xl font-extrabold">
                  {product.price}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  📍 {product.location}, Ghana
                </p>

                <div className="mt-4 border-t pt-4 text-sm font-semibold text-blue-600">
                  ✓ Verified Seller
                </div>

              </div>

            </Link>
          ))}

        </div>

        {filteredProducts.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed bg-white p-12 text-center">
            <div className="text-4xl">🔎</div>
            <h3 className="mt-3 text-xl font-bold">
              No listings found
            </h3>
            <p className="mt-2 text-slate-500">
              Try another search or category.
            </p>
          </div>
        )}

      </section>

    </main>
  );
}
