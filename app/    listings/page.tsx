"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Listing = {
  id: string;
  title: string;
  category: string;
  price: string;
  location: string;
  seller: string;
  emoji: string;
  featured?: boolean;
};

const listings: Listing[] = [
  {
    id: "iphone-15-pro-max",
    title: "iPhone 15 Pro Max",
    category: "Phones & Tablets",
    price: "GH₵ 14,500",
    location: "Accra",
    seller: "Prominent Store",
    emoji: "📱",
    featured: true,
  },
  {
    id: "toyota-corolla-2020",
    title: "Toyota Corolla 2020",
    category: "Cars & Vehicles",
    price: "GH₵ 185,000",
    location: "Kumasi",
    seller: "Ghana Auto Hub",
    emoji: "🚗",
    featured: true,
  },
  {
    id: "modern-3-bedroom-house",
    title: "Modern 3 Bedroom House",
    category: "Property",
    price: "GH₵ 850,000",
    location: "East Legon",
    seller: "Prominent Properties",
    emoji: "🏠",
    featured: true,
  },
  {
    id: "hp-laptop-core-i7",
    title: "HP Laptop Core i7",
    category: "Electronics",
    price: "GH₵ 8,500",
    location: "Accra",
    seller: "Tech World Ghana",
    emoji: "💻",
    featured: true,
  },
  {
    id: "office-furniture",
    title: "Office Furniture Set",
    category: "Furniture",
    price: "GH₵ 12,000",
    location: "Tema",
    seller: "Modern Office GH",
    emoji: "🪑",
  },
  {
    id: "fashion-wear",
    title: "Premium Fashion Wear",
    category: "Fashion",
    price: "GH₵ 850",
    location: "Accra",
    seller: "Prominent Fashion",
    emoji: "👕",
  },
  {
    id: "building-materials",
    title: "Building Materials",
    category: "Building Materials",
    price: "GH₵ 25,000",
    location: "Kumasi",
    seller: "Ghana Builders Mart",
    emoji: "🧱",
  },
  {
    id: "business-service",
    title: "Business & Professional Services",
    category: "Services",
    price: "Contact Seller",
    location: "Accra",
    seller: "APG Business Hub",
    emoji: "💼",
  },
];

const categories = [
  "All Categories",
  "Phones & Tablets",
  "Cars & Vehicles",
  "Property",
  "Electronics",
  "Furniture",
  "Fashion",
  "Building Materials",
  "Services",
];

