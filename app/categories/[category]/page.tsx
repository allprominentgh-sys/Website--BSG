import Link from "next/link";
import { notFound } from "next/navigation";

type Listing = {
  title: string;
  description: string;
  icon: string;
  price: string;
  location: string;
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
      "Heavy Equipment",
      "Vehicle Parts",
      "Vehicle Accessories",
    ],
    listings: [
      {
        title: "Toyota Corolla 2020",
        description: "Clean and well-maintained Toyota Corolla.",
        icon: "🚗",
        price: "GH₵ 185,000",
        location: "Kumasi",
      },
      {
        title: "Toyota Land Cruiser",
        description: "Premium SUV available for sale.",
        icon: "🚙",
        price: "GH₵ 650,000",
        location: "Accra",
      },
      {
        title: "Mercedes-Benz",
        description: "Executive vehicle in excellent condition.",
        icon: "🚘",
        price: "GH₵ 480,000",
        location: "East Legon",
      },
      {
        title: "Commercial Truck",
        description: "Heavy-duty truck for business operations.",
        icon: "🚚",
        price: "GH₵ 350,000",
        location: "Tema",
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
      "Shops",
      "Warehouses",
      "Hotels",
      "Industrial Property",
    ],
    listings: [
      {
        title: "Modern 3 Bedroom House",
        description: "Beautiful modern home in a prime location.",
        icon: "🏠",
        price: "GH₵ 850,000",
        location: "East Legon",
      },
      {
        title: "4 Bedroom Luxury House",
        description: "Spacious family home with modern facilities.",
        icon: "🏡",
        price: "GH₵ 1,250,000",
        location: "Accra",
      },
      {
        title: "Serviced Apartment",
        description: "Fully serviced apartment available.",
        icon: "🏢",
        price: "GH₵ 450,000",
        location: "Cantonments",
      },
      {
        title: "Commercial Land",
        description: "Prime land suitable for commercial development.",
        icon: "🌍",
        price: "GH₵ 2,000,000",
        location: "Tema",
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
      "Tablets",
      "Laptops",
      "Desktop Computers",
      "Televisions",
      "Cameras",
      "Audio Equipment",
      "Gaming",
      "Computer Accessories",
      "Phone Accessories",
    ],
    listings: [
      {
        title: "iPhone 15 Pro Max",
        description: "Premium smartphone in excellent condition.",
        icon: "📱",
        price: "GH₵ 14,500",
        location: "Accra",
      },
      {
        title: "HP Laptop Core i7",
        description: "Powerful laptop for business and professional use.",
        icon: "💻",
        price: "GH₵ 8,500",
        location: "Accra",
      },
      {
        title: "Samsung Smart TV",
        description: "Large-screen smart television.",
        icon: "📺",
        price: "GH₵ 9,500",
        location: "Kumasi",
      },
      {
        title: "MacBook Pro",
        description: "Professional Apple laptop.",
        icon: "💻",
        price: "GH₵ 22,000",
        location: "Tema",
      },
    ],
  },

  machinery: {
    name: "Machinery",
    icon: "⚙️",
    description:
      "Discover industrial machinery, printing equipment, construction equipment and tools.",
    subcategories: [
      "Industrial Machinery",
      "Printing Equipment",
      "DTF Printing Machines",
      "Eco-Solvent Printers",
      "Construction Equipment",
      "Mining Equipment",
      "Generators",
      "Factory Equipment",
      "Packaging Machines",
      "Machine Parts",
      "Tools",
    ],
    listings: [
      {
        title: "Industrial Printing Machine",
        description: "Professional printing equipment for businesses.",
        icon: "🏭",
        price: "GH₵ 250,000",
        location: "Accra",
      },
      {
        title: "Construction Excavator",
        description: "Heavy-duty excavator for construction projects.",
        icon: "🚜",
        price: "GH₵ 850,000",
        location: "Tema",
      },
      {
        title: "DTF Printing Machine",
        description: "Commercial direct-to-film printing machine.",
        icon: "🖨️",
        price: "GH₵ 75,000",
        location: "Accra",
      },
      {
        title: "Industrial Generator",
        description: "Large-capacity generator for industrial operations.",
        icon: "⚡",
        price: "GH₵ 180,000",
        location: "Kumasi",
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
      "Poultry Equipment",
      "Livestock",
      "Seeds",
      "Fertilizer",
      "Processing Equipment",
      "Greenhouse Equipment",
      "Farm Tools",
    ],
    listings: [
      {
        title: "Tractor",
        description: "Agricultural tractor for large-scale farming.",
        icon: "🚜",
        price: "GH₵ 320,000",
        location: "Kumasi",
      },
      {
        title: "Irrigation Equipment",
        description: "Modern irrigation system for farms.",
        icon: "💧",
        price: "GH₵ 45,000",
        location: "Tamale",
      },
      {
        title: "Maize Processing Machine",
        description: "Commercial agricultural processing equipment.",
        icon: "🌽",
        price: "GH₵ 85,000",
        location: "Sunyani",
      },
      {
        title: "Poultry Equipment",
        description: "Complete poultry farming equipment.",
        icon: "🐔",
        price: "GH₵ 35,000",
        location: "Accra",
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
      "IT Services",
      "Transport",
      "Delivery",
      "Repairs",
      "Cleaning",
      "Professional Services",
      "Photography",
    ],
    listings: [
      {
        title: "Business Consulting",
        description: "Professional business consulting services.",
        icon: "💼",
        price: "Contact Seller",
        location: "Accra",
      },
      {
        title: "Graphic Design Services",
        description: "Professional graphic design and branding.",
        icon: "🎨",
        price: "From GH₵ 500",
        location: "Accra",
      },
      {
        title: "Building & Construction",
        description: "Professional construction services.",
        icon: "🏗️",
        price: "Contact Seller",
        location: "Kumasi",
      },
      {
        title: "Delivery Services",
        description: "Local and nationwide delivery services.",
        icon: "🚚",
        price: "Contact Seller",
        location: "Tema",
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(categoryData).map((category) => ({
    category,
  }));
}

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = params.category.toLowerCase();

  const data = categoryData[category];

  if (!data) {
    notFound();
  }

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
        </div>
      </header>

      {/* CATEGORY HERO */}
      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-400 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <Link
            href="/categories"
            className="font-bold text-cyan-100 hover:text-white"
          >
            ← All Categories
          </Link>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/15 text-6xl shadow-xl">
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
              Explore
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              {data.name} Subcategories
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {data.subcategories.map((subcategory) => (
              <button
                key={subcategory}
                type="button"
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {subcategory}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* SEARCH + LOCATION */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">
              Find {data.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search by product, subcategory or location in Ghana.
            </p>
          </div>

          <form
            action="/listings"
            method="GET"
            className="grid gap-3 lg:grid-cols-[1fr_190px_190px_auto]"
          >
            <input
              type="search"
              name="q"
              placeholder={`Search ${data.name.toLowerCase()}...`}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />

            <select
              name="subcategory"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-600"
              defaultValue=""
            >
              <option value="">All Subcategories</option>

              {data.subcategories.map((subcategory) => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>

            <select
              name="location"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-600"
              defaultValue=""
            >
              <option value="">All Ghana</option>
              <option value="Greater Accra">Greater Accra</option>
              <option value="Ashanti">Ashanti</option>
              <option value="Western">Western</option>
              <option value="Central">Central</option>
              <option value="Eastern">Eastern</option>
              <option value="Volta">Volta</option>
              <option value="Northern">Northern</option>
              <option value="Bono">Bono</option>
              <option value="Bono East">Bono East</option>
              <option value="Ahafo">Ahafo</option>
              <option value="Upper East">Upper East</option>
              <option value="Upper West">Upper West</option>
              <option value="Oti">Oti</option>
              <option value="Savannah">Savannah</option>
              <option value="North East">North East</option>
              <option value="Western North">Western North</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-blue-700 px-7 py-3 font-black text-white transition hover:bg-blue-800"
            >
              Search
            </button>
          </form>

          {/* GPS LOCATION */}
          <div className="mt-4 rounded-xl bg-blue-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-slate-900">
                  📍 Use my location
                </p>

                <p className="text-sm text-slate-500">
                  Location will later connect to Ghana Post GPS / GPS-based
                  delivery.
                </p>
              </div>

              <button
                type="button"
                className="rounded-xl border border-blue-700 bg-white px-5 py-3 font-bold text-blue-700 hover:bg-blue-100"
              >
                Detect Location
              </button>
            </div>
          </div>
        </div>

        {/* RESULTS HEADER */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Marketplace
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {data.name} Listings
            </h2>

            <p className="mt-2 text-slate-500">
              {data.listings.length} sample listings available
            </p>
          </div>

          <Link
            href="/sell"
            className="inline-flex rounded-xl bg-blue-700 px-6 py-3 font-black text-white shadow-lg hover:bg-blue-800"
          >
            + Post an Ad
          </Link>
        </div>

        {/* LISTINGS */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.listings.map((item) => (
            <article
              key={item.title}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
            >
              <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50 text-7xl">
                {item.icon}
              </div>

              <div className="p-5">
                <div className="text-xs font-black uppercase tracking-wider text-blue-700">
                  {data.name}
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

                {/* DELIVERY */}
                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-black uppercase text-slate-500">
                    Delivery
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    🚚 Seller / Buyer arranged
                  </p>

                  <p className="mt-1 text-xs text-blue-700">
                    Our tracked delivery can be selected at checkout.
                  </p>
                </div>

                <Link
                  href="/login"
                  className="mt-5 block rounded-xl border border-blue-700 px-4 py-3 text-center font-bold text-blue-700 hover:bg-blue-50"
                >
                  Contact Seller
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* TRACKED DELIVERY */}
        <section className="mt-14 rounded-3xl bg-blue-900 p-8 text-white sm:p-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-cyan-300">
                BEST SALES GHANA DELIVERY
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Choose our tracked delivery when buying.
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-white/80">
                Individual sellers can choose whether to use their own
                delivery or allow the buyer to select BEST SALES GHANA
                tracked delivery.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-5">
                <div className="text-3xl">📍</div>
                <p className="mt-3 font-black">Location</p>
                <p className="mt-1 text-sm text-white/70">
                  GPS location
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5">
                <div className="text-3xl">🔢</div>
                <p className="mt-3 font-black">Tracking</p>
                <p className="mt-1 text-sm text-white/70">
                  Tracking number
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5">
                <div className="text-3xl">🚚</div>
                <p className="mt-3 font-black">Delivery</p>
                <p className="mt-1 text-sm text-white/70">
                  Track your item
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SELLER CTA */}
        <section className="mt-14 rounded-3xl bg-slate-950 p-8 text-white sm:p-12">
          <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
            Sell on BEST SALES GHANA
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Have {data.name.toLowerCase()} to sell?
          </h2>

          <p className="mt-4 max-w-2xl text-white/70">
            Create your listing, choose your subcategory and location, and
            connect with buyers across Ghana.
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
          <div className="text-xl font-black">BEST SALES GHANA</div>

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
