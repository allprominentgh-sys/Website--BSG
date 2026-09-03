"use client";

import { useState } from "react";
import Link from "next/link";

const categories = [
  {
    name: "Industrial Machinery",
    subcategories: [
      "Metal & Metallurgy Machinery",
      "Machine Tool Equipment",
      "Woodworking Machinery",
      "Plastic & Rubber Machinery",
      "Chemical Machinery",
      "Food & Beverage Machinery",
      "Agricultural Machinery",
      "Textile & Apparel Machinery",
      "Industrial Compressors",
      "Production Lines",
      "Machinery Accessories",
      "Used Industrial Machinery",
    ],
  },
  {
    name: "Printing & Packaging",
    subcategories: [
      "Printing Machines",
      "Digital Printing Machines",
      "DTF Printers",
      "UV Printers",
      "Sublimation Printers",
      "Offset Printing Machines",
      "Flexographic Printing Machines",
      "Screen Printing Machines",
      "Label Printing Machines",
      "Packaging Machines",
      "Bag Making Machines",
      "Printing Parts & Accessories",
    ],
  },
  {
    name: "Construction Equipment",
    subcategories: [
      "Excavators",
      "Loaders",
      "Bulldozers",
      "Cranes",
      "Forklifts",
      "Road Rollers",
      "Concrete Machinery",
      "Brick Making Machines",
      "Mixing Machines",
      "Drilling Machines",
      "Mining Machinery",
      "Construction Machinery Parts",
      "Used Construction Equipment",
    ],
  },
  {
    name: "Phones & Tablets",
    subcategories: [
      "Mobile Phones",
      "iPhones",
      "Samsung Phones",
      "Android Phones",
      "Tablets",
      "iPads",
      "Phone Accessories",
      "Chargers & Cables",
    ],
  },
  {
    name: "Cars & Vehicles",
    subcategories: [
      "Cars",
      "SUVs",
      "Trucks",
      "Buses",
      "Motorcycles",
      "Electric Vehicles",
      "Vehicle Parts",
      "Car Accessories",
    ],
  },
  {
    name: "Property",
    subcategories: [
      "Houses",
      "Apartments",
      "Land",
      "Commercial Property",
      "Warehouses",
      "Offices",
      "Shops",
      "Industrial Property",
    ],
  },
  {
    name: "Electronics",
    subcategories: [
      "Televisions",
      "Computers",
      "Laptops",
      "Cameras",
      "Audio Equipment",
      "Networking Equipment",
      "Smart Devices",
      "Electronic Components",
    ],
  },
  {
    name: "Agriculture",
    subcategories: [
      "Farm Machinery",
      "Tractors",
      "Irrigation Equipment",
      "Poultry Equipment",
      "Animal Feed",
      "Greenhouse Equipment",
      "Seeds & Plants",
      "Agricultural Tools",
    ],
  },
  {
    name: "Home & Garden",
    subcategories: [
      "Furniture",
      "Kitchen Equipment",
      "Home Appliances",
      "Beds & Mattresses",
      "Decorations",
      "Garden Equipment",
      "Lighting",
      "Household Items",
    ],
  },
  {
    name: "Fashion",
    subcategories: [
      "Men's Clothing",
      "Women's Clothing",
      "Children's Clothing",
      "Shoes",
      "Bags",
      "Watches",
      "Jewelry",
      "Accessories",
    ],
  },
  {
    name: "Jobs",
    subcategories: [
      "Full-Time Jobs",
      "Part-Time Jobs",
      "Remote Jobs",
      "Driving Jobs",
      "Construction Jobs",
      "Office Jobs",
      "Sales Jobs",
      "Other Jobs",
    ],
  },
  {
    name: "Services",
    subcategories: [
      "Building Services",
      "Transportation",
      "Cleaning Services",
      "Repair Services",
      "IT Services",
      "Design Services",
      "Professional Services",
      "Other Services",
    ],
  },
];

