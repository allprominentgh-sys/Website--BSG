"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

type Listing = {
  title: string;
  description: string;
  icon: string;
  price: string;
  location: string;
  gps: string;
  sellerType: "Company" | "Individual";
  deliveryAvailable: boolean;
  trackingNumber?: string;
  subcategory: string;
};

type CategoryData = {
  name: string;
  icon: string;
  description: string;
  subcategories: string[];
  listings: Listing[];
};

const categoryData: Record<string, CategoryData> = {
  vehicles: {
    name: "Vehicles",
    icon: "🚗",
    description:
      "Buy and sell cars, trucks, buses, motorcycles and other vehicles across Ghana.",
    subcategories: [
      "Cars",
      "SUVs",
      "Trucks",
      "Buses",
      "Motorcycles",
      "Commercial Vehicles",
      "Spare Parts",
      "Vehicle Accessories",
    ],
    listings: [
      {
        title: "Toyota Corolla 2020",
        description: "Clean and well-maintained Toyota Corolla.",
        icon: "🚗",
        price: "GH₵ 185,000",
        location: "Kumasi",
        gps: "AK-1234-5678",
        sellerType: "Individual",
        deliveryAvailable: false,
        subcategory: "Cars",
      },
      {
        title: "Toyota Land Cruiser",
        description: "Premium SUV available for sale.",
        icon: "🚙",
        price: "GH₵ 650,000",
        location: "Accra",
        gps: "GA-456-7890",
        sellerType: "Company",
        deliveryAvailable: true,
        trackingNumber: "BSG-VH-000245",
        subcategory: "SUVs",
      },
      {
        title: "Mercedes-Benz",
        description: "Executive vehicle in excellent condition.",
        icon: "🚘",
        price: "GH₵ 480,000",
        location: "East Legon",
        gps: "GA-890-1234",
        sellerType: "Individual",
        deliveryAvailable: true,
        subcategory: "Cars",
      },
      {
        title: "Commercial Truck",
        description: "Heavy-duty truck for business operations.",
        icon: "🚚",
        price: "GH₵ 350,000",
        location: "Tema",
        gps: "GT-234-5678",
        sellerType: "Company",
        deliveryAvailable: true,
        trackingNumber: "BSG-VH-000246",
        subcategory: "Trucks",
      },
    ],
  },

  property: {
    name: "Property",
    icon: "🏠",
    description:
      "Find houses, apartments, land, commercial properties and real estate opportunities.",
    subcategories: [
      "Houses",
      "Apartments",
      "Land",
      "Commercial Property",
      "Office Space",
      "Warehouses",
      "Shops",
      "Property for Rent",
    ],
    listings: [
      {
        title: "Modern 3 Bedroom House",
        description: "Beautiful modern home in a prime location.",
        icon: "🏠",
        price: "GH₵ 850,000",
        location: "East Legon",
        gps: "GA-123-4567",
        sellerType: "Company",
        deliveryAvailable: false,
        subcategory: "Houses",
      },
      {
        title: "4 Bedroom Luxury House",
        description: "Spacious family home with modern facilities.",
        icon: "🏡",
        price: "GH₵ 1,250,000",
        location: "Accra",
        gps: "GA-234-5678",
        sellerType: "Individual",
        deliveryAvailable: false,
        subcategory: "Houses",
      },
      {
        title: "Serviced Apartment",
        description: "Fully serviced apartment available.",
        icon: "🏢",
        price: "GH₵ 450,000",
        location: "Cantonments",
        gps: "GA-345-6789",
        sellerType: "Company",
        deliveryAvailable: false,
        subcategory: "Apartments",
      },
      {
        title: "Commercial Land",
        description: "Prime land suitable for commercial development.",
        icon: "🌍",
        price: "GH₵ 2,000,000",
        location: "Tema",
        gps: "GT-456-7890",
        sellerType: "Company",
        deliveryAvailable: false,
        subcategory: "Land",
      },
    ],
  },

  electronics: {
    name: "Electronics",
    icon: "📱",
    description:
      "Shop phones, laptops, televisions, computers and other electronic products.",
    subcategories: [
      "Phones",
      "Laptops",
      "Tablets",
      "Televisions",
      "Computers",
      "Cameras",
      "Audio Equipment",
      "Accessories",
    ],
    listings: [
      {
        title: "iPhone 15 Pro Max",
        description: "Premium smartphone in excellent condition.",
        icon: "📱",
        price: "GH₵ 14,500",
        location: "Accra",
        gps: "GA-567-8901",
        sellerType: "Company",
        deliveryAvailable: true,
        trackingNumber: "BSG-EL-000301",
        subcategory: "Phones",
      },
      {
        title: "HP Laptop Core i7",
        description: "Powerful laptop for business and professional use.",
        icon: "💻",
        price: "GH₵ 8,500",
        location: "Accra",
        gps: "GA-678-9012",
        sellerType: "Company",
        deliveryAvailable: true,
        trackingNumber: "BSG-EL-000302",
        subcategory: "Laptops",
      },
      {
        title: "Samsung Smart TV",
        description: "Large-screen smart television.",
        icon: "📺",
        price: "GH₵ 9,500",
        location: "Kumasi",
        gps: "AK-789-0123",
        sellerType: "Individual",
        deliveryAvailable: true,
        subcategory: "Televisions",
      },
      {
        title: "MacBook Pro",
        description: "Professional Apple laptop.",
        icon: "💻",
        price: "GH₵ 22,000",
        location: "Tema",
        gps: "GT-890-1234",
        sellerType: "Company",
        deliveryAvailable: true,
        trackingNumber: "BSG-EL-000303",
        subcategory: "Laptops",
      },
    ],
  },

  machinery: {
    name: "Machinery",
    icon: "⚙️",
    description:
      "Discover industrial machinery, printing equipment, construction equipment and tools.",
    subcategories: [
      "Industrial Machines",
      "Printing Equipment",
      "DTF Machines",
      "Construction Equipment",
      "Generators",
      "Factory Equipment",
      "Packaging Machines",
      "Tools",
    ],
    listings: [
      {
        title: "Industrial Printing Machine",
        description: "Professional printing equipment for businesses.",
        icon: "🏭",
        price: "GH₵ 250,000",
        location: "Accra",
        gps: "GA-901-2345",
        sellerType: "Company",
        deliveryAvailable: true,
        trackingNumber: "BSG-MC-000401",
        subcategory: "Printing Equipment",
      },
      {
        title: "Construction Excavator",
        description: "Heavy-duty excavator for construction projects.",
        icon: "🚜",
        price: "GH₵ 850,000",
        location: "Tema",
        gps: "GT-012-3456",
        sellerType: "Company",
        deliveryAvailable: true,
        trackingNumber: "BSG-MC-000402",
        subcategory: "Construction Equipment",
      },
      {
        title: "DTF Printing Machine",
        description: "Commercial direct-to-film printing machine.",
        icon: "🖨️",
        price: "GH₵ 75,000",
        location: "Accra",
        gps: "GA-123-4567",
        sellerType: "Individual",
        deliveryAvailable: true,
        subcategory: "DTF Machines",
      },
      {
        title: "Industrial Generator",
        description: "Large-capacity generator for industrial operations.",
        icon: "⚡",
        price: "GH₵ 180,000",
        location: "Kumasi",
        gps: "AK-234-5678",
        sellerType: "Company",
        deliveryAvailable: true,
        trackingNumber: "BSG-MC-000403",
        subcategory: "Generators",
      },
    ],
  },

  agriculture: {
    name: "Agriculture",
    icon: "🌾",
    description:
      "Agricultural machinery, farming equipment, livestock and farming opportunities.",
    subcategories: [
      "Tractors",
      "Farm Machinery",
      "Irrigation",
      "Livestock",
      "Poultry",
      "Seeds",
      "Fertilizers",
      "Farm Equipment",
    ],
    listings: [
      {
        title: "Tractor",
        description: "Agricultural tractor for large-scale farming.",
        icon: "🚜",
        price: "GH₵ 320,000",
        location: "Kumasi",
        gps: "AK-345-6789",
        sellerType: "Company",
        deliveryAvailable: true,
        trackingNumber: "BSG-AG-000501",
        subcategory: "Tractors",
      },
      {
        title: "Irrigation Equipment",
        description: "Modern irrigation system for farms.",
        icon: "💧",
        price: "GH₵ 45,000",
        location: "Tamale",
        gps: "NT-456-7890",
        sellerType: "Company",
        deliveryAvailable: true,
        trackingNumber: "BSG-AG-000502",
        subcategory: "Irrigation",
      },
      {
        title: "Maize Processing Machine",
        description: "Commercial agricultural processing equipment.",
        icon: "🌽",
        price: "GH₵ 85,000",
        location: "Sunyani",
        gps: "BA-567-8901",
        sellerType: "Individual",
        deliveryAvailable: true,
        subcategory: "Farm Machinery",
      },
      {
        title: "Poultry Equipment",
        description: "Complete poultry farming equipment.",
        icon: "🐔",
        price: "GH₵ 35,000",
        location: "Accra",
        gps: "GA-678-9012",
        sellerType: "Individual",
        deliveryAvailable: false,
        subcategory: "Poultry",
      },
    ],
  },

  services: {
    name: "Services",
    icon: "🛠️",
    description:
      "Find professional, business, technical, transport and other services across Ghana.",
    subcategories: [
      "Business Services",
      "Construction",
      "Graphic Design",
      "Transport",
      "Delivery",
      "Repairs",
      "IT Services",
      "Professional Services",
    ],
    listings: [
      {
        title: "Business Consulting",
        description: "Professional business consulting services.",
        icon: "💼",
        price: "Contact Seller",
        location: "Accra",
        gps: "GA-789-0123",
        sellerType: "Company",
        deliveryAvailable: false,
        subcategory: "Business Services",
      },
      {
        title: "Graphic Design Services",
        description: "Professional graphic design and branding.",
        icon: "🎨",
        price: "From GH₵ 500",
        location: "Accra",
        gps: "GA-890-1234",
        sellerType: "Individual",
        deliveryAvailable: false,
        subcategory: "Graphic Design",
      },
      {
        title: "Building & Construction",
        description: "Professional construction services.",
        icon: "🏗️",
        price: "Contact Seller",
        location: "Kumasi",
        gps: "AK-901-2345",
        sellerType: "Company",
        deliveryAvailable: false,
        subcategory: "Construction",
      },
      {
        title: "Delivery Services",
        description: "Local and nationwide delivery services.",
        icon: "🚚",
        price: "Contact Seller",
        location: "Tema",
        gps: "GT-012-3456",
        sellerType: "Company",
        deliveryAvailable: true,
        trackingNumber: "BSG-SV-000601",
        subcategory: "Delivery",
      },
    ],
  },
};

