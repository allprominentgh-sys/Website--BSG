import Link from "next/link";

type Listing = {
  id: number;
  title: string;
  description: string;
  icon: string;
  price: string;
  category: string;
  subcategory: string;
  location: string;
  region: string;
  seller: string;
  delivery: boolean;
  tracking: boolean;
};

const listings: Listing[] = [
  {
    id: 1,
    title: "Toyota Corolla 2020",
    description: "Clean and well-maintained Toyota Corolla available for sale.",
    icon: "🚗",
    price: "GH₵ 185,000",
    category: "Vehicles",
    subcategory: "Cars",
    location: "Accra",
    region: "Greater Accra",
    seller: "Private Seller",
    delivery: true,
    tracking: true,
  },

  {
    id: 2,
    title: "Toyota Land Cruiser",
    description: "Premium SUV in excellent condition.",
    icon: "🚙",
    price: "GH₵ 650,000",
    category: "Vehicles",
    subcategory: "SUVs",
    location: "East Legon",
    region: "Greater Accra",
    seller: "Business Seller",
    delivery: true,
    tracking: true,
  },

  {
    id: 3,
    title: "Modern 3 Bedroom House",
    description: "Beautiful modern home in a prime residential location.",
    icon: "🏠",
    price: "GH₵ 850,000",
    category: "Property",
    subcategory: "Houses",
    location: "East Legon",
    region: "Greater Accra",
    seller: "Property Agent",
    delivery: false,
    tracking: false,
  },

  {
    id: 4,
    title: "Serviced Apartment",
    description: "Fully serviced apartment available in a prime location.",
    icon: "🏢",
    price: "GH₵ 450,000",
    category: "Property",
    subcategory: "Apartments",
    location: "Cantonments",
    region: "Greater Accra",
    seller: "Property Agent",
    delivery: false,
    tracking: false,
  },

  {
    id: 5,
    title: "iPhone 15 Pro Max",
    description: "Premium smartphone in excellent condition.",
    icon: "📱",
    price: "GH₵ 14,500",
    category: "Electronics",
    subcategory: "Phones",
    location: "Accra",
    region: "Greater Accra",
    seller: "Verified Seller",
    delivery: true,
    tracking: true,
  },

  {
    id: 6,
    title: "HP Laptop Core i7",
    description: "Powerful laptop suitable for business and professional use.",
    icon: "💻",
    price: "GH₵ 8,500",
    category: "Electronics",
    subcategory: "Laptops",
    location: "Kumasi",
    region: "Ashanti",
    seller: "Verified Seller",
    delivery: true,
    tracking: true,
  },

  {
    id: 7,
    title: "Industrial Printing Machine",
    description: "Professional industrial printing equipment for businesses.",
    icon: "🏭",
    price: "GH₵ 250,000",
    category: "Machinery",
    subcategory: "Printing Equipment",
    location: "Accra",
    region: "Greater Accra",
    seller: "Business Seller",
    delivery: true,
    tracking: true,
  },

  {
    id: 8,
    title: "DTF Printing Machine",
    description: "Commercial direct-to-film printing machine.",
    icon: "🖨️",
    price: "GH₵ 75,000",
    category: "Machinery",
    subcategory: "Printing Equipment",
    location: "Tema",
    region: "Greater Accra",
    seller: "Business Seller",
    delivery: true,
    tracking: true,
  },

  {
    id: 9,
    title: "Construction Excavator",
    description: "Heavy-duty excavator for construction projects.",
    icon: "🚜",
    price: "GH₵ 850,000",
    category: "Machinery",
    subcategory: "Construction Equipment",
    location: "Tema",
    region: "Greater Accra",
    seller: "Machinery Dealer",
    delivery: true,
    tracking: true,
  },

  {
    id: 10,
    title: "Industrial Generator",
    description: "Large-capacity generator for industrial operations.",
    icon: "⚡",
    price: "GH₵ 180,000",
    category: "Machinery",
    subcategory: "Generators",
    location: "Kumasi",
    region: "Ashanti",
    seller: "Business Seller",
    delivery: true,
    tracking: true,
  },

  {
    id: 11,
    title: "Agricultural Tractor",
    description: "Agricultural tractor suitable for large-scale farming.",
    icon: "🚜",
    price: "GH₵ 320,000",
    category: "Agriculture",
    subcategory: "Farm Machinery",
    location: "Kumasi",
    region: "Ashanti",
    seller: "Agriculture Dealer",
    delivery: true,
    tracking: true,
  },

  {
    id: 12,
    title: "Irrigation Equipment",
    description: "Modern irrigation equipment for farms.",
    icon: "💧",
    price: "GH₵ 45,000",
    category: "Agriculture",
    subcategory: "Irrigation",
    location: "Tamale",
    region: "Northern",
    seller: "Agriculture Dealer",
    delivery: true,
    tracking: true,
  },

  {
    id: 13,
    title: "Graphic Design Services",
    description: "Professional graphic design and branding services.",
    icon: "🎨",
    price: "From GH₵ 500",
    category: "Services",
    subcategory: "Graphic Design",
    location: "Accra",
    region: "Greater Accra",
    seller: "Service Provider",
    delivery: false,
    tracking: false,
  },

  {
    id: 14,
    title: "Building & Construction",
    description: "Professional construction and building services.",
    icon: "🏗️",
    price: "Contact Seller",
    category: "Services",
    subcategory: "Construction Services",
    location: "Kumasi",
    region: "Ashanti",
    seller: "Service Provider",
    delivery: false,
    tracking: false,
  },
];

