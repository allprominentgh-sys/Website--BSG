"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";

type Listing = {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  category: string;
  seller: string;
  phone: string;
  image: string;
  featured: boolean;
};

const listings: Listing[] = [
  {
    id: 1,
    title: "iPhone 15 Pro",
    description: "Clean and gently used iPhone 15 Pro.",
    price: 12500,
    currency: "GHS",
    location: "Accra, Ghana",
    category: "Phones & Tablets",
    seller: "All Prominent Seller",
    phone: "+233240000000",
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc",
    featured: true,
  },
  {
    id: 2,
    title: "Toyota Camry",
    description: "Neat and well-maintained Toyota Camry.",
    price: 185000,
    currency: "GHS",
    location: "Kumasi, Ghana",
    category: "Cars",
    seller: "Ghana Auto Seller",
    phone: "+233240000001",
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027",
    featured: true,
  },
  {
    id: 3,
    title: "Modern House",
    description: "Beautiful property available for sale.",
    price: 850000,
    currency: "GHS",
    location: "East Legon, Accra",
    category: "Property",
    seller: "Prominent Properties",
    phone: "+233240000002",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    featured: false,
  },
  {
    id: 4,
    title: "Designer Fashion",
    description: "Quality fashion items at affordable prices.",
    price: 850,
    currency: "GHS",
    location: "Accra, Ghana",
    category: "Fashion",
    seller: "Prominent Fashion",
    phone: "+233240000003",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050",
    featured: false,
  },
];

export default function ListingsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    "Phones & Tablets",
    "Cars",
    "Property",
    "Fashion",
    "Jobs",
    "Services",
  ];

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(search.toLowerCase()) ||
      listing.description.toLowerCase().includes(search.toLowerCase()) ||
      listing.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || listing.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header />

      <main className="listings-page">
        <section className="listings-hero">
          <div className="container">
            <h1>Ghana Marketplace</h1>
            <p>
              Browse products, cars, property, fashion, jobs and services
              from sellers across Ghana.
            </p>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search products, cars, property, jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button type="button">Search</button>
            </div>
          </div>
        </section>

        <section className="container marketplace-section">
          <div className="marketplace-layout">
            <aside className="filters">
              <h2>Categories</h2>

              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={category === item ? "active" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </aside>

            <div className="results">
              <div className="results-header">
                <div>
                  <h2>Available Listings</h2>
                  <p>
                    {filteredListings.length} listing
                    {filteredListings.length !== 1 ? "s" : ""} found
                  </p>
                </div>

                <Link href="/post-ad" className="post-button">
                  + Post an Ad
                </Link>
              </div>

              {filteredListings.length === 0 ? (
                <div className="empty-state">
                  <h3>No listings found</h3>
                  <p>Try another search or category.</p>
                </div>
              ) : (
                <div className="listing-grid">
                  {filteredListings.map((listing) => (
                    <article className="listing-card" key={listing.id}>
                      <div className="listing-image">
                        <img
                          src={listing.image}
                          alt={listing.title}
                        />

                        {listing.featured && (
                          <span className="featured">FEATURED</span>
                        )}
                      </div>

                      <div className="listing-content">
                        <span className="category">
                          {listing.category}
                        </span>

                        <h3>{listing.title}</h3>

                        <p className="description">
                          {listing.description}
                        </p>

                        <div className="price">
                          {listing.currency}{" "}
                          {listing.price.toLocaleString()}
                        </div>

                        <p className="location">
                          📍 {listing.location}
                        </p>

                        <p className="seller">
                          Seller: {listing.seller}
                        </p>

                        <div className="card-actions">
                          <Link
                            href={`/listings/${listing.id}`}
                            className="view-button"
                          >
                            View Details
                          </Link>

                          <a
                            href={`tel:${listing.phone}`}
                            className="call-button"
                          >
                            Call Seller
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .listings-page {
          min-height: 100vh;
          background: #f6f8fb;
          color: #172033;
        }

        .container {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding-left: 20px;
          padding-right: 20px;
        }

        .listings-hero {
          background: linear-gradient(135deg, #075d37, #087443);
          color: white;
          padding: 65px 0;
        }

        .listings-hero h1 {
          margin: 0 0 12px;
          font-size: 46px;
          font-weight: 800;
        }

        .listings-hero p {
          margin: 0 0 30px;
          font-size: 20px;
          line-height: 1.6;
          max-width: 750px;
        }

        .search-box {
          display: flex;
          gap: 12px;
          max-width: 900px;
        }

        .search-box input {
          flex: 1;
          min-width: 0;
          padding: 18px 20px;
          border: none;
          border-radius: 12px;
          font-size: 17px;
          outline: none;
        }

        .search-box button {
          border: none;
          border-radius: 12px;
          padding: 0 30px;
          background: #f5b700;
          color: #172033;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
        }

        .marketplace-section {
          padding-top: 45px;
          padding-bottom: 70px;
        }

        .marketplace-layout {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 30px;
        }

        .filters {
          background: white;
          padding: 22px;
          border-radius: 16px;
          height: fit-content;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
        }

        .filters h2 {
          margin: 0 0 15px;
          font-size: 20px;
        }

        .filters button {
          display: block;
          width: 100%;
          padding: 12px 10px;
          margin-bottom: 7px;
          border: none;
          border-radius: 8px;
          background: transparent;
          text-align: left;
          cursor: pointer;
          font-size: 15px;
        }

        .filters button:hover,
        .filters button.active {
          background: #087443;
          color: white;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        .results-header h2 {
          margin: 0 0 5px;
          font-size: 30px;
        }

        .results-header p {
          margin: 0;
          color: #667085;
        }

        .post-button {
          background: #087443;
          color: white;
          text-decoration: none;
          padding: 13px 20px;
          border-radius: 10px;
          font-weight: 700;
        }

        .listing-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .listing-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.06);
        }

        .listing-image {
          position: relative;
          height: 220px;
          background: #e9edf2;
        }

        .listing-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .featured {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #f5b700;
          color: #172033;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 800;
        }

        .listing-content {
          padding: 20px;
        }

        .category {
          color: #087443;
          font-size: 13px;
          font-weight: 700;
        }

        .listing-content h3 {
          margin: 8px 0;
          font-size: 22px;
        }

        .description {
          color: #667085;
          min-height: 45px;
          line-height: 1.5;
        }

        .price {
          margin-top: 15px;
          font-size: 23px;
          font-weight: 800;
          color: #087443;
        }

        .location,
        .seller {
          color: #667085;
          font-size: 14px;
        }

        .card-actions {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }

        .view-button,
        .call-button {
          flex: 1;
          text-align: center;
          text-decoration: none;
          padding: 11px;
          border-radius: 9px;
          font-weight: 700;
        }

        .view-button {
          background: #087443;
          color: white;
        }

        .call-button {
          border: 1px solid #087443;
          color: #087443;
        }

        .empty-state {
          background: white;
          padding: 50px;
          border-radius: 16px;
          text-align: center;
        }

        @media (max-width: 800px) {
          .marketplace-layout {
            grid-template-columns: 1fr;
          }

          .listing-grid {
            grid-template-columns: 1fr;
          }

          .results-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .listings-hero h1 {
            font-size: 36px;
          }

          .search-box {
            flex-direction: column;
          }

          .search-box button {
            padding: 15px;
          }
        }
      `}</style>
    </>
  );
}
