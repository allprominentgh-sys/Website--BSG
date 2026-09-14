import Link from "next/link";

export default function HomePage() {
  const categories = [
    { icon: "🚗", name: "Vehicles", href: "/categories/vehicles" },
    { icon: "🏠", name: "Property", href: "/categories/property" },
    { icon: "📱", name: "Electronics", href: "/categories/electronics" },
    { icon: "⚙️", name: "Machinery", href: "/categories/machinery" },
    { icon: "🌾", name: "Agriculture", href: "/categories/agriculture" },
    { icon: "🛠️", name: "Services", href: "/categories/services" },
  ];

  const listings = [
    {
      icon: "🏭",
      title: "Industrial Machinery",
      category: "Machinery & Equipment",
      href: "/categories/machinery",
    },
    {
      icon: "🚙",
      title: "Vehicles & Auto",
      category: "Vehicles",
      href: "/categories/vehicles",
    },
    {
      icon: "🏡",
      title: "Property & Real Estate",
      category: "Property",
      href: "/categories/property",
    },
    {
      icon: "🖨️",
      title: "Printing Equipment",
      category: "Business Equipment",
      href: "/categories/machinery",
    },
    {
      icon: "📱",
      title: "Phones & Electronics",
      category: "Electronics",
      href: "/categories/electronics",
    },
    {
      icon: "🌱",
      title: "Agriculture Equipment",
      category: "Agriculture",
      href: "/categories/agriculture",
    },
  ];

  return (
    <main className="marketplace-page min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="site-header sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="BEST SALES GHANA Home"
          >
            <div className="logo-mark">
              <div className="logo-ring">
                <div className="logo-person">
                  <span className="logo-head" />
                  <span className="logo-arm logo-arm-left" />
                  <span className="logo-arm logo-arm-right" />
                  <span className="logo-body" />
                </div>
              </div>
            </div>

            <div>
              <div className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                BEST SALES GHANA
              </div>

              <div className="text-xs font-medium text-slate-500">
                Buy • Sell • Advertise • Connect
              </div>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-5 md:flex">

            <Link
              href="/categories"
              className="font-semibold text-slate-700 transition hover:text-blue-700"
            >
              Categories
            </Link>

            <Link
              href="/listings"
              className="font-semibold text-slate-700 transition hover:text-blue-700"
            >
              Listings
            </Link>

            <Link
              href="/sell"
              className="font-semibold text-slate-700 transition hover:text-blue-700"
            >
              Sell
            </Link>

            <Link
              href="/about"
              className="font-semibold text-slate-700 transition hover:text-blue-700"
            >
              About
            </Link>

            {/* LOGIN */}
            <Link
              href="/login"
              className="rounded-xl border border-blue-700 px-5 py-3 font-bold text-blue-700 transition hover:bg-blue-50"
            >
              Login
            </Link>

            {/* POST AD */}
            <Link
              href="/sell"
              className="btn-primary rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-lg transition hover:bg-blue-800"
            >
              Post an Ad
            </Link>
          </nav>

          {/* MOBILE ACTIONS */}
          <div className="flex items-center gap-2 md:hidden">

            <Link
              href="/login"
              className="rounded-xl border border-blue-700 px-3 py-2 text-sm font-bold text-blue-700"
            >
              Login
            </Link>

            <Link
              href="/sell"
              className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg"
            >
              Sell
            </Link>

          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-400">

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10" />

        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-white/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">

          <div className="max-w-4xl">

            <p className="mb-5 text-sm font-black uppercase tracking-[0.2em] text-cyan-100">
              Ghana&apos;s Marketplace
            </p>

            <h1 className="text-5xl font-black leading-none tracking-tight text-white sm:text-6xl lg:text-7xl">
              Buy.
              <br />
              Sell.
              <br />
              <span className="text-cyan-100">
                Connect.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/90 sm:text-xl">
              Discover products, vehicles, property, machinery, equipment,
              services and business opportunities from sellers across Ghana.
            </p>

            {/* SEARCH */}
            <form
              action="/listings"
              method="GET"
              className="mt-8 rounded-2xl border border-white/30 bg-white/15 p-2 shadow-2xl backdrop-blur-xl"
            >

              <div className="grid gap-2 sm:grid-cols-[1fr_180px_auto]">

                <div className="flex items-center rounded-xl bg-white px-4">

                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-3 shrink-0 text-slate-400"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>

                  <input
                    type="text"
                    name="q"
                    placeholder="What are you looking for?"
                    className="w-full border-0 bg-transparent py-4 text-slate-900 outline-none"
                  />
                </div>

                <select
                  name="category"
                  className="rounded-xl border-0 bg-white px-4 py-4 text-slate-800 outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Category
                  </option>

                  <option value="vehicles">
                    Vehicles
                  </option>

                  <option value="property">
                    Property
                  </option>

                  <option value="electronics">
                    Electronics
                  </option>

                  <option value="machinery">
                    Machinery
                  </option>

                  <option value="agriculture">
                    Agriculture
                  </option>

                  <option value="services">
                    Services
                  </option>
                </select>

                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-7 py-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                >
                  Search
                </button>

              </div>
            </form>

          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORIES
      ===================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Explore
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Popular Categories
            </h2>

            <p className="mt-2 text-slate-500">
              Find what you need from sellers across Ghana.
            </p>
          </div>

          <Link
            href="/categories"
            className="font-bold text-blue-700 hover:text-blue-900"
          >
            View all categories →
          </Link>

        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">

          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
            >

              <div className="text-4xl">
                {category.icon}
              </div>

              <div className="mt-4 font-bold text-slate-800 transition group-hover:text-blue-700">
                {category.name}
              </div>

            </Link>
          ))}

        </div>
      </section>

      {/* =====================================================
          LATEST LISTINGS
      ===================================================== */}
      <section
        id="latest-listings"
        className="border-y border-slate-200 bg-slate-50"
      >

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>
              <p className="text-sm font-black uppercase tracking-widest text-blue-700">
                Marketplace
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-900">
                Latest Listings
              </h2>

              <p className="mt-2 text-slate-500">
                Browse products and opportunities available on BEST SALES GHANA.
              </p>
            </div>

            <Link
              href="/listings"
              className="font-bold text-blue-700 hover:text-blue-900"
            >
              View all listings →
            </Link>

          </div>

          {/* TOP SELLER AD */}
          <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-500 p-7 text-white shadow-xl sm:p-10">

            <p className="text-sm font-bold uppercase tracking-widest text-cyan-100">
              Sell on BEST SALES GHANA
            </p>

            <h3 className="mt-2 text-2xl font-black sm:text-3xl">
              Put your products in front of Ghanaian buyers.
            </h3>

            <p className="mt-3 max-w-2xl text-white/85">
              Create your listing, advertise your business and connect directly
              with potential customers.
            </p>

            <Link
              href="/sell"
              className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 font-black text-blue-800 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Post Your Ad
            </Link>

          </div>

          {/* LISTING CARDS */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {listings.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >

                <div className="flex h-52 items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50 text-7xl transition group-hover:from-cyan-50 group-hover:to-blue-50">
                  {item.icon}
                </div>

                <div className="p-5">

                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    {item.category}
                  </p>

                  <h3 className="mt-2 text-xl font-black text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Browse available listings and connect with sellers.
                  </p>

                  <div className="mt-5 font-bold text-blue-700">
                    Explore →
                  </div>

                </div>
              </Link>
            ))}

          </div>

        </div>
      </section>

      {/* =====================================================
          SELLER CTA
      ===================================================== */}
      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <div className="rounded-3xl bg-slate-950 p-8 text-white sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-10">

            <div>

              <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
                For Sellers & Businesses
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Ready to sell on BEST SALES GHANA?
              </h2>

              <p className="mt-4 max-w-2xl text-white/70">
                Post your products, promote your business and connect with
                customers across Ghana.
              </p>

            </div>

            <Link
              href="/sell"
              className="mt-7 inline-flex shrink-0 rounded-xl bg-blue-600 px-7 py-4 font-black text-white shadow-lg transition hover:-translate-y-1 hover:bg-cyan-400 hover:text-slate-950 lg:mt-0"
            >
              Create a Listing
            </Link>

          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="bg-slate-950 text-white">

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

          <div className="grid gap-10 md:grid-cols-4">

            {/* COMPANY */}
            <div className="md:col-span-2">

              <div className="text-2xl font-black">
                BEST SALES GHANA
              </div>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                Ghana&apos;s marketplace for products, vehicles, property,
                services, machinery, equipment and business opportunities.
              </p>

              <p className="mt-4 text-sm font-semibold text-cyan-400">
                Buy • Sell • Advertise • Connect
              </p>

            </div>

            {/* MARKETPLACE */}
            <div>

              <h3 className="font-bold">
                Marketplace
              </h3>

              <div className="mt-4 space-y-3 text-sm text-slate-400">

                <Link
                  className="block hover:text-white"
                  href="/categories"
                >
                  Categories
                </Link>

                <Link
                  className="block hover:text-white"
                  href="/listings"
                >
                  Listings
                </Link>

                <Link
                  className="block hover:text-white"
                  href="/sell"
                >
                  Sell
                </Link>

                <Link
                  className="block hover:text-white"
                  href="/login"
                >
                  Login
                </Link>

              </div>

            </div>

            {/* COMPANY / SUPPORT */}
            <div>

              <h3 className="font-bold">
                Company
              </h3>

              <div className="mt-4 space-y-3 text-sm text-slate-400">

                <Link
                  className="block hover:text-white"
                  href="/about"
                >
                  About Us
                </Link>

                <Link
                  className="block hover:text-white"
                  href="/contact"
                >
                  Contact
                </Link>

                <Link
                  className="block hover:text-white"
                  href="/help"
                >
                  Help Centre
                </Link>

                <Link
                  className="block hover:text-white"
                  href="/terms"
                >
                  Terms & Conditions
                </Link>

                <Link
                  className="block hover:text-white"
                  href="/privacy"
                >
                  Privacy Policy
                </Link>

              </div>

            </div>

          </div>

          {/* COPYRIGHT */}
          <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-500">

            © 2026 All Prominent Ghana Limited. All rights reserved.

          </div>

        </div>
      </footer>

    </main>
  );
}