const categories = [
  "All Categories",
  "Vehicles",
  "Property",
  "Electronics",
  "Machinery",
  "Agriculture",
  "Services",
];

const locations = [
  "All Ghana",
  "Accra",
  "Kumasi",
  "Tema",
  "Tamale",
  "Takoradi",
  "Cape Coast",
  "Sunyani",
];

export default function ListingsPage() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-2xl shadow-md">
              ⭐
            </div>

            <div>
              <div className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
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
              href="/login"
              className="rounded-xl border border-blue-700 px-5 py-3 font-bold text-blue-700 hover:bg-blue-50"
            >
              Login
            </Link>

            <Link
              href="/sell"
              className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-md hover:bg-blue-800"
            >
              Post an Ad
            </Link>

          </nav>

          {/* MOBILE */}
          <div className="flex gap-2 md:hidden">

            <Link
              href="/login"
              className="rounded-xl border border-blue-700 px-3 py-2 text-sm font-bold text-blue-700"
            >
              Login
            </Link>

            <Link
              href="/sell"
              className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white"
            >
              Sell
            </Link>

          </div>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-400 text-white">

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">
            BEST SALES GHANA
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Marketplace Listings
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/90">
            Discover vehicles, property, electronics, machinery,
            agricultural equipment, services and business opportunities
            from sellers across Ghana.
          </p>

          {/* SEARCH */}
          <form
            action="/listings"
            method="GET"
            className="mt-8 rounded-2xl border border-white/30 bg-white/15 p-2 shadow-2xl backdrop-blur"
          >

            <div className="grid gap-2 md:grid-cols-[1fr_200px_180px_auto]">

              <input
                type="search"
                name="q"
                placeholder="Search products, vehicles, machinery..."
                className="rounded-xl border-0 bg-white px-4 py-4 text-slate-900 outline-none"
              />

              <select
                name="category"
                className="rounded-xl border-0 bg-white px-4 py-4 text-slate-800 outline-none"
                defaultValue="All Categories"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                name="location"
                className="rounded-xl border-0 bg-white px-4 py-4 text-slate-800 outline-none"
                defaultValue="All Ghana"
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="rounded-xl bg-slate-950 px-7 py-4 font-bold text-white hover:bg-slate-900"
              >
                Search
              </button>

            </div>
          </form>

        </div>
      </section>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* TOP BAR */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Marketplace
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Available Listings
            </h2>

            <p className="mt-2 text-slate-500">
              Browse products and services from sellers across Ghana.
            </p>
          </div>

          <Link
            href="/sell"
            className="inline-flex rounded-xl bg-blue-700 px-6 py-3 font-black text-white shadow-lg hover:bg-blue-800"
          >
            + Post an Ad
          </Link>

        </div>

        {/* FILTER INFORMATION */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-2xl">🇬🇭</div>

            <div className="mt-2 font-black text-slate-900">
              Ghana Marketplace
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Listings from sellers across Ghana.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-2xl">📍</div>

            <div className="mt-2 font-black text-slate-900">
              Location
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Future GPS location will allow buyers to find nearby sellers.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-2xl">🚚</div>

            <div className="mt-2 font-black text-slate-900">
              Optional Delivery
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Buyers can choose BEST SALES GHANA delivery when available.
            </p>
          </div>

        </div>

        {/* LISTINGS GRID */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {listings.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
            >

              {/* IMAGE PLACEHOLDER */}
              <div className="relative flex h-52 items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50 text-7xl">
                {item.icon}

                <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700 shadow">
                  {item.category}
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-5">

                <p className="text-xs font-black uppercase tracking-wider text-blue-700">
                  {item.subcategory}
                </p>

                <h3 className="mt-2 text-lg font-black text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>

                <div className="mt-4 text-lg font-black text-blue-700">
                  {item.price}
                </div>

                {/* LOCATION */}
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <span>📍</span>
                  <span>{item.location}</span>
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  {item.region}, Ghana
                </div>

                {/* SELLER */}
                <div className="mt-4 border-t border-slate-100 pt-4">

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-semibold text-slate-500">
                      Seller
                    </span>

                    <span className="text-xs font-bold text-slate-700">
                      {item.seller}
                    </span>

                  </div>

                </div>

                {/* DELIVERY */}
                <div className="mt-4 flex flex-wrap gap-2">

                  {item.delivery && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      🚚 Delivery Available
                    </span>
                  )}

                  {item.tracking && (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                      📦 Tracking Available
                    </span>
                  )}

                </div>

                {/* BUTTON */}
                <Link
                  href={`/listings/${item.id}`}
                  className="mt-5 block rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800"
                >
                  View Listing
                </Link>

              </div>
            </article>
          ))}

        </div>

        {/* DELIVERY SYSTEM */}
        <section className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-600 p-8 text-white shadow-xl sm:p-12">

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-sm font-black uppercase tracking-widest text-cyan-200">
                BEST SALES GHANA DELIVERY
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Choose how you receive your purchase.
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-white/80">
                Company sellers can use our delivery system for their
                orders. Individual sellers can also choose to use the
                BEST SALES GHANA delivery service, but it remains optional.
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <div className="text-3xl">🏢</div>

                <h3 className="mt-3 font-black">
                  Company Sellers
                </h3>

                <p className="mt-2 text-sm text-white/70">
                  Delivery can be integrated into the seller's business
                  orders.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <div className="text-3xl">👤</div>

                <h3 className="mt-3 font-black">
                  Individual Sellers
                </h3>

                <p className="mt-2 text-sm text-white/70">
                  Seller may offer their own delivery or allow the buyer
                  to choose our delivery service.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur sm:col-span-2">
                <div className="text-3xl">📦</div>

                <h3 className="mt-3 font-black">
                  Track Your Order
                </h3>

                <p className="mt-2 text-sm text-white/70">
                  When BEST SALES GHANA delivery is selected, the buyer
                  will receive a tracking number and be able to follow
                  the delivery status.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* FUTURE GPS SECTION */}
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-black uppercase tracking-widest text-blue-700">
                Coming in the platform
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-900">
                GhanaPost GPS Location
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-slate-500">
                Sellers will be able to provide their GhanaPost GPS
                location. Buyers can use the location when arranging
                pickup or delivery.
              </p>

            </div>

            <div className="shrink-0 rounded-2xl bg-blue-50 px-6 py-5 text-center">
              <div className="text-4xl">📍</div>
              <div className="mt-2 font-black text-blue-800">
                GPS Ready
              </div>
            </div>

          </div>

        </section>

      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-10 text-white">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid gap-8 md:grid-cols-3">

            <div>
              <div className="text-xl font-black">
                BEST SALES GHANA
              </div>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                Ghana's marketplace for products, vehicles, property,
                machinery, services and business opportunities.
              </p>
            </div>

            <div>
              <h3 className="font-bold">
                Marketplace
              </h3>

              <div className="mt-4 space-y-3 text-sm text-slate-400">

                <Link
                  href="/categories"
                  className="block hover:text-white"
                >
                  Categories
                </Link>

                <Link
                  href="/listings"
                  className="block hover:text-white"
                >
                  Listings
                </Link>

                <Link
                  href="/sell"
                  className="block hover:text-white"
                >
                  Sell
                </Link>

              </div>
            </div>

            <div>
              <h3 className="font-bold">
                Support
              </h3>

              <div className="mt-4 space-y-3 text-sm text-slate-400">

                <Link
                  href="/about"
                  className="block hover:text-white"
                >
                  About Us
                </Link>

                <Link
                  href="/contact"
                  className="block hover:text-white"
                >
                  Contact
                </Link>

                <Link
                  href="/help"
                  className="block hover:text-white"
                >
                  Help Centre
                </Link>

              </div>
            </div>

          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
            © 2026 All Prominent Ghana Limited. All rights reserved.
          </div>

        </div>

      </footer>

    </main>
  );
}
