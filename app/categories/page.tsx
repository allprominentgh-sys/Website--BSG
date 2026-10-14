
import Link from "next/link";

const categories = [
  {
    name: "Vehicles",
    slug: "vehicles",
    icon: "🚗",
    description: "Cars, SUVs, trucks, buses, motorcycles and vehicle parts.",
  },
  {
    name: "Property",
    slug: "property",
    icon: "🏠",
    description: "Houses, apartments, land, shops and commercial properties.",
  },
  {
    name: "Electronics",
    slug: "electronics",
    icon: "📱",
    description: "Phones, laptops, televisions, computers and accessories.",
  },
  {
    name: "Machinery",
    slug: "machinery",
    icon: "⚙️",
    description: "Industrial machines, printing equipment, tools and generators.",
  },
  {
    name: "Agriculture",
    slug: "agriculture",
    icon: "🌾",
    description: "Tractors, farming equipment, livestock and agricultural supplies.",
  },
  {
    name: "Services",
    slug: "services",
    icon: "🛠️",
    description: "Business, construction, transport, technical and professional services.",
  },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-2xl shadow-md">
              ⭐
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900">
                BEST SALES GHANA
              </h1>
              <p className="text-sm text-slate-500">
                Buy • Sell • Advertise • Connect
              </p>
            </div>
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-400 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="font-bold text-cyan-100 hover:text-white"
          >
            ← Home
          </Link>

          <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-cyan-100">
            Explore the marketplace
          </p>

          <h2 className="mt-3 text-4xl font-black sm:text-6xl">
            All Categories
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">
            Discover products, property, vehicles, machinery and services
            from sellers across Ghana.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-4xl transition group-hover:bg-blue-100">
                {category.icon}
              </div>

              <h3 className="mt-5 text-2xl font-black text-slate-900 group-hover:text-blue-700">
                {category.name}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {category.description}
              </p>

              <span className="mt-5 inline-block font-bold text-blue-700">
                Explore {category.name} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="bg-slate-950 py-8 text-center text-white">
        <p className="font-black">BEST SALES GHANA</p>
        <p className="mt-2 text-sm text-slate-400">
          © 2026 All Prominent Ghana Limited. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
