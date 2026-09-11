"use client";

import Link from "next/link";

const categories = [
  { name: "Phones & Tablets", icon: "📱" },
  { name: "Cars & Vehicles", icon: "🚗" },
  { name: "Property", icon: "🏠" },
  { name: "Electronics", icon: "💻" },
  { name: "Fashion", icon: "👕" },
  { name: "Jobs & Services", icon: "🛠️" },
  { name: "Agriculture", icon: "🌾" },
  { name: "Business", icon: "🏢" },
];

const featured = [
  {
    id: 1,
    title: "iPhone 15 Pro",
    price: "GH₵ 12,500",
    location: "Accra, Ghana",
    icon: "📱",
  },
  {
    id: 2,
    title: "Toyota Corolla",
    price: "GH₵ 185,000",
    location: "Kumasi, Ghana",
    icon: "🚗",
  },
  {
    id: 3,
    title: "Modern 3 Bedroom House",
    price: "GH₵ 950,000",
    location: "East Legon, Accra",
    icon: "🏠",
  },
  {
    id: 4,
    title: "Business Laptop",
    price: "GH₵ 8,500",
    location: "Tema, Ghana",
    icon: "💻",
  },
];

export default function HomePage() {
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

      {/* HERO */}
      <section className="hero">
        <div className="container hero-content">

          <div className="hero-text">
            <div className="eyebrow">
              🇬🇭 GHANA'S MARKETPLACE
            </div>

            <h1>
              Buy.
              <br />
              Sell.
              <br />
              Connect.
            </h1>

            <p>
              Discover products, vehicles, property, services and
              opportunities from sellers and businesses across Ghana.
            </p>
          </div>

          {/* SEARCH */}
          <div className="search-box">

            <input
              type="search"
              placeholder="What are you looking for?"
            />

            <select defaultValue="Ghana">
              <option value="Ghana">All Ghana</option>
              <option value="Accra">Accra</option>
              <option value="Kumasi">Kumasi</option>
              <option value="Tema">Tema</option>
              <option value="Takoradi">Takoradi</option>
            </select>

            <button type="button">
              Search
            </button>

          </div>

          {/* HERO BUTTONS */}
          <div className="hero-actions">
            <Link href="/listings" className="primary-button">
              Explore Marketplace →
            </Link>

            <Link href="/post-ad" className="secondary-button">
              + Sell an Item
            </Link>
          </div>

        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories-section">
        <div className="container">

          <div className="section-heading">
            <div>
              <span>EXPLORE</span>
              <h2>Shop by Category</h2>
            </div>

            <Link href="/listings">
              View all →
            </Link>
          </div>

          <div className="category-grid">

            {categories.map((category) => (
              <Link
                href={`/listings?category=${encodeURIComponent(
                  category.name
                )}`}
                className="category-card"
                key={category.name}
              >
                <div className="category-icon">
                  {category.icon}
                </div>

                <h3>{category.name}</h3>

                <span className="category-link">
                  Explore →
                </span>
              </Link>
            ))}

          </div>

        </div>
      </section>

      {/* FEATURED MARKETPLACE */}
      <section className="featured-section">
        <div className="container">

          <div className="section-heading">
            <div>
              <span>MARKETPLACE</span>
              <h2>Featured Listings</h2>
            </div>

            <Link href="/listings">
              See all →
            </Link>
          </div>

          <div className="listing-grid">

            {featured.map((item) => (
              <Link
                href={`/listings/${item.id}`}
                className="listing-card"
                key={item.id}
              >

                <div className="listing-image">
                  {item.icon}
                </div>

                <div className="listing-info">

                  <h3>{item.title}</h3>

                  <strong>{item.price}</strong>

                  <p>📍 {item.location}</p>

                  <span className="verified">
                    ✓ Verified seller
                  </span>

                </div>

              </Link>
            ))}

          </div>

        </div>
      </section>

      {/* SELL / BUSINESS SECTION */}
      <section className="business-section">
        <div className="container business-box">

          <div>
            <span className="eyebrow dark">
              FOR SELLERS & BUSINESSES
            </span>

            <h2>
              Put your products and brand
              <br />
              in front of Ghana.
            </h2>

            <p>
              Sell products, advertise your company, promote your
              services and reach customers across Ghana.
            </p>
          </div>

          <div className="business-actions">
            <Link href="/post-ad" className="primary-button">
              Start Selling
            </Link>

            <Link href="/post-ad" className="outline-button">
              Advertise Your Business
            </Link>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-inner">

          <div>
            <strong>ALL PROMINENT GHANA</strong>
            <p>Buy • Sell • Advertise • Connect</p>
          </div>

          <div className="footer-links">
            <Link href="/listings">Marketplace</Link>
            <Link href="/post-ad">Sell an Item</Link>
            <Link href="/account">My Account</Link>
          </div>

        </div>
      </footer>

    </main>
  );
}
