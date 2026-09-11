"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Listing = {
  id: number;
  title: string;
  description: string;
  price: number;
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
    title: "iPhone 15 Pro",
    description: "Clean and gently used iPhone 15 Pro.",
    price: 12500,
    location: "Accra, Ghana",
    category: "Phones & Tablets",
    seller: "All Prominent Seller",
    image: "📱",
    verified: true,
    featured: true,
  },
  {
    id: 2,
    title: "Toyota Corolla",
    description: "Reliable Toyota Corolla in good condition.",
    price: 185000,
    location: "Kumasi, Ghana",
    category: "Cars & Vehicles",
    seller: "Ghana Auto Hub",
    image: "🚗",
    verified: true,
    featured: true,
  },
  {
    id: 3,
    title: "3 Bedroom House",
    description: "Modern 3 bedroom property available for sale.",
    price: 950000,
    location: "East Legon, Accra",
    category: "Property",
    seller: "Prime Properties GH",
    image: "🏠",
    verified: true,
  },
  {
    id: 4,
    title: "Business Laptop",
    description: "High-performance laptop for business and school.",
    price: 8500,
    location: "Tema, Ghana",
    category: "Electronics",
    seller: "Tech World Ghana",
    image: "💻",
    verified: true,
  },
  {
    id: 5,
    title: "Men's Fashion Collection",
    description: "Quality shirts, trousers and accessories.",
    price: 450,
    location: "Accra, Ghana",
    category: "Fashion",
    seller: "Prominent Fashion",
    image: "👕",
    verified: true,
  },
  {
    id: 6,
    title: "Agricultural Equipment",
    description: "Farm equipment available for businesses and farmers.",
    price: 18500,
    location: "Tamale, Ghana",
    category: "Agriculture",
    seller: "Agri Solutions GH",
    image: "🌾",
    verified: true,
  },
  {
    id: 7,
    title: "Professional Plumbing Service",
    description: "Professional plumbing services across Accra.",
    price: 300,
    location: "Accra, Ghana",
    category: "Jobs & Services",
    seller: "Pro Services GH",
    image: "🛠️",
    verified: true,
  },
  {
    id: 8,
    title: "Office Space",
    description: "Modern commercial office space available.",
    price: 6500,
    location: "Airport, Accra",
    category: "Business",
    seller: "Business Properties GH",
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
  "Agriculture",
  "Business",
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Ghana");

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All Categories" ||
        item.category === category;

      const matchesLocation =
        location === "All Ghana" ||
        item.location.toLowerCase().includes(location.toLowerCase());

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [search, category, location]);

  return (
    <main className="site">

      {/* HEADER */}
      <header className="header">
        <div className="container header-inner">

          <Link href="/" className="logo">
            ALL PROMINENT GHANA
            <span>Buy • Sell • Advertise • Connect</span>
          </Link>

          <nav className="desktop-nav">
            <Link href="/">Home</Link>
            <Link href="/listings">Marketplace</Link>
            <Link href="/post-ad">Sell</Link>
            <Link href="/account">My Account</Link>
          </nav>

          <Link href="/account" className="signin">
            Sign In
          </Link>

        </div>
      </header>

      {/* MARKETPLACE HERO */}
      <section className="marketplace-hero">
        <div className="container">

          <div className="marketplace-heading">
            <span>ALL PROMINENT MARKETPLACE</span>

            <h1>
              Find what you need.
              <br />
              Sell what you have.
            </h1>

            <p>
              Shop products, vehicles, property, services and business
              opportunities from sellers across Ghana.
            </p>
          </div>

          {/* SEARCH */}
          <div className="marketplace-search">

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, cars, property, services..."
            />

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option>All Ghana</option>
              <option>Accra</option>
              <option>Kumasi</option>
              <option>Tema</option>
              <option>Tamale</option>
            </select>

            <button type="button">
              Search
            </button>

          </div>

        </div>
      </section>

      {/* MARKETPLACE BODY */}
      <section className="marketplace-section">
        <div className="container marketplace-layout">

          {/* SIDEBAR */}
          <aside className="marketplace-sidebar">

            <div className="filter-box">

              <h3>Categories</h3>

              <div className="category-filter">

                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      category === item
                        ? "active-filter"
                        : ""
                    }
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}

              </div>

            </div>

            <Link
              href="/post-ad"
              className="sell-box"
            >
              <span>SELL ON ALL PROMINENT</span>
              <strong>+ Post an Ad</strong>
              <p>
                Reach customers across Ghana.
              </p>
            </Link>

          </aside>

          {/* PRODUCTS */}
          <div className="marketplace-results">

            <div className="results-header">

              <div>
                <span>MARKETPLACE</span>
                <h2>
                  {category === "All Categories"
                    ? "All Listings"
                    : category}
                </h2>
              </div>

              <div className="results-count">
                {filteredListings.length} listings
              </div>

            </div>

            {filteredListings.length === 0 ? (

              <div className="empty-results">
                <div>🔎</div>

                <h3>
                  No listings found
                </h3>

                <p>
                  Try another search or category.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All Categories");
                    setLocation("All Ghana");
                  }}
                >
                  Clear filters
                </button>
              </div>

            ) : (

              <div className="marketplace-grid">

                {filteredListings.map((item) => (

                  <Link
                    href={`/listings/${item.id}`}
                    className="marketplace-card"
                    key={item.id}
                  >

                    <div className="marketplace-image">

                      {item.featured && (
                        <span className="featured-badge">
                          TOP AD
                        </span>
                      )}

                      <span>
                        {item.image}
                      </span>

                    </div>

                    <div className="marketplace-card-body">

                      <div className="card-category">
                        {item.category}
                      </div>

                      <h3>
                        {item.title}
                      </h3>

                      <strong className="card-price">
                        GH₵{" "}
                        {item.price.toLocaleString()}
                      </strong>

                      <p className="card-description">
                        {item.description}
                      </p>

                      <div className="card-location">
                        📍 {item.location}
                      </div>

                      <div className="card-seller">

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

            )}

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-inner">

          <div>
            <strong>ALL PROMINENT GHANA</strong>
            <p>
              Buy • Sell • Advertise • Connect
            </p>
          </div>

          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/listings">Marketplace</Link>
            <Link href="/post-ad">Sell an Item</Link>
            <Link href="/account">My Account</Link>
          </div>

        </div>
      </footer>

    </main>
  );
}