export default function CategoryPage() {
  const params = useParams();

  const categorySlug = String(params.category || "").toLowerCase();

  const data = categoryData[categorySlug];

  const [selectedSubcategory, setSelectedSubcategory] =
    useState("All Subcategories");

  const [search, setSearch] = useState("");

  const [location, setLocation] = useState("All Ghana");

  const [deliveryOnly, setDeliveryOnly] = useState(false);

  const [gpsLocation, setGpsLocation] = useState("");

  const [gpsLoading, setGpsLoading] = useState(false);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <div className="text-6xl">🔎</div>

          <h1 className="mt-5 text-3xl font-black text-slate-900">
            Category not found
          </h1>

          <Link
            href="/categories"
            className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white"
          >
            Back to Categories
          </Link>
        </div>
      </main>
    );
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("GPS is not supported by this device/browser.");
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);

        setGpsLocation(`GPS: ${latitude}, ${longitude}`);
        setGpsLoading(false);
      },
      () => {
        alert(
          "We could not access your location. Please allow location permission and try again."
        );

        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const filteredListings = data.listings.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchesSubcategory =
      selectedSubcategory === "All Subcategories" ||
      item.subcategory === selectedSubcategory;

    const matchesLocation =
      location === "All Ghana" ||
      item.location.toLowerCase() === location.toLowerCase();

    const matchesDelivery =
      !deliveryOnly || item.deliveryAvailable === true;

    return (
      matchesSearch &&
      matchesSubcategory &&
      matchesLocation &&
      matchesDelivery
    );
  });

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-2xl shadow-md">
              ⭐
            </div>

            <div>
              <div className="text-lg font-black tracking-tight text-slate-900">
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
              className="font-semibold text-blue-700"
            >
              Categories
            </Link>

            <Link
              href="/listings"
              className="font-semibold text-slate-700 hover:text-blue-700"
            >
              Listings
            </Link>

            <Link
              href="/sell"
              className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-md hover:bg-blue-800"
            >
              Post an Ad
            </Link>
          </nav>

          <div className="flex gap-2 md:hidden">
            <Link
              href="/login"
              className="rounded-xl border border-blue-700 px-4 py-2 font-bold text-blue-700"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-400 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <Link
            href="/categories"
            className="font-bold text-cyan-100 hover:text-white"
          >
            ← All Categories
          </Link>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/15 text-6xl shadow-xl backdrop-blur">
              {data.icon}
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">
                Marketplace Category
              </p>

              <h1 className="mt-2 text-5xl font-black sm:text-6xl">
                {data.name}
              </h1>

              <p className="mt-4 max-w-3xl text-lg leading-8 text-white/90">
                {data.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SUBCATEGORIES */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-5">
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Browse by type
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              {data.name} Subcategories
            </h2>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setSelectedSubcategory("All Subcategories")}
              className={`shrink-0 rounded-full px-5 py-3 font-bold transition ${
                selectedSubcategory === "All Subcategories"
                  ? "bg-blue-700 text-white shadow-md"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300"
              }`}
            >
              All
            </button>

            {data.subcategories.map((subcategory) => (
              <button
                key={subcategory}
                type="button"
                onClick={() => setSelectedSubcategory(subcategory)}
                className={`shrink-0 rounded-full px-5 py-3 font-bold transition ${
                  selectedSubcategory === subcategory
                    ? "bg-blue-700 text-white shadow-md"
                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300"
                }`}
              >
                {subcategory}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SEARCH AND LOCATION */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Search & Location
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Find listings near you
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
            {/* SEARCH */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Search
              </label>

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${data.name.toLowerCase()}...`}
                className="w-full rounded-xl border border-slate-200 px-4 py-4 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* LOCATION */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Location in Ghana
              </label>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 outline-none focus:border-blue-600"
              >
                <option>All Ghana</option>
                <option>Accra</option>
                <option>East Legon</option>
                <option>Tema</option>
                <option>Kumasi</option>
                <option>Tamale</option>
                <option>Sunyani</option>
              </select>
            </div>

            {/* SUBCATEGORY */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Subcategory
              </label>

              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 outline-none focus:border-blue-600"
              >
                <option>All Subcategories</option>

                {data.subcategories.map((subcategory) => (
                  <option key={subcategory}>{subcategory}</option>
                ))}
              </select>
            </div>
          </div>

          {/* GPS */}
          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-black text-slate-900">
                  📍 GhanaPostGPS / Current GPS Location
                </div>

                <p className="mt-1 text-sm text-slate-600">
                  Buyers and sellers can provide their GhanaPostGPS digital
                  address and use their phone GPS for accurate location.
                </p>

                {gpsLocation && (
                  <div className="mt-3 rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-700">
                    {gpsLocation}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gpsLoading}
                className="shrink-0 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-md hover:bg-blue-800 disabled:opacity-60"
              >
                {gpsLoading ? "Getting Location..." : "📍 Use My GPS"}
              </button>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                GhanaPostGPS Digital Address
              </label>

              <input
                type="text"
                placeholder="Example: GA-123-4567"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* DELIVERY FILTER */}
          <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-black text-slate-900">
                🚚 BEST SALES GHANA Delivery
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Show sellers who allow delivery through our tracked delivery
                system.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-3 font-bold text-slate-700">
              <input
                type="checkbox"
                checked={deliveryOnly}
                onChange={(e) => setDeliveryOnly(e.target.checked)}
                className="h-5 w-5 accent-blue-700"
              />

              Delivery Available
            </label>
          </div>
        </div>

        {/* RESULTS */}
        <div className="mt-12">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-blue-700">
                Marketplace
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-900">
                {selectedSubcategory === "All Subcategories"
                  ? `${data.name} Listings`
                  : selectedSubcategory}
              </h2>

              <p className="mt-2 text-slate-500">
                {filteredListings.length} listings found
              </p>
            </div>

            <Link
              href="/sell"
              className="inline-flex rounded-xl bg-blue-700 px-6 py-3 font-black text-white shadow-lg hover:bg-blue-800"
            >
              + Post an Ad
            </Link>
          </div>

          {filteredListings.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
              <div className="text-6xl">🔎</div>

              <h3 className="mt-5 text-2xl font-black text-slate-900">
                No listings found
              </h3>

              <p className="mt-2 text-slate-500">
                Try another search, location or subcategory.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredListings.map((item) => (
                <article
                  key={item.title}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  {/* IMAGE PLACEHOLDER */}
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50 text-7xl">
                    {item.icon}
                  </div>

                  <div className="p-5">
                    {/* SUBCATEGORY */}
                    <div className="text-xs font-black uppercase tracking-wider text-blue-700">
                      {item.subcategory}
                    </div>

                    <h3 className="mt-2 text-lg font-black text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>

                    {/* PRICE */}
                    <div className="mt-4 text-lg font-black text-blue-700">
                      {item.price}
                    </div>

                    {/* LOCATION */}
                    <div className="mt-2 text-sm text-slate-500">
                      📍 {item.location}
                    </div>

                    {/* GPS */}
                    <div className="mt-1 text-xs font-semibold text-slate-400">
                      GhanaPostGPS: {item.gps}
                    </div>

                    {/* SELLER TYPE */}
                    <div className="mt-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {item.sellerType} Seller
                      </span>
                    </div>

                    {/* DELIVERY */}
                    {item.deliveryAvailable ? (
                      <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3">
                        <div className="font-black text-green-700">
                          🚚 Delivery Available
                        </div>

                        <p className="mt-1 text-xs text-green-700">
                          Buyer can choose BEST SALES GHANA tracked delivery.
                        </p>

                        {item.trackingNumber && (
                          <div className="mt-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-700">
                            Tracking: {item.trackingNumber}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="font-bold text-slate-600">
                          Seller Delivery
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          Platform delivery is not currently enabled for this
                          listing.
                        </p>
                      </div>
                    )}

                    {/* CONTACT */}
                    <Link
                      href="/login"
                      className="mt-5 block rounded-xl border border-blue-700 px-4 py-3 text-center font-bold text-blue-700 hover:bg-blue-50"
                    >
                      Contact Seller
                    </Link>

                    {/* VIEW */}
                    <Link
                      href={`/listings?category=${categorySlug}&subcategory=${encodeURIComponent(
                        item.subcategory
                      )}`}
                      className="mt-2 block rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800"
                    >
                      View Listing →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* DELIVERY EXPLANATION */}
        <section className="mt-16 rounded-3xl bg-blue-950 p-8 text-white sm:p-12">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
              BEST SALES GHANA Delivery
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Choose how you want your item delivered.
            </h2>

            <p className="mt-4 text-lg leading-8 text-white/70">
              Buyers can choose BEST SALES GHANA tracked delivery when the
              seller has enabled it. This gives the buyer a delivery tracking
              number and allows the order to be followed from pickup to
              delivery.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-5">
                <div className="text-3xl">🏢</div>

                <h3 className="mt-3 font-black">
                  Company Sellers
                </h3>

                <p className="mt-2 text-sm text-white/60">
                  Companies can operate with the BEST SALES GHANA delivery
                  system for their orders.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5">
                <div className="text-3xl">👤</div>

                <h3 className="mt-3 font-black">
                  Individual Sellers
                </h3>

                <p className="mt-2 text-sm text-white/60">
                  Individual sellers can choose whether or not to offer BEST
                  SALES GHANA delivery.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5">
                <div className="text-3xl">📦</div>

                <h3 className="mt-3 font-black">
                  Buyer Chooses
                </h3>

                <p className="mt-2 text-sm text-white/60">
                  Where available, the client selects our tracked delivery at
                  checkout.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SELLER CTA */}
        <section className="mt-16 rounded-3xl bg-slate-950 p-8 text-white sm:p-12">
          <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
            Sell on BEST SALES GHANA
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Have {data.name.toLowerCase()} to sell?
          </h2>

          <p className="mt-4 max-w-2xl text-white/70">
            Create your listing, select your subcategory, add your GhanaPostGPS
            location and choose whether you want to offer BEST SALES GHANA
            delivery.
          </p>

          <Link
            href="/sell"
            className="mt-7 inline-flex rounded-xl bg-blue-600 px-7 py-4 font-black text-white hover:bg-cyan-400 hover:text-slate-950"
          >
            Create a Listing →
          </Link>
        </section>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
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