export default function ListingsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Ghana");
  const [sort, setSort] = useState("Featured");

  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((item) =>
        `${item.title} ${item.category} ${item.location} ${item.seller}`
          .toLowerCase()
          .includes(query)
      );
    }

    if (category !== "All Categories") {
      result = result.filter((item) => item.category === category);
    }

    if (location !== "All Ghana") {
      result = result.filter((item) => item.location === location);
    }

    if (sort === "Featured") {
      result.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    if (sort === "A-Z") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [search, category, location, sort]);

  return (
    <main className="marketplace-page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #f6f9fc;
          color: #14213d;
        }

        a {
          text-decoration: none;
          color: inherit;
        }

        button,
        input,
        select {
          font: inherit;
        }

        .marketplace-page {
          min-height: 100vh;
          background: #f6f9fc;
        }

        .top-header {
          background: #ffffff;
          border-bottom: 1px solid #dfe6ef;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .header-inner {
          width: min(1180px, calc(100% - 32px));
          min-height: 76px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .brand {
          color: #1769e0;
          font-size: 21px;
          font-weight: 900;
          white-space: nowrap;
        }

        .brand small {
          display: block;
          color: #667085;
          font-size: 11px;
          margin-top: 2px;
          letter-spacing: 0.7px;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .nav a {
          font-weight: 700;
          color: #14213d;
        }

        .nav a:hover {
          color: #1769e0;
        }

        .signin {
          border: 1.5px solid #1769e0;
          color: #1769e0 !important;
          padding: 10px 17px;
          border-radius: 9px;
        }

        .hero {
          background:
            radial-gradient(
              circle at 90% 10%,
              rgba(39, 184, 237, 0.55),
              transparent 35%
            ),
            linear-gradient(135deg, #0b5fd7, #147ee3 50%, #28b8ed);
          color: white;
        }

        .hero-inner {
          width: min(1180px, calc(100% - 32px));
          margin: auto;
          padding: 72px 0 68px;
        }

        .eyebrow {
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1.5px;
          margin-bottom: 17px;
        }

        .hero h1 {
          max-width: 820px;
          margin: 0;
          font-size: clamp(48px, 7vw, 82px);
          line-height: 0.98;
          letter-spacing: -4px;
        }

        .hero p {
          max-width: 760px;
          font-size: 21px;
          line-height: 1.45;
          margin: 25px 0 32px;
        }

        .search-main {
          display: grid;
          grid-template-columns: 1fr 190px 120px;
          gap: 10px;
          max-width: 980px;
        }

        .search-main input,
        .search-main select,
        .search-main button {
          height: 56px;
          border: 0;
          border-radius: 10px;
        }

        .search-main input,
        .search-main select {
          padding: 0 17px;
          outline: none;
          background: white;
          color: #14213d;
        }

        .search-main button {
          background: #082f78;
          color: white;
          font-weight: 900;
          cursor: pointer;
        }

        .content {
          width: min(1180px, calc(100% - 32px));
          margin: auto;
          padding: 60px 0;
        }

        .filters {
          background: white;
          border: 1px solid #dfe6ef;
          border-radius: 18px;
          padding: 22px;
          margin-bottom: 42px;
        }

        .filters-title {
          font-size: 13px;
          color: #1769e0;
          font-weight: 900;
          letter-spacing: 1.3px;
          margin-bottom: 14px;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr 1fr 180px;
          gap: 12px;
        }

        .filter-grid input,
        .filter-grid select {
          height: 50px;
          width: 100%;
          border: 1px solid #d5dfeb;
          border-radius: 9px;
          padding: 0 13px;
          outline: none;
          color: #14213d;
          background: white;
        }

        .listings-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .listings-heading h2 {
          margin: 0;
          font-size: 40px;
          letter-spacing: -1.5px;
        }

        .listings-heading p {
          margin: 7px 0 0;
          color: #667085;
        }

        .sell-button {
          background: #1769e0;
          color: white;
          padding: 13px 20px;
          border-radius: 9px;
          font-weight: 900;
        }

        .listing-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .listing-card {
          background: white;
          border: 1px solid #dfe6ef;
          border-radius: 16px;
          overflow: hidden;
          transition: 0.2s ease;
        }

        .listing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(20, 33, 61, 0.1);
        }

        .listing-image {
          height: 190px;
          background: #eaf6ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 70px;
          position: relative;
        }

        .top-ad {
          position: absolute;
          top: 14px;
          left: 14px;
          background: #1769e0;
          color: white;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 900;
        }

        .listing-info {
          padding: 20px;
        }

        .category {
          color: #667085;
          font-size: 13px;
          margin-bottom: 10px;
        }

        .listing-info h3 {
          margin: 0 0 10px;
          font-size: 18px;
          line-height: 1.3;
        }

        .price {
          color: #1769e0;
          font-size: 20px;
          font-weight: 900;
          margin-bottom: 10px;
        }

        .location {
          color: #667085;
          margin-bottom: 13px;
        }

        .seller {
          margin-bottom: 12px;
        }

        .verified {
          display: inline-block;
          padding: 5px 9px;
          background: #e9f8ef;
          color: #087443;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 900;
        }

        .view-button {
          display: block;
          margin-top: 15px;
          padding: 10px;
          text-align: center;
          border: 1px solid #1769e0;
          color: #1769e0;
          border-radius: 8px;
          font-weight: 800;
        }

        .empty {
          background: white;
          border: 1px solid #dfe6ef;
          padding: 50px;
          border-radius: 16px;
          text-align: center;
        }

        .empty h3 {
          margin-top: 0;
        }

        .business {
          margin-top: 70px;
          background: linear-gradient(135deg, #0b4db5, #159de0);
          color: white;
          border-radius: 22px;
          padding: 48px;
        }

        .business h2 {
          margin: 0 0 12px;
          font-size: 38px;
        }

        .business p {
          max-width: 680px;
          line-height: 1.6;
          margin-bottom: 25px;
        }

        .business-button {
          display: inline-block;
          background: white;
          color: #1769e0;
          padding: 13px 20px;
          border-radius: 9px;
          font-weight: 900;
        }

        .footer {
          margin-top: 70px;
          background: #071a38;
          color: white;
          padding: 42px 0;
        }

        .footer-inner {
          width: min(1180px, calc(100% - 32px));
          margin: auto;
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .footer p {
          color: #aebbd0;
          margin: 7px 0 0;
        }

        @media (max-width: 1000px) {
          .listing-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .filter-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 700px) {
          .nav {
            display: none;
          }

          .hero-inner {
            padding: 55px 0;
          }

          .hero h1 {
            font-size: 52px;
            letter-spacing: -2.5px;
          }

          .hero p {
            font-size: 18px;
          }

          .search-main {
            grid-template-columns: 1fr;
          }

          .filter-grid {
            grid-template-columns: 1fr;
          }

          .listings-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .listings-heading h2 {
            font-size: 32px;
          }

          .listing-grid {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .listing-image {
            height: 145px;
            font-size: 52px;
          }

          .listing-info {
            padding: 14px;
          }

          .listing-info h3 {
            font-size: 15px;
          }

          .price {
            font-size: 17px;
          }

          .business {
            padding: 30px 22px;
          }

          .business h2 {
            font-size: 29px;
          }

          .footer-inner {
            flex-direction: column;
          }
        }

        @media (max-width: 390px) {
          .listing-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="top-header">
        <div className="header-inner">
          <Link href="/" className="brand">
            ALL PROMINENT GHANA
            <small>BUY • SELL • ADVERTISE • CONNECT</small>
          </Link>

          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/listings">Marketplace</Link>
            <Link href="/sell">Sell an Item</Link>
            <Link href="/account" className="signin">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div className="eyebrow">ALL PROMINENT MARKETPLACE</div>

          <h1>
            Find what you need.
            <br />
            Sell what you have.
          </h1>

          <p>
            Discover products, vehicles, property, services and opportunities
            from sellers across Ghana.
          </p>

          <form
            className="search-main"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="search"
              placeholder="What are you looking for?"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            >
              <option>All Ghana</option>
              <option>Accra</option>
              <option>Kumasi</option>
              <option>Tema</option>
              <option>East Legon</option>
            </select>

            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      <section className="content">
        <div className="filters">
          <div className="filters-title">MARKETPLACE FILTERS</div>

          <div className="filter-grid">
            <input
              type="search"
              placeholder="Search marketplace"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            >
              <option>All Ghana</option>
              <option>Accra</option>
              <option>Kumasi</option>
              <option>Tema</option>
              <option>East Legon</option>
            </select>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option>Featured</option>
              <option>A-Z</option>
            </select>
          </div>
        </div>

        <div className="listings-heading">
          <div>
            <h2>Latest Listings</h2>
            <p>
              {filteredListings.length} listings available
            </p>
          </div>

          <Link href="/sell" className="sell-button">
            + Sell an Item
          </Link>
        </div>

        {filteredListings.length > 0 ? (
          <div className="listing-grid">
            {filteredListings.map((listing) => (
              <article className="listing-card" key={listing.id}>
                <div className="listing-image">
                  {listing.featured && (
                    <span className="top-ad">TOP AD</span>
                  )}

                  <span>{listing.emoji}</span>
                </div>

                <div className="listing-info">
                  <div className="category">
                    {listing.category}
                  </div>

                  <h3>{listing.title}</h3>

                  <div className="price">{listing.price}</div>

                  <div className="location">
                    📍 {listing.location}
                  </div>

                  <div className="seller">
                    {listing.seller}
                  </div>

                  <span className="verified">
                    ✓ Verified
                  </span>

                  <Link
                    href={`/listings/${listing.id}`}
                    className="view-button"
                  >
                    View Listing
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>No listings found</h3>
            <p>
              Try another search, category or location.
            </p>
          </div>
        )}

        <section className="business">
          <h2>Give your business more visibility</h2>

          <p>
            Promote your products and services to more customers across Ghana.
            Advertise your business on the All Prominent Marketplace.
          </p>

          <Link href="/advertise" className="business-button">
            Advertise Now →
          </Link>
        </section>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <strong>ALL PROMINENT GHANA</strong>
            <p>Buy • Sell • Advertise • Connect</p>
          </div>

          <div>
            <p>© {new Date().getFullYear()} All Prominent Ghana</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
