import Link from "next/link";
import { notFound } from "next/navigation";

type CategoryData = {
  name: string;
  icon: string;
  description: string;
  listings: {
    title: string;
    description: string;
    icon: string;
    price: string;
    location: string;
  }[];
};

const categoryData: Record<string, CategoryData> = {
  vehicles: {
    name: "Vehicles",
    icon: "🚗",
    description:
      "Buy and sell cars, trucks, buses, motorcycles and other vehicles across Ghana.",
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
    listings: [
      {
        title: "iPhone 15 Pro Max",
        description: "Premium smartphone with excellent condition.",
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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const data = categoryData[category.toLowerCase()];

  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
        }

        a {
          text-decoration: none;
        }
      `}</style>

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
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Link
            href="/categories"
            className="inline-flex font-bold text-cyan-100 hover:text-white"
          >
            ← All Categories
          </Link>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 text-6xl shadow-xl backdrop-blur">
              {data.icon}
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">
                Marketplace Category
              </p>

              <h1 className="mt-2 text-5xl font-black sm:text-6xl">
                {data.name}
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/90">
                {data.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Browse
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {data.name} Listings
            </h2>

            <p className="mt-2 text-slate-500">
              {data.listings.length} listings available
            </p>
          </div>

          <Link
            href="/sell"
            className="inline-flex rounded-xl bg-blue-700 px-6 py-3 font-black text-white shadow-lg hover:bg-blue-800"
          >
            + Post an Ad
          </Link>
        </div>

        {/* SEARCH / FILTER BAR */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_160px]">
            <input
              type="search"
              placeholder={`Search ${data.name.toLowerCase()}...`}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            />

            <select className="rounded-xl border border-slate-200 px-4 py-3 outline-none">
              <option>All Ghana</option>
              <option>Accra</option>
              <option>Kumasi</option>
              <option>Tema</option>
              <option>East Legon</option>
            </select>

            <button
              type="button"
              className="rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
            >
              Search
            </button>
          </div>
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

        {/* SELLER CTA */}
        <section className="mt-16 rounded-3xl bg-slate-950 p-8 text-white sm:p-12">
          <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
            Sell on BEST SALES GHANA
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Have {data.name.toLowerCase()} to sell?
          </h2>

          <p className="mt-4 max-w-2xl text-white/70">
            Create your listing and connect with buyers across Ghana.
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
