import Link from "next/link";

type Listing = {
  id: number;
  title: string;
  category: string;
  price: string;
  location: string;
  icon: string;
  description: string;
};

const listings: Listing[] = [
  {
    id: 1,
    title: "Toyota Corolla 2020",
    category: "Vehicles",
    price: "GH₵ 185,000",
    location: "Kumasi",
    icon: "🚗",
    description: "Clean and well-maintained Toyota Corolla.",
  },
  {
    id: 2,
    title: "Toyota Land Cruiser",
    category: "Vehicles",
    price: "GH₵ 650,000",
    location: "Accra",
    icon: "🚙",
    description: "Premium SUV available for sale.",
  },
  {
    id: 3,
    title: "Modern 3 Bedroom House",
    category: "Property",
    price: "GH₵ 850,000",
    location: "East Legon",
    icon: "🏠",
    description: "Beautiful modern home in a prime location.",
  },
  {
    id: 4,
    title: "Commercial Land",
    category: "Property",
    price: "GH₵ 2,000,000",
    location: "Tema",
    icon: "🌍",
    description: "Prime land suitable for commercial development.",
  },
  {
    id: 5,
    title: "iPhone 15 Pro Max",
    category: "Electronics",
    price: "GH₵ 14,500",
    location: "Accra",
    icon: "📱",
    description: "Premium smartphone in excellent condition.",
  },
  {
    id: 6,
    title: "HP Laptop Core i7",
    category: "Electronics",
    price: "GH₵ 8,500",
    location: "Accra",
    icon: "💻",
    description: "Powerful laptop for business and professional use.",
  },
  {
    id: 7,
    title: "Industrial Printing Machine",
    category: "Machinery",
    price: "GH₵ 250,000",
    location: "Accra",
    icon: "🏭",
    description: "Professional printing equipment for businesses.",
  },
  {
    id: 8,
    title: "Construction Excavator",
    category: "Machinery",
    price: "GH₵ 850,000",
    location: "Tema",
    icon: "🚜",
    description: "Heavy-duty excavator for construction projects.",
  },
  {
    id: 9,
    title: "DTF Printing Machine",
    category: "Machinery",
    price: "GH₵ 75,000",
    location: "Accra",
    icon: "🖨️",
    description: "Commercial direct-to-film printing machine.",
  },
  {
    id: 10,
    title: "Tractor",
    category: "Agriculture",
    price: "GH₵ 320,000",
    location: "Kumasi",
    icon: "🚜",
    description: "Agricultural tractor for large-scale farming.",
  },
  {
    id: 11,
    title: "Irrigation Equipment",
    category: "Agriculture",
    price: "GH₵ 45,000",
    location: "Tamale",
    icon: "💧",
    description: "Modern irrigation system for farms.",
  },
  {
    id: 12,
    title: "Business Consulting",
    category: "Services",
    price: "Contact Seller",
    location: "Accra",
    icon: "💼",
    description: "Professional business consulting services.",
  },
];

export default function ListingsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-2xl text-white shadow-md">
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
      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-400 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">
            BEST SALES GHANA Marketplace
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl lg:text-6xl">
            Browse Listings
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/90">
            Discover vehicles, property, electronics, machinery, agriculture,
            services and more from sellers across Ghana.
          </p>
        </div>
      </section>

      {/* SEARCH */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_200px_180px]">
            <input
              type="search"
              placeholder="Search products, vehicles, property, machinery..."
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />

            <select className="rounded-xl border border-slate-200 px-4 py-3 outline-none">
              <option>All Categories</option>
              <option>Vehicles</option>
              <option>Property</option>
              <option>Electronics</option>
              <option>Machinery</option>
              <option>Agriculture</option>
              <option>Services</option>
            </select>

            <select className="rounded-xl border border-slate-200 px-4 py-3 outline-none">
              <option>All Ghana</option>
              <option>Accra</option>
              <option>Kumasi</option>
              <option>Tema</option>
              <option>Tamale</option>
              <option>Sunyani</option>
            </select>
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Marketplace
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Latest Listings
            </h2>

            <p className="mt-2 text-slate-500">
              {listings.length} sample listings available
            </p>
          </div>

          <Link
            href="/sell"
            className="hidden rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800 sm:inline-flex"
          >
            + Post an Ad
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              {/* IMAGE PLACEHOLDER */}
              <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-7xl">
                {item.icon}
              </div>

              <div className="p-5">
                <div className="text-xs font-black uppercase tracking-wider text-blue-700">
                  {item.category}
                </div>

                <h3 className="mt-2 text-lg font-black text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>

                <div className="mt-4 text-lg font-black text-blue-700">
                  {item.price}
                </div>

                <div className="mt-2 text-sm text-slate-500">
                  📍 {item.location}
                </div>

                <Link
                  href={`/chat?seller=Seller&listing=${encodeURIComponent(
                    item.title
                  )}`}
                  className="mt-5 block rounded-xl border border-blue-700 px-4 py-3 text-center font-bold text-blue-700 hover:bg-blue-50"
                >
                  Contact Seller
                </Link>

                <Link
                  href={`/listings/${item.id}`}
                  className="mt-2 block rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800"
                >
                  View Listing
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* DELIVERY INFORMATION */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-950 p-8 text-white sm:p-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="text-3xl">🚚</div>

              <h3 className="mt-3 text-xl font-black">
                Optional Delivery
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Individual sellers can choose whether to offer BEST SALES
                GHANA delivery.
              </p>
            </div>

            <div>
              <div className="text-3xl">📍</div>

              <h3 className="mt-3 text-xl font-black">
                GhanaPost GPS
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Buyer and seller locations can be captured using GhanaPost GPS
                for delivery.
              </p>
            </div>

            <div>
              <div className="text-3xl">📦</div>

              <h3 className="mt-3 text-xl font-black">
                Track Your Item
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Marketplace deliveries will receive a tracking number so the
                buyer can follow the delivery status.
              </p>
            </div>
          </div>
        </div>
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
