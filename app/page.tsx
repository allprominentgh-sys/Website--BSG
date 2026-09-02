"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../components/Header";

type Listing = {
  id: number;
  title: string;
  description: string;
  price: number;
  currency_code: string;
  location: string;
  featured: boolean;
};

const listings: Listing[] = [
  {
    id: 1,
    title: "iPhone 15 Pro",
    description: "Excellent condition smartphone.",
    price: 12500,
    currency_code: "GHS",
    location: "Accra",
    featured: true,
  },
  {
    id: 2,
    title: "Toyota Corolla",
    description: "Reliable vehicle for sale.",
    price: 185000,
    currency_code: "GHS",
    location: "Kumasi",
    featured: true,
  },
  {
    id: 3,
    title: "Modern House",
    description: "Beautiful property available.",
    price: 850000,
    currency_code: "GHS",
    location: "East Legon",
    featured: false,
  },
  {
    id: 4,
    title: "Laptop Computer",
    description: "Good laptop for business and school.",
    price: 8500,
    currency_code: "GHS",
    location: "Tema",
    featured: false,
  },
];

const categories = [
  "Phones & Tablets",
  "Cars",
  "Property",
  "Fashion",
  "Electronics",
  "Jobs & Services",
  "Home & Garden",
  "Agriculture",
];

export default function Home() {
  const [search, setSearch] = useState("");

  const filteredListings = listings.filter((item) => {
    const text =
      `${item.title} ${item.description} ${item.location}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <>
      <Header />

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="container">
            <h1>ALL PROMINENT GHANA</h1>

            <p>Buy • Sell • Advertise • Connect</p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <Link href="/listings" className="btn btn-white">
                Browse Marketplace
              </Link>

              <Link href="/ads" className="btn btn-sky">
                Post an Ad
              </Link>
            </div>
          </div>
        </section>

        {/* MARKETPLACE */}
        <section className="marketplace">
          <div className="container">
            <h2>Ghana Marketplace</h2>

            <p className="marketplace-intro">
              Find products, services, property, vehicles, jobs and more
              from sellers across Ghana.
            </p>

            {/* SEARCH */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "35px",
                maxWidth: "750px",
              }}
            >
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, cars, property, jobs..."
                className="form-input"
                aria-label="Search marketplace"
              />

              <Link href="/listings" className="btn btn-primary">
                Search
              </Link>
            </div>

            {/* CATEGORIES */}
            <div className="category-grid">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/listings?category=${encodeURIComponent(category)}`}
                  className="category-card"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED LISTINGS */}
        <section
          style={{
            padding: "20px 0 70px",
          }}
        >
          <div className="container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                marginBottom: "25px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "32px",
                    fontWeight: 900,
                  }}
                >
                  Featured Listings
                </h2>

                <p
                  style={{
                    color: "#64748b",
                    marginTop: "8px",
                  }}
                >
                  Discover what sellers across Ghana are offering.
                </p>
              </div>

              <Link href="/listings" className="btn btn-primary">
                View All
              </Link>
            </div>

            <div className="listings-grid">
              {filteredListings.map((item) => (
                <article key={item.id} className="listing-card">
                  <div
                    className="listing-image"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "linear-gradient(135deg, #dbeafe, #e0f2fe)",
                      color: "#1557c0",
                      fontSize: "40px",
                      fontWeight: 900,
                    }}
                  >
                    {item.title.charAt(0)}
                  </div>

                  <div className="listing-content">
                    {item.featured && (
                      <span className="badge badge-sky">
                        FEATURED
                      </span>
                    )}

                    <h3
                      className="listing-title"
                      style={{
                        marginTop: "12px",
                      }}
                    >
                      {item.title}
                    </h3>

                    <p
                      style={{
                        color: "#64748b",
                        lineHeight: 1.5,
                      }}
                    >
                      {item.description}
                    </p>

                    <div className="listing-price">
                      {item.currency_code}{" "}
                      {item.price.toLocaleString()}
                    </div>

                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "14px",
                        marginBottom: 0,
                      }}
                    >
                      📍 {item.location}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {filteredListings.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px 20px",
                  color: "#64748b",
                }}
              >
                No listings found.
              </div>
            )}
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section
          style={{
            padding: "20px 0 70px",
          }}
        >
          <div className="container">
            <div
              style={{
                background:
                  "linear-gradient(135deg, #0d3f91, #1557c0, #38bdf8)",
                color: "white",
                borderRadius: "20px",
                padding: "45px 30px",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "32px",
                  margin: "0 0 12px",
                  fontWeight: 900,
                }}
              >
                Have something to sell?
              </h2>

              <p
                style={{
                  margin: "0 auto 25px",
                  maxWidth: "600px",
                  color: "#e0f2fe",
                  lineHeight: 1.6,
                }}
              >
                Reach buyers across Ghana by posting your product,
                service, property or vehicle.
              </p>

              <Link href="/ads" className="btn btn-white">
                Post Your Advertisement
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-title">
            ALL PROMINENT GHANA
          </div>

          <p>Buy • Sell • Advertise • Connect</p>

          <p
            style={{
              marginTop: "25px",
              fontSize: "14px",
            }}
          >
            © {new Date().getFullYear()} All Prominent Ghana. All rights
            reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
