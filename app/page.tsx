"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Listing = {
  id: number;
  title: string;
  price: string;
  location: string;
  category: string;
  seller: string;
  image: string;
  verified?: boolean;
  featured?: boolean;
};

const listings: Listing[] = [
  {
    id: 1,
    title: "iPhone 15 Pro Max",
    price: "GH₵ 14,500",
    location: "Accra",
    category: "Phones & Tablets",
    seller: "Prominent Store",
    image: "📱",
    verified: true,
    featured: true,
  },
  {
    id: 2,
    title: "Toyota Corolla 2020",
    price: "GH₵ 185,000",
    location: "Kumasi",
    category: "Cars & Vehicles",
    seller: "Ghana Auto Hub",
    image: "🚗",
    verified: true,
  },
  {
    id: 3,
    title: "Modern 3 Bedroom House",
    price: "GH₵ 850,000",
    location: "East Legon",
    category: "Property",
    seller: "Prime Properties",
    image: "🏠",
    verified: true,
    featured: true,
  },
  {
    id: 4,
    title: "HP Laptop Core i7",
    price: "GH₵ 8,500",
    location: "Accra",
    category: "Electronics",
    seller: "Tech World GH",
    image: "💻",
    verified: true,
  },
  {
    id: 5,
    title: "Men's Premium Shirt",
    price: "GH₵ 350",
    location: "Tema",
    category: "Fashion",
    seller: "Fashion House",
    image: "👕",
  },
  {
    id: 6,
    title: "Professional Plumbing Service",
    price: "From GH₵ 250",
    location: "Accra",
    category: "Jobs & Services",
    seller: "Pro Services GH",
    image: "🛠️",
    verified: true,
  },
  {
    id: 7,
    title: "Samsung Galaxy S24 Ultra",
    price: "GH₵ 13,800",
    location: "Accra",
    category: "Phones & Tablets",
    seller: "Mobile Centre",
    image: "📱",
    verified: true,
  },
  {
    id: 8,
    title: "Commercial Shop Space",
    price: "GH₵ 4,500 / month",
    location: "Spintex",
    category: "Property",
    seller: "City Properties",
    image: "🏢",
    verified: true,
  },
];

