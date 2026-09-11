"use client";

import { useState } from "react";
import Link from "next/link";

type Listing = {
  id: number;
  title: string;
  price: string;
  location: string;
  category: string;
  image: string;
  seller: string;
  verified?: boolean;
};

const categories = [
  { name: "Phones & Tablets", icon: "📱" },
  { name: "Cars & Vehicles", icon: "🚗" },
  { name: "Property", icon: "🏠" },
  { name: "Electronics", icon: "💻" },
  { name: "Fashion", icon: "👕" },
  { name: "Jobs & Services", icon: "🛠️" },
  { name: "Home & Garden", icon: "🛋️" },
  { name: "Agriculture", icon: "🌾" },
];

const listings: Listing[] = [
  {
    id: 1,
    title: "iPhone 15 Pro",
    price: "GH₵12,500",
    location: "Accra, Ghana",
    category: "Phones & Tablets",
    image:
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=900&q=80",
    seller: "All Prominent Seller",
    verified: true,
  },
  {
    id: 2,
    title: "Toyota Camry",
    price: "GH₵185,000",
    location: "Kumasi, Ghana",
    category: "Cars & Vehicles",
    image:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80",
    seller: "Ghana Auto Seller",
    verified: true,
  },
  {
    id: 3,
    title: "Modern 3 Bedroom House",
    price: "GH₵1,250,000",
    location: "East Legon, Accra",
    category: "Property",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    seller: "Prominent Properties",
    verified: true,
  },
  {
    id: 4,
    title: "MacBook Pro M3",
    price: "GH₵32,000",
    location: "Accra, Ghana",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    seller: "Tech World Ghana",
    verified: true,
  },
];

export default function HomePage() {
  const [search, setSearch] = useState("");

  const filteredListings = listings.filter((item) => {
    const text = `${item.title} ${item.category} ${item.location}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <main className="marketplace-home">
      {/* TOP HEADER */}
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand">
            <span className="brand-main">ALL PROMINENT GHANA</span>
            <span className="brand-sub">
              Buy • Sell • Advertise • Connect
            </span>
          </Link>

          <nav className="desktop-nav">
            <Link href="/">Home</Link>
            <Link href="/listings">Marketplace</Link>
            <Link href="/post-ad">Post an Ad</Link>
            <Link href="/account">My Account</Link>
          </nav>

          <Link href="/account" className="account-button">
            Sign In
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            🇬🇭 Ghana&apos;s Marketplace
          </div>

          <h1>
            Buy. Sell.
            <br />
            <span>Connect.</span>
          </h1>

          <p>
            Discover products, vehicles, property, services and opportunities
            from trusted sellers across Ghana.
          </p>

          {/* SEARCH BAR */}
          <div className="search-box">
            <span className="search-icon">⌕</span>

            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select>
              <option>All Ghana</option>
              <option>Accra</option>
              <option>Kumasi</option>
              <option>Tema</option>
              <option>Takoradi</option>
              <option>Cape Coast</option>
            </select>

            <button>Search</button>
          </div>

          <div className="hero-actions">
            <Link href="/listings" className="primary-button">
              Explore Marketplace
            </Link>

            <Link href="/post-ad" className="secondary-button">
              + Sell an Item
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-label">EXPLORE</span>
            <h2>Shop by Category</h2>
          </div>

          <Link href="/listings" className="view-link">
            View all →
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              href={`/listings?category=${encodeURIComponent(category.name)}`}
              key={category.name}
              className="category-card"
            >
              <div className="category-icon">{category.icon}</div>
              <span>{category.name}</span>
              <small>Explore →</small>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED ADS */}
      <section className="section featured-section">
        <div className="section-heading">
          <div>
            <span className="section-label">FEATURED</span>
            <h2>Top Listings</h2>
          </div>

          <Link href="/listings" className="view-link">
            See marketplace →
          </Link>
        </div>

        {search && (
          <p className="search-result">
            Showing results for: <strong>{search}</strong>
          </p>
        )}

        <div className="listing-grid">
          {filteredListings.map((item) => (
            <Link
              href={`/listings/${item.id}`}
              className="listing-card"
              key={item.id}
            >
              <div className="listing-image">
                <img src={item.image} alt={item.title} />

                <span className="featured-badge">FEATURED</span>

                {item.verified && (
                  <span className="verified-badge">✓ Verified</span>
                )}
              </div>

              <div className="listing-content">
                <span className="listing-category">
                  {item.category}
                </span>

                <h3>{item.title}</h3>

                <strong className="listing-price">
                  {item.price}
                </strong>

                <div className="listing-location">
                  📍 {item.location}
                </div>

                <div className="seller">
                  <span className="seller-avatar">AP</span>

                  <span>
                    {item.seller}
                    {item.verified && (
                      <small> ✓ Verified Seller</small>
                    )}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="empty-search">
            <div>🔎</div>
            <h3>No listings found</h3>
            <p>Try another search term.</p>
          </div>
        )}
      </section>

      {/* AI DESCRIPTION */}
      <section className="ai-section">
        <div className="ai-content">
          <div className="ai-icon">✦</div>

          <div>
            <span className="section-label">SMART MARKETPLACE</span>

            <h2>
              Create better ads with
              <span> AI</span>
            </h2>

            <p>
              Enter a few details about your product and our AI-assisted
              listing tool can help create a clear, professional description
              for your advertisement.
            </p>
          </div>

          <Link href="/post-ad" className="ai-button">
            Create an Ad →
          </Link>
        </div>
      </section>

      {/* SELL SECTION */}
      <section className="sell-section">
        <div>
          <span className="section-label">SELL ON ALL PROMINENT</span>

          <h2>
            Turn your products
            <br />
            into opportunities.
          </h2>

          <p>
            Sell products, property, vehicles, equipment, services and
            more to customers across Ghana.
          </p>

          <div className="sell-features">
            <span>✓ Easy listing</span>
            <span>✓ Verified sellers</span>
            <span>✓ Secure payments</span>
            <span>✓ Delivery tracking</span>
          </div>

          <Link href="/post-ad" className="primary-button">
            + Post an Ad
          </Link>
        </div>

        <div className="sell-card">
          <div className="sell-card-icon">📣</div>
          <h3>Grow your business</h3>
          <p>
            Promote your brand with featured ads and subscription options.
          </p>
          <Link href="/post-ad">Advertise your business →</Link>
        </div>
      </section>

      {/* TRUST / SERVICES */}
      <section className="services-section">
        <div className="service-card">
          <span>🛡️</span>
          <h3>Verified Sellers</h3>
          <p>Build trust with company and seller verification.</p>
        </div>

        <div className="service-card">
          <span>💳</span>
          <h3>Payments</h3>
          <p>Support convenient payment options for customers.</p>
        </div>

        <div className="service-card">
          <span>📍</span>
          <h3>Delivery & Tracking</h3>
          <p>Pin your location and track deliveries across Ghana.</p>
        </div>

        <div className="service-card">
          <span>📈</span>
          <h3>Business Growth</h3>
          <p>Advertise your products and reach more customers.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <h3>ALL PROMINENT GHANA</h3>
            <p>Buy • Sell • Advertise • Connect</p>
          </div>

          <div className="footer-links">
            <Link href="/listings">Marketplace</Link>
            <Link href="/post-ad">Sell</Link>
            <Link href="/account">My Account</Link>
            <Link href="/dashboard">Admin</Link>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 All Prominent Ghana. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
