"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../components/Header";

type Listing = {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  category: string;
  subcategory: string;
  seller: string;
  phone: string;
  image: string;
  featured: boolean;
};

const categories = [
  {
    name: "Industrial Machinery",
    subcategories: [
      "Machine Tools",
      "CNC Machines",
      "Metalworking Machinery",
      "Packaging Machinery",
      "Food Processing Machinery",
      "Textile Machinery",
      "Woodworking Machinery",
      "Industrial Equipment",
    ],
  },
  {
    name: "Printing Equipment",
    subcategories: [
      "Digital Printers",
      "Offset Printers",
      "Flexographic Printers",
      "Screen Printing Machines",
      "UV Printers",
      "Embroidery Machines",
      "Printing Materials",
    ],
  },
  {
    name: "Construction Equipment",
    subcategories: [
      "Excavators",
      "Loaders",
      "Bulldozers",
      "Cranes",
      "Concrete Machinery",
      "Road Machinery",
      "Mining Equipment",
    ],
  },
  {
    name: "Vehicles & Transportation",
    subcategories: [
      "Cars",
      "Trucks",
      "Buses",
      "Motorcycles",
      "Heavy Trucks",
      "Trailers",
      "Vehicle Parts",
    ],
  },
  {
    name: "Electrical & Electronics",
    subcategories: [
      "Electrical Equipment",
      "Generators",
      "Transformers",
      "Solar Equipment",
      "Batteries",
      "Cables",
      "Electronic Components",
    ],
  },
  {
    name: "Agriculture & Food",
    subcategories: [
      "Agricultural Machinery",
      "Farm Equipment",
      "Irrigation Equipment",
      "Livestock Equipment",
      "Animal Feed",
      "Food & Beverages",
      "Farming Supplies",
    ],
  },
  {
    name: "Tools & Hardware",
    subcategories: [
      "Hand Tools",
      "Power Tools",
      "Hardware",
      "Fasteners",
      "Welding Equipment",
      "Measuring Tools",
    ],
  },
  {
    name: "Building Materials",
    subcategories: [
      "Cement",
      "Steel",
      "Roofing Materials",
      "Tiles",
      "Doors & Windows",
      "Plumbing Materials",
      "Glass",
    ],
  },
  {
    name: "Home & Furniture",
    subcategories: [
      "Furniture",
      "Kitchen Furniture",
      "Office Furniture",
      "Home Decor",
      "Lighting",
      "Mattresses",
    ],
  },
  {
    name: "Apparel & Textiles",
    subcategories: [
      "Clothing",
      "Shoes",
      "Bags",
      "Fabrics",
      "Uniforms",
      "Textile Machinery",
    ],
  },
  {
    name: "Beauty & Personal Care",
    subcategories: [
      "Cosmetics",
      "Skincare",
      "Hair Products",
      "Hair Salon Equipment",
      "Beauty Equipment",
      "Personal Care",
    ],
  },
  {
    name: "Sports & Entertainment",
    subcategories: [
      "Sports Equipment",
      "Fitness Equipment",
      "Outdoor Recreation",
      "Games",
      "Musical Instruments",
      "Entertainment Equipment",
    ],
  },
  {
    name: "Packaging & Printing",
    subcategories: [
      "Packaging Machines",
      "Packaging Materials",
      "Plastic Packaging",
      "Paper Packaging",
      "Labels",
      "Printing Supplies",
    ],
  },
  {
    name: "Chemicals",
    subcategories: [
      "Industrial Chemicals",
      "Agricultural Chemicals",
      "Cleaning Chemicals",
      "Paints & Coatings",
      "Adhesives",
      "Plastic Raw Materials",
    ],
  },
  {
    name: "Energy & Renewable Energy",
    subcategories: [
      "Solar Panels",
      "Solar Inverters",
      "Solar Batteries",
      "Generators",
      "Wind Energy Equipment",
      "Energy Storage",
    ],
  },
  {
    name: "Consumer Electronics",
    subcategories: [
      "Televisions",
      "Audio Equipment",
      "Cameras",
      "Smart Devices",
      "Accessories",
      "Home Appliances",
    ],
  },
  {
    name: "Phones & Tablets",
    subcategories: [
      "iPhones",
      "Android Phones",
      "Tablets",
      "Phone Accessories",
      "Smart Watches",
      "Chargers",
    ],
  },
  {
    name: "Cars & Auto Parts",
    subcategories: [
      "Cars",
      "SUVs",
      "Pickup Trucks",
      "Engines",
      "Tyres",
      "Car Accessories",
      "Spare Parts",
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
      "Shops",
      "Office Space",
    ],
  },
  {
    name: "Jobs",
    subcategories: [
      "Full Time",
      "Part Time",
      "Remote Jobs",
      "Engineering Jobs",
      "Construction Jobs",
      "Sales Jobs",
      "Drivers",
    ],
  },
  {
    name: "Services",
    subcategories: [
      "Professional Services",
      "Repair Services",
      "Construction Services",
      "Transport Services",
      "Cleaning Services",
      "IT Services",
      "Business Services",
    ],
  },
];

