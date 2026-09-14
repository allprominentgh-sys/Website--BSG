"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SellerType = "Company" | "Individual";

type Listing = {
  id: number;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  price: number;
  location: string;
  gps: string;
  seller: string;
  sellerType: SellerType;
  deliveryAvailable: boolean;
  trackingNumber?: string;
  icon: string;
};

const categories = [
  "All Categories",
  "Vehicles",
  "Property",
  "Electronics",
  "Machinery",
  "Agriculture",
  "Fashion",
  "Phones & Tablets",
  "Home & Garden",
  "Jobs & Services",
];

const subcategories: Record<string, string[]> = {
  Vehicles: [
    "Cars",
    "Trucks",
    "Buses",
    "Motorcycles",
    "Heavy Equipment",
    "Vehicle Parts",
  ],

  Property: [
    "Houses",
    "Apartments",
    "Land",
    "Commercial Property",
    "Office Space",
    "Shops",
  ],

  Electronics: [
    "Televisions",
    "Laptops",
    "Computers",
    "Cameras",
    "Audio",
    "Accessories",
  ],

  Machinery: [
    "Industrial Machines",
    "Printing Equipment",
    "Construction Equipment",
    "Generators",
    "Factory Equipment",
    "Tools",
  ],

  Agriculture: [
    "Tractors",
    "Farm Machinery",
    "Irrigation",
    "Livestock",
    "Poultry Equipment",
    "Processing Machines",
  ],

  Fashion: [
    "Men's Fashion",
    "Women's Fashion",
    "Children's Fashion",
    "Shoes",
    "Bags",
    "Accessories",
  ],

  "Phones & Tablets": [
    "iPhone",
    "Android Phones",
    "Tablets",
    "Smart Watches",
    "Phone Accessories",
  ],

  "Home & Garden": [
    "Furniture",
    "Kitchen",
    "Home Appliances",
    "Garden",
    "Decor",
    "Lighting",
  ],

  "Jobs & Services": [
    "Jobs",
    "Business Services",
    "Construction",
    "Transport",
    "Repairs",
    "Professional Services",
  ],
};

const locations = [
  "All Ghana",
  "Accra",
  "Tema",
  "Kumasi",
  "Takoradi",
  "Tamale",
  "Cape Coast",
  "Sunyani",
  "Koforidua",
  "Ho",
  "Wa",
  "Bolgatanga",
];

const listings: Listing[] = [
  {
    id: 1,
    title: "Toyota Corolla 2020",
    category: "Vehicles",
    subcategory: "Cars",
    description: "Clean and well-maintained Toyota Corolla.",
    price: 185000,
    location: "Accra",
    gps: "GA-123-4567",
    seller: "Prominent Auto Ghana",
    sellerType: "Company",
    deliveryAvailable: true,
    trackingNumber: "APG-000001",
    icon: "🚗",
  },

  {
    id: 2,
    title: "Industrial Printing Machine",
    category: "Machinery",
    subcategory: "Printing Equipment",
    description:
      "Commercial printing machine suitable for professional printing businesses.",
    price: 250000,
    location: "Tema",
    gps: "GT-234-5678",
    seller: "Industrial Print Ghana",
    sellerType: "Company",
    deliveryAvailable: true,
    trackingNumber: "APG-000002",
    icon: "🖨️",
  },

  {
    id: 3,
    title: "DTF Printing Machine",
    category: "Machinery",
    subcategory: "Printing Equipment",
    description:
      "Commercial DTF printing machine for garment printing businesses.",
    price: 75000,
    location: "Accra",
    gps: "GE-345-6789",
    seller: "Kwame Printing",
    sellerType: "Individual",
    deliveryAvailable: true,
    trackingNumber: "APG-000003",
    icon: "🖨️",
  },

  {
    id: 4,
    title: "Construction Excavator",
    category: "Machinery",
    subcategory: "Construction Equipment",
    description: "Heavy-duty excavator for construction projects.",
    price: 850000,
    location: "Kumasi",
    gps: "AK-456-7890",
    seller: "Ghana Construction Equipment",
    sellerType: "Company",
    deliveryAvailable: true,
    trackingNumber: "APG-000004",
    icon: "🚜",
  },

  {
    id: 5,
    title: "iPhone 15 Pro Max",
    category: "Phones & Tablets",
    subcategory: "iPhone",
    description: "Premium smartphone in excellent condition.",
    price: 14500,
    location: "Accra",
    gps: "GT-567-8901",
    seller: "Mobile Hub Ghana",
    sellerType: "Company",
    deliveryAvailable: true,
    trackingNumber: "APG-000005",
    icon: "📱",
  },

  {
    id: 6,
    title: "Modern 3 Bedroom House",
    category: "Property",
    subcategory: "Houses",
    description: "Beautiful modern family home in a prime location.",
    price: 850000,
    location: "East Legon",
    gps: "GA-678-9012",
    seller: "Prominent Properties",
    sellerType: "Company",
    deliveryAvailable: false,
    icon: "🏠",
  },

  {
    id: 7,
    title: "Agricultural Tractor",
    category: "Agriculture",
    subcategory: "Tractors",
    description: "Agricultural tractor suitable for large-scale farming.",
    price: 320000,
    location: "Kumasi",
    gps: "AK-789-0123",
    seller: "Northern Farm Equipment",
    sellerType: "Company",
    deliveryAvailable: true,
    trackingNumber: "APG-000006",
    icon: "🚜",
  },

  {
    id: 8,
    title: "Professional Graphic Design",
    category: "Jobs & Services",
    subcategory: "Professional Services",
    description:
      "Professional graphic design, branding and advertising services.",
    price: 500,
    location: "Accra",
    gps: "GA-890-1234",
    seller: "Creative Ghana",
    sellerType: "Individual",
    deliveryAvailable: false,
    icon: "🎨",
  },
];