const categories = [
  "All Categories",
  "Phones & Tablets",
  "Cars & Vehicles",
  "Property",
  "Electronics",
  "Fashion",
  "Jobs & Services",
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Ghana");
  const [sort, setSort] = useState("Featured");

  const filteredListings = useMemo(() => {
    let result = listings.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All Categories" || item.category === category;

      const matchesLocation =
        location === "All Ghana" || item.location === location;

      return matchesSearch && matchesCategory && matchesLocation;
    });

    if (sort === "Featured") {
      result = [...result].sort(
        (a, b) => Number(b.featured) - Number(a.featured)
      );
    }

    return result;
  }, [search, category, location, sort]);

  return (
    <main className="marketplace-page">

      {/* HEADER */}
      <header className="marketplace-header">
        <div className="marketplace-header-inner">

          <Link href="/" className="brand">
            <strong>ALL PROMINENT GHANA</strong>
            <span>Buy • Sell • Advertise • Connect</span>
          </Link>

          <nav className="desktop-nav">
            <Link href="/">Home</Link>
            <Link href="/listings">Marketplace</Link>
            <Link href="/post-ad">Sell an Item</Link>
            <Link href="/account">Sign In</Link>
          </nav>

        </div>
      </header>

      {/* HERO / SEARCH */}
      <section className="marketplace-hero">

        <div className="marketplace-hero-inner">

          <div>
            <p className="eyebrow">ALL PROMINENT MARKETPLACE</p>

            <h1>
              Find what you need.
              <br />
              Sell what you have.
            </h1>

            <p className="hero-description">
              Discover products, vehicles, property, services and
              opportunities from sellers across Ghana.
            </p>
          </div>

          <div className="marketplace-search">

            <div className="search-input-wrap">
              <span>⌕</span>

              <input
                type="search"
                placeholder="What are you looking for?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option>All Ghana</option>
              <option>Accra</option>
              <option>Kumasi</option>
              <option>Tema</option>
              <option>East Legon</option>
              <option>Spintex</option>
            </select>

            <button type="button">
              Search
            </button>

          </div>

        </div>

      </section>

      {/* MAIN CONTENT */}
      <section className="marketplace-content">

        <div className="marketplace-layout">

          {/* FILTERS */}
          <aside className="marketplace-filters">

            <div className="filter-heading">
              <h2>Filter</h2>

              {(search || category !== "All Categories") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All Categories");
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            <label>
              Search
              <input
                type="text"
                placeholder="Search marketplace"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <label>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Location
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option>All Ghana</option>
                <option>Accra</option>
                <option>Kumasi</option>
                <option>Tema</option>
                <option>East Legon</option>
                <option>Spintex</option>
              </select>
            </label>

            <Link href="/post-ad" className="sell-button">
              + Sell an Item
            </Link>

          </aside>

          {/* PRODUCTS */}
          <div className="marketplace-results">

            <div className="results-top">

              <div>
                <p className="eyebrow">MARKETPLACE</p>

                <h2>
                  {search
                    ? `Results for "${search}"`
                    : "Latest Listings"}
                </h2>

                <p>
                  {filteredListings.length} listings available
                </p>
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option>Featured</option>
                <option>Newest</option>
              </select>

            </div>

            {/* FEATURED */}
            {!search && category === "All Categories" && (
              <div className="featured-banner">

                <div>
                  <span>⭐ TOP ADS</span>

                  <h3>
                    Give your business more visibility
                  </h3>

                  <p>
                    Promote your products and services to more
                    customers across Ghana.
                  </p>
                </div>

                <Link href="/post-ad">
                  Advertise Now →
                </Link>

              </div>
            )}

            {/* LISTING GRID */}
            {filteredListings.length > 0 ? (

              <div className="listing-grid">

                {filteredListings.map((item) => (

                  <Link
                    href={`/listings/${item.id}`}
                    className="listing-card"
                    key={item.id}
                  >

                    <div className="listing-image">

                      {item.featured && (
                        <span className="featured-badge">
                          TOP AD
                        </span>
                      )}

                      <span className="product-emoji">
                        {item.image}
                      </span>

                    </div>

                    <div className="listing-info">

                      <p className="listing-category">
                        {item.category}
                      </p>

                      <h3>{item.title}</h3>

                      <strong className="listing-price">
                        {item.price}
                      </strong>

                      <p className="listing-location">
                        📍 {item.location}
                      </p>

                      <div className="seller-row">

                        <span>
                          {item.seller}
                        </span>

                        {item.verified && (
                          <span className="verified">
                            ✓ Verified
                          </span>
                        )}

                      </div>

                    </div>

                  </Link>

                ))}

              </div>

            ) : (

              <div className="no-results">

                <div>🔎</div>

                <h3>No listings found</h3>

                <p>
                  Try another search, category or location.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All Categories");
                    setLocation("All Ghana");
                  }}
                >
                  View all listings
                </button>

              </div>

            )}

          </div>

        </div>

      </section>

      {/* CALL TO ACTION */}
      <section className="marketplace-cta">

        <div>

          <p className="eyebrow">
            SELL ON ALL PROMINENT GHANA
          </p>

          <h2>
            Have something to sell?
          </h2>

          <p>
            List your product, vehicle, property, service or
            business opportunity and reach customers across Ghana.
          </p>

          <Link href="/post-ad">
            + Post an Ad
          </Link>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="marketplace-footer">

        <div>
          <strong>ALL PROMINENT GHANA</strong>
          <p>Buy • Sell • Advertise • Connect</p>
        </div>

        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/listings">Marketplace</Link>
          <Link href="/account">My Account</Link>
          <Link href="/post-ad">Sell an Item</Link>
        </div>

        <p>
          © {new Date().getFullYear()} All Prominent Ghana.
        </p>

      </footer>

    </main>
  );
}
