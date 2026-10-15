"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const categories = [
  "All Products",
  "Electronics",
  "Industrial Machinery",
  "Construction Equipment",
  "Printing Equipment",
  "Agriculture",
  "Home & Garden",
  "Tools & Hardware",
  "Vehicle Parts",
];

const products = [
  {
    name: "Industrial Machinery",
    category: "Industrial Machinery",
    description: "Machinery and production equipment from suppliers.",
    icon: "⚙️",
  },
  {
    name: "Electronic Devices",
    category: "Electronics",
    description: "Electronics, accessories and business technology.",
    icon: "📱",
  },
  {
    name: "Construction Equipment",
    category: "Construction Equipment",
    description: "Equipment and tools for construction projects.",
    icon: "🏗️",
  },
  {
    name: "Printing Equipment",
    category: "Printing Equipment",
    description: "Printing machines and commercial printing supplies.",
    icon: "🖨️",
  },
  {
    name: "Agricultural Equipment",
    category: "Agriculture",
    description: "Farm machinery, tools and agricultural equipment.",
    icon: "🚜",
  },
  {
    name: "Home & Garden",
    category: "Home & Garden",
    description: "Household products, furniture and garden supplies.",
    icon: "🏠",
  },
  {
    name: "Tools & Hardware",
    category: "Tools & Hardware",
    description: "Professional tools and hardware for businesses.",
    icon: "🛠️",
  },
  {
    name: "Vehicle Parts",
    category: "Vehicle Parts",
    description: "Vehicle spare parts and automotive accessories.",
    icon: "🚗",
  },
];