export default function ListingsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [subcategory, setSubcategory] = useState("All Subcategories");
  const [location, setLocation] = useState("All Ghana");
  const [sellerType, setSellerType] = useState("All Sellers");
  const [deliveryOnly, setDeliveryOnly] = useState(false);

  const availableSubcategories = useMemo(() => {
    if (category === "All Categories") {
      return [];
    }

    return subcategories[category] || [];
  }, [category]);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        searchText === "" ||
        item.title.toLowerCase().includes(searchText) ||
        item.description.toLowerCase().includes(searchText) ||
        item.category.toLowerCase().includes(searchText) ||
        item.subcategory.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All Categories" || item.category === category;

      const matchesSubcategory =
        subcategory === "All Subcategories" ||
        item.subcategory === subcategory;

      const matchesLocation =
        location === "All Ghana" || item.location === location;

      const matchesSeller =
        sellerType === "All Sellers" || item.sellerType === sellerType;

      const matchesDelivery =
        !deliveryOnly || item.deliveryAvailable;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubcategory &&
        matchesLocation &&
        matchesSeller &&
        matchesDelivery
      );
    });
  }, [
    search,
    category,
    subcategory,
    location,
    sellerType,
    deliveryOnly,
  ]);

  function handleCategoryChange(value: string) {
    setCategory(value);
    setSubcategory("All Subcategories");
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      maximumFractionDigits: 0,
    }).format(price);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-2xl shadow-md">
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
      <section className="bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-400 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">
            BEST SALES GHANA
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Find Products & Services
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-white/90">
            Search products, machinery, vehicles, property, electronics,
            agriculture and services from sellers across Ghana.
          </p>
        </div>
      </section>

      {/* FILTER AREA */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-7">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900">
              Search Listings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search by category, sub-category, location, seller or delivery.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* SEARCH */}
            <div className="lg:col-span-3">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Search
              </label>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search cars, phones, machinery, houses..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Category
              </label>

              <select
                value={category}
                onChange={(event) =>
                  handleCategoryChange(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBCATEGORY */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Sub-category
              </label>

              <select
                value={subcategory}
                onChange={(event) =>
                  setSubcategory(event.target.value)
                }
                disabled={category === "All Categories"}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none disabled:bg-slate-100"
              >
                <option>All Subcategories</option>

                {availableSubcategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* LOCATION */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Location
              </label>

              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
              >
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* SELLER TYPE */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Seller
              </label>

              <select
                value={sellerType}
                onChange={(event) => setSellerType(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
              >
                <option>All Sellers</option>
                <option>Company</option>
                <option>Individual</option>
              </select>
            </div>

            {/* DELIVERY */}
            <div className="flex items-end">
              <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={deliveryOnly}
                  onChange={(event) =>
                    setDeliveryOnly(event.target.checked)
                  }
                  className="h-5 w-5 accent-blue-700"
                />

                <span>
                  <span className="block font-bold text-slate-800">
                    Marketplace Delivery
                  </span>

                  <span className="block text-xs text-slate-500">
                    Show items available for tracked delivery
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* GPS NOTICE */}
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex gap-3">
              <div className="text-2xl">📍</div>

              <div>
                <h3 className="font-black text-blue-900">
                  GhanaPost GPS Location
                </h3>

                <p className="mt-1 text-sm text-blue-800">
                  Sellers will provide their GhanaPost GPS address when
                  creating a listing. Buyers can use the location for
                  collection or marketplace delivery.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RESULT HEADER */}
        <div className="mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Marketplace
            </p>

            <h2 className="mt-1 text-3xl font-black text-slate-900">
              Latest Listings
            </h2>

            <p className="mt-1 text-slate-500">
              {filteredListings.length} listing
              {filteredListings.length === 1 ? "" : "s"} found
            </p>
          </div>

          <Link
            href="/sell"
            className="rounded-xl bg-blue-700 px-6 py-3 text-center font-black text-white shadow-md hover:bg-blue-800"
          >
            + Post an Ad
          </Link>
        </div>

        {/* LISTINGS */}
        {filteredListings.length > 0 ? (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredListings.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                {/* IMAGE PLACEHOLDER */}
                <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-7xl">
                  {item.icon}
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                      {item.category}
                    </span>

                    {item.sellerType === "Company" ? (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                        Company
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        Individual
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-lg font-black text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>

                  <div className="mt-4 text-xl font-black text-blue-700">
                    {formatPrice(item.price)}
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-slate-500">
                    <div>
                      📍 <strong>{item.location}</strong>
                    </div>

                    <div>
                      🗺️ GhanaPost GPS: <strong>{item.gps}</strong>
                    </div>

                    <div>
                      🏷️ {item.subcategory}
                    </div>
                  </div>

                  {/* DELIVERY STATUS */}
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    {item.deliveryAvailable ? (
                      <>
                        <div className="flex items-center gap-2 font-bold text-green-700">
                          <span>🚚</span>
                          Marketplace Delivery Available
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          Buyer can choose our tracked delivery service.
                        </p>

                        {item.trackingNumber && (
                          <div className="mt-2 rounded-lg bg-white px-3 py-2 text-xs">
                            <span className="font-bold text-slate-700">
                              Tracking:
                            </span>{" "}
                            {item.trackingNumber}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="font-bold text-slate-600">
                          📦 Seller Delivery
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          Marketplace tracked delivery is not currently
                          selected.
                        </p>
                      </>
                    )}
                  </div>

                  <Link
                    href={`/login?listing=${item.id}`}
                    className="mt-5 block rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800"
                  >
                    View Listing
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="text-5xl">🔎</div>

            <h3 className="mt-4 text-2xl font-black text-slate-900">
              No listings found
            </h3>

            <p className="mt-2 text-slate-500">
              Try another category, sub-category or location.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All Categories");
                setSubcategory("All Subcategories");
                setLocation("All Ghana");
                setSellerType("All Sellers");
                setDeliveryOnly(false);
              }}
              className="mt-6 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* DELIVERY EXPLANATION */}
        <section className="mt-16 rounded-3xl bg-slate-950 p-8 text-white sm:p-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="text-4xl">🏢</div>

              <h3 className="mt-4 text-xl font-black">
                Company Sellers
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Companies can offer marketplace delivery so customers can
                receive their purchases with delivery tracking.
              </p>
            </div>

            <div>
              <div className="text-4xl">👤</div>

              <h3 className="mt-4 text-xl font-black">
                Individual Sellers
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Individual sellers are not forced to use marketplace
                delivery. They can make it available as an option.
              </p>
            </div>

            <div>
              <div className="text-4xl">📦</div>

              <h3 className="mt-4 text-xl font-black">
                Buyer Chooses
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                When marketplace delivery is available, the customer can
                choose our delivery service and receive a tracking number.
              </p>
            </div>
          </div>
        </section>
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
            © 2026 All Prominent Ghana Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