const listings: Listing[] = [
  {
    id: 1,
    title: "iPhone 15 Pro",
    description: "Clean and gently used iPhone 15 Pro.",
    price: 12500,
    currency: "GHS",
    location: "Accra, Ghana",
    category: "Phones & Tablets",
    subcategory: "iPhones",
    seller: "All Prominent Seller",
    phone: "233240000000",
    image:
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1200&q=80",
    featured: true,
  },
  {
    id: 2,
    title: "Toyota Camry",
    description: "Neat and well-maintained Toyota Camry.",
    price: 285000,
    currency: "GHS",
    location: "Accra, Ghana",
    category: "Cars & Auto Parts",
    subcategory: "Cars",
    seller: "All Prominent Seller",
    phone: "233240000001",
    image:
      "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80",
    featured: true,
  },
  {
    id: 3,
    title: "Industrial Printing Machine",
    description: "Professional printing equipment for commercial use.",
    price: 85000,
    currency: "GHS",
    location: "Accra, Ghana",
    category: "Printing Equipment",
    subcategory: "Digital Printers",
    seller: "All Prominent Seller",
    phone: "233240000002",
    image:
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80",
    featured: false,
  },
  {
    id: 4,
    title: "Excavator",
    description: "Heavy-duty construction excavator.",
    price: 950000,
    currency: "GHS",
    location: "Tema, Ghana",
    category: "Construction Equipment",
    subcategory: "Excavators",
    seller: "All Prominent Seller",
    phone: "233240000003",
    image:
      "https://images.unsplash.com/photo-1580901369227-308f6f40f5b2?auto=format&fit=crop&w=1200&q=80",
    featured: false,
  },
];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const filteredListings = listings.filter((listing) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      listing.title.toLowerCase().includes(searchText) ||
      listing.description.toLowerCase().includes(searchText) ||
      listing.category.toLowerCase().includes(searchText) ||
      listing.subcategory.toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "All" ||
      listing.category === selectedCategory ||
      listing.subcategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
            ALL PROMINENT
            <br />
            GHANA
          </h1>

          <p className="mt-5 text-xl md:text-2xl">
            Buy • Sell • Advertise • Connect
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="#marketplace"
              className="rounded-2xl bg-white px-8 py-5 text-center text-xl font-bold text-blue-700 shadow-lg transition hover:scale-[1.02]"
            >
              Browse Marketplace
            </Link>

            <Link
              href="/post"
              className="rounded-2xl bg-sky-400 px-8 py-5 text-center text-xl font-bold text-slate-900 shadow-lg transition hover:scale-[1.02]"
            >
              Post an Ad
            </Link>
          </div>
        </div>
      </section>

      {/* MARKETPLACE */}
      <section id="marketplace" className="px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold md:text-5xl">
            Ghana Marketplace
          </h2>

          <p className="mt-4 max-w-4xl text-lg text-slate-500 md:text-xl">
            Find products, industrial machinery, printing equipment,
            construction equipment, vehicles, property, jobs, services and
            more from sellers across Ghana.
          </p>

          {/* SEARCH */}
          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, machines, cars, property, jobs..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-6 py-5 text-lg outline-none focus:border-blue-600"
            />

            <button
              onClick={() => {}}
              className="rounded-2xl bg-blue-700 px-10 py-5 text-lg font-bold text-white"
            >
              Search
            </button>
          </div>

          {/* CATEGORIES */}
          <div className="mt-10 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`rounded-xl px-5 py-3 font-semibold ${
                  selectedCategory === "All"
                    ? "bg-green-700 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                All
              </button>

              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setOpenCategory(
                      openCategory === category.name ? null : category.name
                    );
                  }}
                  className={`rounded-xl px-5 py-3 font-semibold transition ${
                    selectedCategory === category.name
                      ? "bg-green-700 text-white"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* SUBCATEGORIES */}
            {openCategory && (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <h3 className="mb-4 text-xl font-bold">
                  {openCategory} — Subcategories
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {categories
                    .find((category) => category.name === openCategory)
                    ?.subcategories.map((subcategory) => (
                      <button
                        key={subcategory}
                        onClick={() => setSelectedCategory(subcategory)}
                        className={`rounded-xl border px-4 py-4 text-left font-medium transition ${
                          selectedCategory === subcategory
                            ? "border-green-700 bg-green-50 text-green-700"
                            : "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        {subcategory}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* LISTINGS */}
          <div className="mt-14">
            <h2 className="text-4xl font-semibold">Available Listings</h2>

            <p className="mt-3 text-lg text-slate-500">
              {filteredListings.length} listings found
            </p>

            <div className="mt-5">
              <Link
                href="/post"
                className="text-lg font-semibold text-blue-700 hover:underline"
              >
                + Post an Ad
              </Link>
            </div>

            {filteredListings.length === 0 ? (
              <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
                <h3 className="text-2xl font-bold">No listings found</h3>
                <p className="mt-2 text-slate-500">
                  Try another search or category.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {filteredListings.map((listing) => (
                  <article
                    key={listing.id}
                    className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200"
                  >
                    <div className="relative">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="h-64 w-full object-cover"
                      />

                      {listing.featured && (
                        <span className="absolute left-4 top-4 rounded-lg bg-yellow-400 px-4 py-2 font-bold text-slate-900">
                          FEATURED
                        </span>
                      )}
                    </div>

                    <div className="p-6">
                      <p className="font-bold text-green-700">
                        {listing.category}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {listing.subcategory}
                      </p>

                      <h3 className="mt-3 text-2xl font-semibold">
                        {listing.title}
                      </h3>

                      <p className="mt-3 text-slate-500">
                        {listing.description}
                      </p>

                      <p className="mt-5 text-2xl font-bold text-green-700">
                        {listing.currency}{" "}
                        {listing.price.toLocaleString()}
                      </p>

                      <p className="mt-2 text-slate-500">
                        📍 {listing.location}
                      </p>

                      <p className="mt-1 text-slate-500">
                        Seller: {listing.seller}
                      </p>

                      <div className="mt-6 flex items-center justify-between gap-3">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-700"
                        >
                          View Details
                        </Link>

                        <a
                          href={`tel:+${listing.phone}`}
                          className="rounded-xl border-2 border-green-700 px-5 py-3 font-bold text-green-700"
                        >
                          Call Seller
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
