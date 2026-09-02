import Link from "next/link";

const listings = [
  {
    title: "iPhone 15 Pro Max",
    price: "GH₵ 12,500",
    location: "Accra, Greater Accra",
    category: "Phones & Tablets",
  },
  {
    title: "Toyota Corolla 2020",
    price: "GH₵ 185,000",
    location: "Kumasi, Ashanti",
    category: "Cars",
  },
  {
    title: "3 Bedroom House",
    price: "GH₵ 950,000",
    location: "East Legon, Accra",
    category: "Property",
  },
  {
    title: "Men's Designer Sneakers",
    price: "GH₵ 850",
    location: "Tema, Greater Accra",
    category: "Fashion",
  },
  {
    title: "Samsung 55-inch Smart TV",
    price: "GH₵ 6,200",
    location: "Accra, Greater Accra",
    category: "Electronics",
  },
  {
    title: "Professional Graphic Design",
    price: "GH₵ 300",
    location: "Accra, Greater Accra",
    category: "Jobs & Services",
  },
];

export default function ListingsPage() {
  return (
    <main>
      {/* PAGE HEADER */}
      <section className="hero">
        <div className="container py-12">
          <h1 className="text-4xl md:text-5xl font-black">
            Ghana Marketplace
          </h1>

          <p className="mt-4 text-lg">
            Buy and sell products, vehicles, property, services and more
            across Ghana.
          </p>

          <div className="mt-8">
            <input
              type="search"
              placeholder="Search products, cars, property..."
              className="w-full rounded-xl border-0 p-4 text-black"
            />
          </div>
        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="container py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black">
              Featured Listings
            </h2>

            <p className="muted mt-2">
              Discover products and services from sellers across Ghana.
            </p>
          </div>

          <Link href="/post" className="btn btn-primary">
            + Post an Ad
          </Link>
        </div>

        {/* FILTERS */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <select className="rounded-xl border bg-white p-4">
            <option>All Categories</option>
            <option>Phones & Tablets</option>
            <option>Cars</option>
            <option>Property</option>
            <option>Fashion</option>
            <option>Electronics</option>
            <option>Jobs & Services</option>
          </select>

          <select className="rounded-xl border bg-white p-4">
            <option>All Locations</option>
            <option>Greater Accra</option>
            <option>Ashanti</option>
            <option>Western</option>
            <option>Central</option>
            <option>Eastern</option>
            <option>Volta</option>
            <option>Northern</option>
          </select>

          <select className="rounded-xl border bg-white p-4">
            <option>Sort: Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        {/* LISTINGS */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <article key={listing.title} className="card">
              <div
                style={{
                  height: "180px",
                  background:
                    "linear-gradient(135deg,#087443,#f5b700)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 800,
                  fontSize: "20px",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                {listing.category}
              </div>

              <div className="p-5">
                <p className="text-sm muted">
                  {listing.category}
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  {listing.title}
                </h3>

                <p className="mt-3 text-2xl font-black text-green-800">
                  {listing.price}
                </p>

                <p className="mt-2 muted">
                  📍 {listing.location}
                </p>

                <button
                  className="btn btn-primary mt-5 w-full"
                  type="button"
                >
                  View Listing
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SELLER CTA */}
      <section className="container pb-16">
        <div className="card p-8 md:p-12">
          <h2 className="text-3xl font-black">
            Have something to sell?
          </h2>

          <p className="muted mt-3 text-lg">
            Reach buyers across Ghana by posting your product or service
            on ALL PROMINENT GHANA.
          </p>

          <Link
            href="/post"
            className="btn btn-gold mt-6"
          >
            Post Your Ad
          </Link>
        </div>
      </section>
    </main>
  );
}
