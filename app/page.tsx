"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { categories, listings, formatPrice } from "../data";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const filteredListings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listings.filter((listing) => {
      const matchesSearch = !q || [
        listing.title, listing.description, listing.category,
        listing.subcategory, listing.location, listing.seller,
      ].some((value) => value.toLowerCase().includes(q));
      const matchesCategory =
        selectedCategory === "All" ||
        listing.category === selectedCategory ||
        listing.subcategory === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const featured = filteredListings.filter((item) => item.featured);
  const visibleListings = (featured.length ? featured : filteredListings).slice(0, 4);

  return (
    <>
      <Header />
      <main className="home-page">
        <section className="home-hero">
          <div className="container home-hero-inner">
            <div className="hero-copy">
              <span className="hero-kicker">GHANA'S MARKETPLACE</span>
              <h1>Buy. Sell. Advertise. Connect.</h1>
              <p>Discover products, vehicles, property, equipment, jobs and services from sellers across Ghana.</p>

              <div className="hero-search">
                <span aria-hidden="true">⌕</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="What are you looking for?"
                  aria-label="Search marketplace"
                />
                <button type="button" onClick={() => document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" })}>Search</button>
              </div>

              <div className="hero-actions">
                <Link href="/listings" className="button-primary">Browse Marketplace</Link>
                <Link href="/post-ad" className="button-secondary">+ Sell an Item</Link>
              </div>
            </div>

            <div className="hero-panel">
              <div className="hero-panel-badge">ALL PROMINENT GHANA</div>
              <h2>Everything in one place.</h2>
              <p>From everyday products to industrial machinery and business services.</p>
              <div className="hero-stats">
                <div><strong>{categories.length}+</strong><span>Categories</span></div>
                <div><strong>24/7</strong><span>Marketplace</span></div>
                <div><strong>Ghana</strong><span>Wide</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="category-section">
          <div className="container">
            <div className="section-heading">
              <div><span className="section-kicker">EXPLORE</span><h2>Popular Categories</h2></div>
              <Link href="/listings">View all →</Link>
            </div>

            <div className="category-grid">
              {categories.slice(0, 8).map((category) => (
                <button
                  key={category.name}
                  type="button"
                  className={`category-card ${selectedCategory === category.name ? "active" : ""}`}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setOpenCategory(openCategory === category.name ? null : category.name);
                    document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <span className="category-icon">{category.name === "Industrial Machinery" ? "⚙️" : category.name === "Printing Equipment" ? "🖨️" : category.name === "Construction Equipment" ? "🏗️" : category.name === "Vehicles & Transportation" ? "🚚" : category.name === "Electrical & Electronics" ? "⚡" : category.name === "Agriculture & Food" ? "🌾" : category.name === "Tools & Hardware" ? "🛠️" : "🏠"}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

            {openCategory && (
              <div className="subcategory-panel">
                <div className="subcategory-title">{openCategory}</div>
                <div className="subcategory-list">
                  {categories.find((item) => item.name === openCategory)?.subcategories.map((subcategory) => (
                    <button key={subcategory} type="button" onClick={() => setSelectedCategory(subcategory)} className={selectedCategory === subcategory ? "selected" : ""}>
                      {subcategory}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="marketplace" className="marketplace-home-section">
          <div className="container">
            <div className="section-heading">
              <div><span className="section-kicker">MARKETPLACE</span><h2>Featured Listings</h2></div>
              <Link href="/listings">See all listings →</Link>
            </div>

            <div className="listing-grid home-listing-grid">
              {visibleListings.map((listing) => (
                <article className="listing-card" key={listing.id}>
                  <Link href={`/listings/${listing.id}`} className="listing-image-link">
                    <div className="listing-image">
                      <img src={listing.image} alt={listing.title} />
                      {listing.featured && <span className="featured">FEATURED</span>}
                    </div>
                  </Link>
                  <div className="card-content">
                    <span className="listing-category">{listing.category}</span>
                    <h3>{listing.title}</h3>
                    <p className="listing-location">📍 {listing.location}</p>
                    <div className="listing-bottom">
                      <strong>{formatPrice(listing.price, listing.currency)}</strong>
                      <Link href={`/listings/${listing.id}`}>View</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sell-cta">
          <div className="container sell-cta-inner">
            <div><span className="section-kicker">SELL ON ALL PROMINENT GHANA</span><h2>Have something to sell?</h2><p>Reach buyers across Ghana with your product, property, vehicle, equipment, job or service.</p></div>
            <Link href="/post-ad" className="button-primary">+ Post an Ad</Link>
          </div>
        </section>
      </main>
    </>
  );
}
