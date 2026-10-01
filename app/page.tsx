
import Link from "next/link";
import LatestListings from "@/components/LatestListings";

const categories = [
  {
    icon: "🚙",
    name: "Vehicles",
    description: "Cars, trucks, buses and more",
    href: "/categories/vehicles",
    listings: "120+ listings",
    accent: "bg-blue-50",
  },
  {
    icon: "🏡",
    name: "Property",
    description: "Houses, apartments and land",
    href: "/categories/property",
    listings: "85+ listings",
    accent: "bg-orange-50",
  },
  {
    icon: "📱",
    name: "Electronics",
    description: "Phones, laptops, TVs and more",
    href: "/categories/electronics",
    listings: "200+ listings",
    accent: "bg-violet-50",
  },
  {
    icon: "🚜",
    name: "Machinery",
    description: "Construction, industrial and farm equipment",
    href: "/categories/machinery",
    listings: "70+ listings",
    accent: "bg-amber-50",
  },
  {
    icon: "🌾",
    name: "Agriculture",
    description: "Farm produce, equipment and inputs",
    href: "/categories/agriculture",
    listings: "95+ listings",
    accent: "bg-green-50",
  },
  {
    icon: "🛠️",
    name: "Services",
    description: "Repairs, maintenance and transport",
    href: "/categories/services",
    listings: "60+ listings",
    accent: "bg-rose-50",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f9fd] text-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-2xl text-white shadow-lg shadow-blue-900/20">
              ★
            </div>

            <div>
              <div className="text-base font-black tracking-tight text-slate-950 sm:text-lg">
                BEST SALES GHANA
              </div>
              <div className="text-[10px] font-semibold tracking-wide text-slate-500 sm:text-xs">
                Buy • Sell • Advertise • Connect
              </div>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-6 lg:flex">
            <Link
              href="/categories"
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-700"
            >
              Categories
            </Link>

            <Link
              href="/listings"
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-700"
            >
              Listings
            </Link>

            <Link
              href="/sell"
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-700"
            >
              Sell
            </Link>

            <Link
              href="/about"
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-700"
            >
              About
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-blue-200 px-5 py-3 text-sm font-bold text-blue-700 transition hover:border-blue-700 hover:bg-blue-50"
            >
              Login
            </Link>

            <Link
              href="/sell"
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
            >
              + Post an Ad
            </Link>
          </nav>

          {/* MOBILE NAVIGATION */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/login"
              className="rounded-xl border border-blue-200 px-3 py-2.5 text-sm font-bold text-blue-700"
            >
              Login
            </Link>

            <Link
              href="/sell"
              className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-700/20"
            >
              Sell
            </Link>
          </div>

        </div>
      </header>

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#102b68] via-[#1749a8] to-[#2563eb]">

        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border-[60px] border-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-48 -left-32 h-[28rem] w-[28rem] rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-blue-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">

          <div className="max-w-4xl">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              Ghana&apos;s Marketplace
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Everything you need.
              <br />
              <span className="text-cyan-200">
                All in one place.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-blue-50/90 sm:text-lg lg:text-xl">
              Discover products, vehicles, property, machinery, equipment,
              services and business opportunities from sellers across Ghana.
            </p>

            {/* SEARCH */}
            <form
              action="/listings"
              method="GET"
              className="mt-9 rounded-2xl border border-white/30 bg-white/15 p-2 shadow-2xl shadow-blue-950/20 backdrop-blur-xl"
            >
              <div className="grid gap-2 sm:grid-cols-[1fr_190px_auto]">

                <div className="flex min-w-0 items-center rounded-xl bg-white px-4">
                  <span className="mr-3 text-xl text-slate-400">
                    ⌕
                  </span>

                  <input
                    type="text"
                    name="q"
                    placeholder="What are you looking for?"
                    aria-label="Search listings"
                    className="w-full min-w-0 border-0 bg-transparent py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 sm:text-base"
                  />
                </div>

                <select
                  name="category"
                  defaultValue=""
                  aria-label="Choose a category"
                  className="rounded-xl border-0 bg-white px-4 py-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">All categories</option>
                  <option value="vehicles">Vehicles</option>
                  <option value="property">Property</option>
                  <option value="electronics">Electronics</option>
                  <option value="machinery">Machinery</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="services">Services</option>
                </select>

                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-7 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Search →
                </button>

              </div>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-blue-100">
              <span className="mr-1 font-semibold text-white/80">
                Popular:
              </span>
              <Link href="/categories/vehicles" className="rounded-full border border-white/20 px-3 py-1.5 transition hover:bg-white/10">
                Vehicles
              </Link>
              <Link href="/categories/property" className="rounded-full border border-white/20 px-3 py-1.5 transition hover:bg-white/10">
                Property
              </Link>
              <Link href="/categories/electronics" className="rounded-full border border-white/20 px-3 py-1.5 transition hover:bg-white/10">
                Electronics
              </Link>
              <Link href="/categories/machinery" className="rounded-full border border-white/20 px-3 py-1.5 transition hover:bg-white/10">
                Machinery
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">
              Explore
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Popular Categories
            </h2>

            <p className="mt-3 text-base text-slate-500 sm:text-lg">
              Find what you need from sellers across Ghana.
            </p>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-2 font-bold text-blue-700 transition hover:gap-3 hover:text-blue-900"
          >
            View all categories <span aria-hidden="true">→</span>
          </Link>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group flex min-h-48 items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/[0.07] sm:gap-5 sm:p-6"
            >
              <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-full ${category.accent} text-5xl transition duration-300 group-hover:scale-105 sm:h-28 sm:w-28`}>
                {category.icon}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-black tracking-tight text-slate-900 transition group-hover:text-blue-700 sm:text-xl">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {category.description}
                </p>

                <p className="mt-3 text-sm font-bold text-blue-700">
                  {category.listings}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                →
              </div>
            </Link>
          ))}

        </div>
      </section>

      {/* LATEST LISTINGS */}
      <section className="border-y border-slate-200/80 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

          <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">
                Marketplace
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Latest Listings
              </h2>

              <p className="mt-3 text-base text-slate-500">
                Browse products and opportunities available on BEST SALES GHANA.
              </p>
            </div>

            <Link
              href="/listings"
              className="inline-flex items-center gap-2 font-bold text-blue-700 transition hover:gap-3 hover:text-blue-900"
            >
              View all listings <span aria-hidden="true">→</span>
            </Link>

          </div>

          {/* SELLER AD */}
          <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-r from-[#102b68] via-[#1749a8] to-[#2877e5] p-7 text-white shadow-xl shadow-blue-900/10 sm:p-10">

            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[45px] border-white/[0.07]" />

            <div className="relative max-w-3xl">

              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                Sell on BEST SALES GHANA
              </p>

              <h3 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                Put your products in front of Ghanaian buyers.
              </h3>

              <p className="mt-4 max-w-2xl leading-7 text-blue-50/85">
                Create your listing, advertise your business and connect directly
                with potential customers.
              </p>

              <Link
                href="/sell"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-black text-blue-800 transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Post Your Ad <span aria-hidden="true">→</span>
              </Link>

            </div>
          </div>

          {/* REAL PRODUCTS FROM SUPABASE */}
          <LatestListings />

        </div>
      </section>

      {/* DELIVERY */}
      <section className="border-b border-slate-200/80 bg-[#f7f9fd]">

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

          <div className="overflow-hidden rounded-3xl bg-[#0d1935] p-7 text-white shadow-xl sm:p-10 lg:p-12">

            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
              BEST SALES GHANA DELIVERY
            </p>

            <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
              Buy with delivery and tracking.
            </h2>

            <p className="mt-4 max-w-3xl leading-7 text-slate-300">
              Buyers can choose BEST SALES GHANA delivery when the option is
              available. Eligible orders will receive a tracking number and
              delivery status updates.
            </p>

            <div className="mt-9 grid gap-4 md:grid-cols-3">

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 transition hover:bg-white/[0.08]">
                <div className="text-3xl">🚚</div>

                <h3 className="mt-4 font-black">
                  Company Delivery
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Businesses can manage deliveries through the marketplace.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 transition hover:bg-white/[0.08]">
                <div className="text-3xl">📦</div>

                <h3 className="mt-4 font-black">
                  Optional Seller Delivery
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Individual sellers can use their own delivery service or
                  offer BEST SALES GHANA delivery.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 transition hover:bg-white/[0.08]">
                <div className="text-3xl">📍</div>

                <h3 className="mt-4 font-black">
                  Order Tracking
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Buyers can track eligible orders using their tracking number.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SELLER CTA */}
      <section className="bg-white">

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

          <div className="flex flex-col gap-8 rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 p-8 text-white shadow-xl shadow-blue-900/10 sm:p-12 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                For Sellers & Businesses
              </p>

              <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
                Ready to sell on BEST SALES GHANA?
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-blue-50/90">
                Post your products, promote your business and connect with
                customers across Ghana.
              </p>
            </div>

            <Link
              href="/sell"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 font-black text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Create a Listing <span aria-hidden="true">→</span>
            </Link>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0b142b] text-white">

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">

            <div className="sm:col-span-2">

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl">
                  ★
                </div>

                <div className="text-xl font-black">
                  BEST SALES GHANA
                </div>
              </div>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
                Ghana&apos;s marketplace for products, vehicles, property,
                services, machinery, equipment and business opportunities.
              </p>

              <p className="mt-4 text-sm font-bold text-cyan-300">
                Buy • Sell • Advertise • Connect
              </p>

            </div>

            <div>
              <h3 className="font-bold">Marketplace</h3>

              <div className="mt-5 space-y-4 text-sm text-slate-400">
                <Link href="/categories" className="block transition hover:text-white">
                  Categories
                </Link>

                <Link href="/listings" className="block transition hover:text-white">
                  Listings
                </Link>

                <Link href="/sell" className="block transition hover:text-white">
                  Sell
                </Link>

                <Link href="/login" className="block transition hover:text-white">
                  Login
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold">Company</h3>

              <div className="mt-5 space-y-4 text-sm text-slate-400">
                <Link href="/about" className="block transition hover:text-white">
                  About Us
                </Link>

                <Link href="/contact" className="block transition hover:text-white">
                  Contact
                </Link>

                <Link href="/help" className="block transition hover:text-white">
                  Help Centre
                </Link>

                <Link href="/terms" className="block transition hover:text-white">
                  Terms & Conditions
                </Link>

                <Link href="/privacy" className="block transition hover:text-white">
                  Privacy Policy
                </Link>
              </div>
            </div>

          </div>

          <div className="mt-12 border-t border-white/10 pt-7 text-center text-sm text-slate-500">
            © 2026 All Prominent Ghana Limited. All rights reserved.
          </div>

        </div>

      </footer>

    </main>
  );
}