export default function GlobalPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Products");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        category === "All Products" || product.category === category;

      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* GLOBAL HEADER */}
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <Link href="/" className="text-2xl font-black tracking-tight">
            <span className="text-blue-800">BestSales</span>
            <span className="text-sky-500">GH</span>
            <span className="ml-2 rounded bg-blue-800 px-2 py-1 text-xs text-white">
              GLOBAL
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-5 text-sm font-semibold">
            <Link href="/" className="hover:text-blue-700">
              Local Marketplace
            </Link>
            <a href="#categories" className="hover:text-blue-700">
              Categories
            </a>
            <a href="#shipping" className="hover:text-blue-700">
              APG Shipping
            </a>
            <a href="#suppliers" className="hover:text-blue-700">
              Suppliers
            </a>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-800 to-sky-600 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold">
              INTERNATIONAL TRADE · CHINA TO GHANA
            </p>

            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Buy Globally.
              <br />
              Ship with APG.
              <br />
              Trade with Confidence.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Discover products from international suppliers, starting with
              Chinese businesses selling to buyers in Ghana. China-to-Ghana
              orders will use APG Shipping & Logistics.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#categories"
                className="rounded-xl bg-white px-6 py-3.5 font-bold text-blue-900 shadow-lg transition hover:bg-blue-50"
              >
                Explore Products
              </a>

              <a
                href="#suppliers"
                className="rounded-xl border border-white/60 px-6 py-3.5 font-bold text-white transition hover:bg-white/10"
              >
                Become a Supplier
              </a>
            </div>

            <p className="mt-5 text-sm text-blue-100">
              A global trading experience built for Ghanaian buyers and
              international suppliers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
              <div className="text-4xl">🇨🇳</div>
              <h2 className="mt-4 text-xl font-bold">Chinese Suppliers</h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                Discover products and connect with businesses in China.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
              <div className="text-4xl">🇬🇭</div>
              <h2 className="mt-4 text-xl font-bold">Ghanaian Buyers</h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                Explore products for personal, retail and wholesale needs.
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
              <div className="text-4xl">📦</div>
              <h2 className="mt-4 text-xl font-bold">APG Logistics</h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                A dedicated shipping route for China-to-Ghana orders.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
              <div className="text-4xl">🌍</div>
              <h2 className="mt-4 text-xl font-bold">Global Trade</h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                One marketplace connecting suppliers and buyers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: "🏭",
            title: "Supplier Discovery",
            text: "Explore international product categories.",
          },
          {
            icon: "🚢",
            title: "APG Shipping",
            text: "China-to-Ghana orders use the designated logistics service.",
          },
          {
            icon: "🧾",
            title: "Order Records",
            text: "Order and payment records will be integrated in a later phase.",
          },
          {
            icon: "🤝",
            title: "Business Connections",
            text: "Build connections between suppliers and Ghanaian buyers.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="text-3xl">{item.icon}</div>
            <h2 className="mt-4 font-bold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.text}
            </p>
          </div>
        ))}
      </section>

      {/* PRODUCT CATEGORIES */}
      <section id="categories" className="scroll-mt-6 py-12">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-bold uppercase tracking-widest text-blue-700">
                Explore the marketplace
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Global Product Categories
              </h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                Browse key product categories for businesses, wholesalers,
                retailers and individual buyers.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <label htmlFor="global-search" className="sr-only">
              Search global categories
            </label>
            <input
              id="global-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search machinery, electronics, printing equipment..."
              className="w-full rounded-xl border border-slate-300 bg-white px-5 py-4 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-3">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  category === item
                    ? "border-blue-800 bg-blue-800 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-blue-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <article
                key={product.name}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-sky-100 text-5xl">
                  {product.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold">{product.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                  {product.description}
                </p>
                <a
                  href="#suppliers"
                  className="mt-5 inline-flex font-bold text-blue-800 hover:text-sky-600"
                >
                  Explore category →
                </a>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-bold">No matching categories found.</p>
              <p className="mt-2 text-sm text-slate-600">
                Try another search or choose All Products.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All Products");
                }}
                className="mt-4 rounded-lg bg-blue-800 px-5 py-3 font-bold text-white"
              >
                Reset filters
              </button>
            </div>
          )}

          <p className="mt-6 text-sm text-slate-500">
            These are category previews, not live supplier listings. Real
            products will appear when catalogue integration is completed.
          </p>
        </div>
      </section>

      {/* SHIPPING */}
      <section id="shipping" className="scroll-mt-6 bg-blue-950 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-bold uppercase tracking-widest text-sky-300">
              Our logistics partner
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              China to Ghana, with APG Shipping & Logistics
            </h2>
            <p className="mt-5 leading-7 text-blue-100">
              APG is the designated shipping provider for China-to-Ghana orders
              on BestSalesGH Global. The planned system will connect order
              records with warehouse receiving, shipment status updates and
              delivery coordination.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-7">
            <h3 className="text-xl font-bold">Planned shipping journey</h3>
            <ol className="mt-6 space-y-5">
              {[
                ["01", "Buyer places an order"],
                ["02", "Supplier prepares the goods"],
                ["03", "APG receives the goods in China"],
                ["04", "Shipment travels to Ghana"],
                ["05", "Arrival, clearance and delivery coordination"],
              ].map(([number, title]) => (
                <li key={number} className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-400 font-black text-blue-950">
                    {number}
                  </span>
                  <span className="pt-1 font-semibold">{title}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-blue-200">
              Live tracking and automated status updates will be added during
              the APG integration phase.
            </p>
          </div>
        </div>
      </section>

      {/* SUPPLIERS */}
      <section id="suppliers" className="scroll-mt-6 py-16">
        <div className="mx-auto max-w-5xl px-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <p className="font-bold uppercase tracking-widest text-blue-700">
              For international businesses
            </p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Are you a supplier in China?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">
              BestSalesGH Global is being developed to connect Chinese
              suppliers with buyers in Ghana. Supplier accounts, verification,
              product publishing, order payments and payout processing will be
              introduced in subsequent implementation phases.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/"
                className="rounded-xl bg-blue-800 px-6 py-3.5 font-bold text-white transition hover:bg-blue-900"
              >
                Visit BestSalesGH
              </Link>
              <a
                href="mailto:info@bestsalesgh.com?subject=BestSalesGH%20Global%20Supplier%20Enquiry"
                className="rounded-xl border border-blue-800 px-6 py-3.5 font-bold text-blue-800 transition hover:bg-blue-50"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} BestSalesGH Global. All rights
            reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="hover:text-blue-800">
              Local Marketplace
            </Link>
            <a href="#shipping" className="hover:text-blue-800">
              APG Shipping
            </a>
            <a href="mailto:info@bestsalesgh.com" className="hover:text-blue-800">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