const featuredListings = [
  {
    id: 1,
    title: "Industrial Printing Machine",
    category: "Printing & Packaging",
    price: "GHS 85,000",
    location: "Accra, Ghana",
    image:
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    title: "Construction Excavator",
    category: "Construction Equipment",
    price: "GHS 650,000",
    location: "Tema, Ghana",
    image:
      "https://images.unsplash.com/photo-1580901368919-7738ef7d0bbd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    title: "Industrial Production Machine",
    category: "Industrial Machinery",
    price: "GHS 120,000",
    location: "Kumasi, Ghana",
    image:
      "https://images.unsplash.com/photo-1565610222536-ef125c59da2e?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const activeCategory =
    categories.find((category) => category.name === selectedCategory) ||
    null;

  const filteredListings = featuredListings.filter((listing) => {
    const matchesCategory =
      selectedCategory === "All" ||
      listing.category === selectedCategory;

    const searchText = search.toLowerCase();

    const matchesSearch =
      !searchText ||
      listing.title.toLowerCase().includes(searchText) ||
      listing.category.toLowerCase().includes(searchText) ||
      listing.location.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-[#111827]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="block">
            <div className="text-2xl font-extrabold tracking-tight text-[#1769d1] md:text-3xl">
              ALL PROMINENT GHANA
            </div>

            <div className="text-sm font-medium text-gray-500">
              Buy • Sell • Advertise • Connect
            </div>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/listings"
              className="rounded-lg px-4 py-2 font-semibold text-[#1769d1] hover:bg-blue-50"
            >
              Marketplace
            </Link>

            <Link
              href="/listings"
              className="rounded-lg bg-[#1769d1] px-5 py-3 font-bold text-white hover:bg-[#1258b4]"
            >
              Post an Ad
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-2xl text-[#1769d1] shadow-sm md:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-gray-200 bg-white px-5 py-4 md:hidden">
            <Link
              href="/listings"
              className="block border-b border-gray-100 py-3 font-semibold"
              onClick={() => setMenuOpen(false)}
            >
              Marketplace
            </Link>

            <Link
              href="/listings"
              className="block py-3 font-semibold text-[#1769d1]"
              onClick={() => setMenuOpen(false)}
            >
              Post an Ad
            </Link>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-r from-[#1254b8] via-[#1769d1] to-[#2eb7ee]">
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-24">
          <div className="max-w-4xl">
            <div className="mb-5 inline-block rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              GHANA'S MARKETPLACE
            </div>

            <h1 className="text-4xl font-extrabold leading-tight text-white md:text-6xl">
              Buy, Sell & Discover
              <br />
              Anything in Ghana
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-50 md:text-xl">
              Find products, industrial machinery, printing equipment,
              construction equipment, vehicles, property, jobs and services
              from sellers across Ghana.
            </p>

            {/* SEARCH */}
            <div className="mt-8 flex flex-col gap-3 md:flex-row">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, machines, cars, property, jobs..."
                className="min-h-[58px] flex-1 rounded-xl border-0 bg-white px-5 text-lg text-gray-900 outline-none ring-0 placeholder:text-gray-400"
              />

              <button
                onClick={() => {
                  document
                    .getElementById("marketplace")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="min-h-[58px] rounded-xl bg-[#082f75] px-8 text-lg font-bold text-white hover:bg-[#06275f]"
              >
                Search
              </button>
            </div>

            {/* HERO BUTTONS */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/listings"
                className="rounded-xl bg-white px-7 py-4 text-center font-bold text-[#1769d1] shadow-lg"
              >
                Browse Marketplace
              </Link>

              <Link
                href="/listings"
                className="rounded-xl bg-[#38bdf8] px-7 py-4 text-center font-bold text-[#082f75] shadow-lg"
              >
                + Post an Ad
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MARKETPLACE */}
      <section id="marketplace" className="mx-auto max-w-7xl px-5 py-12 md:py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            Ghana Marketplace
          </h2>

          <p className="mt-3 max-w-3xl text-lg leading-8 text-gray-500">
            Explore products and services from individuals, businesses,
            manufacturers, importers and suppliers across Ghana.
          </p>
        </div>

        {/* CATEGORY SELECTOR */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Categories</h3>

            <span className="text-sm font-medium text-gray-500">
              {categories.length + 1} categories
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`rounded-lg px-5 py-3 font-semibold transition ${
                selectedCategory === "All"
                  ? "bg-[#1769d1] text-white shadow-md"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-[#1769d1] hover:text-[#1769d1]"
              }`}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`rounded-lg px-5 py-3 font-semibold transition ${
                  selectedCategory === category.name
                    ? "bg-[#1769d1] text-white shadow-md"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-[#1769d1] hover:text-[#1769d1]"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* SUBCATEGORIES */}
          {activeCategory && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-lg font-bold text-[#1769d1]">
                  {activeCategory.name}
                </h4>

                <button
                  onClick={() => setSelectedCategory("All")}
                  className="text-sm font-semibold text-gray-500 hover:text-[#1769d1]"
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {activeCategory.subcategories.map((subcategory) => (
                  <button
                    key={subcategory}
                    onClick={() => setSearch(subcategory)}
                    className="rounded-lg bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#1769d1]"
                  >
                    {subcategory}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* QUICK CATEGORY CARDS */}
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <button
              key={category.name}
              onClick={() => {
                setSelectedCategory(category.name);
                document
                  .getElementById("listings")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#1769d1] hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-[#1769d1]">
                {category.name.charAt(0)}
              </div>

              <h3 className="font-bold group-hover:text-[#1769d1]">
                {category.name}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {category.subcategories.length} subcategories
              </p>
            </button>
          ))}
        </div>

        {/* LISTINGS */}
        <div id="listings" className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold">
                {selectedCategory === "All"
                  ? "Featured Listings"
                  : selectedCategory}
              </h2>

              <p className="mt-2 text-gray-500">
                {filteredListings.length} listings found
              </p>
            </div>

            <Link
              href="/listings"
              className="hidden font-bold text-[#1769d1] sm:block"
            >
              View all →
            </Link>
          </div>

          {filteredListings.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <div className="text-5xl">🔎</div>

              <h3 className="mt-4 text-xl font-bold">
                No matching listings yet
              </h3>

              <p className="mt-2 text-gray-500">
                Try another search or choose a different category.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}
                className="mt-5 rounded-lg bg-[#1769d1] px-6 py-3 font-bold text-white"
              >
                Show all listings
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredListings.map((listing) => (
                <article
                  key={listing.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="h-56 w-full object-cover"
                    />

                    <span className="absolute left-4 top-4 rounded-lg bg-yellow-400 px-3 py-2 text-xs font-extrabold text-gray-900">
                      FEATURED
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="text-sm font-bold text-[#16804a]">
                      {listing.category}
                    </div>

                    <h3 className="mt-2 text-xl font-bold">
                      {listing.title}
                    </h3>

                    <div className="mt-4 text-2xl font-extrabold text-[#16804a]">
                      {listing.price}
                    </div>

                    <div className="mt-2 text-sm text-gray-500">
                      📍 {listing.location}
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="flex-1 rounded-lg border-2 border-[#1769d1] px-4 py-3 text-center font-bold text-[#1769d1] hover:bg-blue-50"
                      >
                        View Details
                      </Link>

                      <a
                        href="tel:+233240000000"
                        className="rounded-lg bg-[#1769d1] px-5 py-3 font-bold text-white hover:bg-[#1258b4]"
                      >
                        Call
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SUPPLIER SECTION */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <div className="rounded-3xl bg-gradient-to-r from-[#0b3d91] to-[#1769d1] p-8 md:p-12">
            <div className="max-w-3xl">
              <div className="text-sm font-bold uppercase tracking-wider text-blue-200">
                For Businesses & Suppliers
              </div>

              <h2 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">
                Sell your products and equipment across Ghana
              </h2>

              <p className="mt-4 text-lg leading-8 text-blue-100">
                List machinery, printing equipment, construction equipment,
                vehicles, products, property and services on All Prominent
                Ghana.
              </p>

              <Link
                href="/listings"
                className="mt-7 inline-block rounded-xl bg-white px-7 py-4 font-bold text-[#1769d1]"
              >
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0b1220] text-white">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <div className="text-2xl font-extrabold text-white">
            ALL PROMINENT GHANA
          </div>

          <p className="mt-2 text-gray-400">
            Buy • Sell • Advertise • Connect
          </p>

          <div className="mt-8 border-t border-white/10 pt-6 text-sm text-gray-500">
            © {new Date().getFullYear()} All Prominent Ghana. All rights
            reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
