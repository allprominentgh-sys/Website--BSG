"use client";

import { useState } from "react";
import Link from "next/link";

const listings = [
  {
    id: "iphone-15-pro-max",
    category: "Phones & Tablets",
    title: "iPhone 15 Pro Max",
    price: "GH₵ 14,500",
    location: "Accra",
    seller: "Prominent Store",
    icon: "📱",
    verified: true,
  },
  {
    id: "toyota-corolla-2020",
    category: "Cars & Vehicles",
    title: "Toyota Corolla 2020",
    price: "GH₵ 185,000",
    location: "Kumasi",
    seller: "Ghana Auto Hub",
    icon: "🚗",
    verified: true,
  },
  {
    id: "modern-3-bedroom-house",
    category: "Property",
    title: "Modern 3 Bedroom House",
    price: "GH₵ 850,000",
    location: "East Legon",
    seller: "Prominent Properties",
    icon: "🏠",
    verified: true,
  },
  {
    id: "hp-laptop-core-i7",
    category: "Electronics",
    title: "HP Laptop Core i7",
    price: "GH₵ 8,500",
    location: "Accra",
    seller: "Tech World Ghana",
    icon: "💻",
    verified: true,
  },
  {
    id: "office-chair",
    category: "Furniture",
    title: "Executive Office Chair",
    price: "GH₵ 2,200",
    location: "Accra",
    seller: "Office Solutions",
    icon: "🪑",
    verified: true,
  },
  {
    id: "printing-machine",
    category: "Business Equipment",
    title: "DTF Printing Machine",
    price: "GH₵ 65,000",
    location: "Tema",
    seller: "Prominent Printing",
    icon: "🖨️",
    verified: true,
  },
  {
    id: "warehouse-space",
    category: "Property",
    title: "Warehouse for Lease",
    price: "GH₵ 12,000 / month",
    location: "Tema",
    seller: "APG Properties",
    icon: "🏭",
    verified: true,
  },
  {
    id: "iphone-13",
    category: "Phones & Tablets",
    title: "iPhone 13",
    price: "GH₵ 7,500",
    location: "Accra",
    seller: "Mobile Hub",
    icon: "📱",
    verified: true,
  },
];

export default function ListingsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Ghana");

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All Categories" || item.category === category;

    const matchesLocation =
      location === "All Ghana" || item.location === location;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <main className="marketplace-page">
      {/* HEADER */}
      <header className="header">
        <div className="container header-inner">
          <Link href="/" className="logo">
            ALL PROMINENT GHANA
            <span>Marketplace • Buy • Sell • Advertise</span>
          </Link>

          <nav className="desktop-nav">
            <Link href="/">Home</Link>
            <Link href="/listings">Marketplace</Link>
            <Link href="/sell">Sell an Item</Link>
            <Link href="/account" className="signin">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* PAGE HERO */}
      <section className="listings-hero">
        <div className="container">
          <div className="eyebrow">ALL PROMINENT MARKETPLACE</div>

          <h1>Find what you need.</h1>

          <p>
            Discover products, vehicles, property, services and opportunities
            from sellers across Ghana.
          </p>

          <div className="listing-search">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>All Categories</option>
              <option>Phones & Tablets</option>
              <option>Cars & Vehicles</option>
              <option>Property</option>
              <option>Electronics</option>
              <option>Furniture</option>
              <option>Business Equipment</option>
            </select>

            <button type="button">Search</button>
          </div>
        </div>
      </section>

      {/* FILTER */}
      <section className="filter-section">
        <div className="container">
          <div className="filter-heading">
            <div>
              <span>MARKETPLACE</span>
              <h2>Latest Listings</h2>
            </div>

            <strong>{filteredListings.length} listings available</strong>
          </div>

          <div className="filters">
            <input
              type="text"
              placeholder="Search marketplace"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>All Categories</option>
              <option>Phones & Tablets</option>
              <option>Cars & Vehicles</option>
              <option>Property</option>
              <option>Electronics</option>
              <option>Furniture</option>
              <option>Business Equipment</option>
            </select>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option>All Ghana</option>
              <option>Accra</option>
              <option>Kumasi</option>
              <option>Tema</option>
              <option>East Legon</option>
            </select>

            <Link href="/sell" className="sell-button">
              + Sell an Item
            </Link>
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section className="featured-section">
        <div className="container">
          <div className="listing-grid">
            {filteredListings.map((item) => (
              <Link
                href={`/listings/${item.id}`}
                className="listing-card"
                key={item.id}
              >
                <div className="listing-image">
                  <span className="top-ad">TOP AD</span>
                  <span className="listing-icon">{item.icon}</span>
                </div>

                <div className="listing-info">
                  <p className="category-name">{item.category}</p>

                  <h3>{item.title}</h3>

                  <strong>{item.price}</strong>

                  <p className="location">📍 {item.location}</p>

                  <p className="seller">{item.seller}</p>

                  {item.verified && (
                    <span className="verified">✓ Verified</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="no-results">
              <h3>No listings found</h3>
              <p>Try another search or category.</p>
            </div>
          )}
        </div>
      </section>

      {/* ADVERTISEMENT */}
      <section className="business-section">
        <div className="container">
          <div className="business-box">
            <div>
              <span className="eyebrow">⭐ TOP ADS</span>

              <h2>Give your business more visibility.</h2>

              <p>
                Promote your products and services to more customers across
                Ghana.
              </p>
            </div>

            <div className="business-actions">
              <Link href="/advertise" className="outline-button">
                Advertise Now →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
