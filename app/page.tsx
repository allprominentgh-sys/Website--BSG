"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Product = {
  id: number;
  title: string;
  price: number;
  location: string;
  category: string;
  seller: string;
  verified: boolean;
  image: string;
  badge?: string;
};

const products: Product[] = [
  {
    id: 1,
    title: "iPhone 15 Pro",
    price: 12500,
    location: "Accra",
    category: "Phones & Tablets",
    seller: "All Prominent Seller",
    verified: true,
    badge: "Featured",
    image:
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    title: "Toyota Camry",
    price: 185000,
    location: "Kumasi",
    category: "Cars",
    seller: "Ghana Auto Seller",
    verified: true,
    badge: "Top Ad",
    image:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    title: "Modern 3 Bedroom House",
    price: 850000,
    location: "East Legon, Accra",
    category: "Property",
    seller: "Prominent Properties",
    verified: true,
    badge: "Verified",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    title: "DTF Printing Machine",
    price: 42000,
    location: "Accra",
    category: "Equipment",
    seller: "Prominent Machines",
    verified: true,
    image:
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    title: "Samsung Smart TV",
    price: 7800,
    location: "Tema",
    category: "Electronics",
    seller: "Tech Ghana",
    verified: true,
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    title: "Office Furniture Set",
    price: 12500,
    location: "Accra",
    category: "Furniture",
    seller: "Office Hub Ghana",
    verified: false,
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
  },
];

const categories = [
  { icon: "📱", name: "Phones & Tablets" },
  { icon: "🚗", name: "Cars" },
  { icon: "🏠", name: "Property" },
  { icon: "💻", name: "Electronics" },
  { icon: "🪑", name: "Furniture" },
  { icon: "⚙️", name: "Equipment" },
  { icon: "👕", name: "Fashion" },
  { icon: "💼", name: "Jobs & Services" },
];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        !q ||
        product.title.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.location.toLowerCase().includes(q);

      const matchesCategory =
        category === "All Categories" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const money = (value: number) =>
    new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <main className="site">
      {/* TOP BAR */}
      <div className="topbar">
        <div className="container topbar-inner">
          <span>🇬🇭 Ghana's marketplace</span>

          <div className="top-links">
            <Link href="/advertise">Advertise</Link>
            <Link href="/listings">Sell an Item</Link>
            <Link href="/account">Help</Link>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="header">
        <div className="container header-inner">
          <Link href="/" className="logo">
            <span className="logo-mark">AP</span>
            <span>
              <strong>ALL PROMINENT</strong>
              <small>GHANA</small>
            </span>
          </Link>

          <nav className="desktop-nav">
            <Link href="/">Home</Link>
            <Link href="/listings">Marketplace</Link>
            <Link href="/advertise">Advertise</Link>
            <Link href="/supermarket">Supermarket</Link>
          </nav>

          <div className="header-actions">
            <Link href="/account" className="login-btn">
              Sign in
            </Link>

            <Link href="/post-ad" className="sell-btn">
              + Sell
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-copy">
            <div className="eyebrow">
              🇬🇭 BUY • SELL • ADVERTISE • CONNECT
            </div>

            <h1>
              Everything you need.
              <br />
              <span>All in one place.</span>
            </h1>

            <p>
              Discover products, vehicles, property, equipment, services and
              more from sellers and businesses across Ghana.
            </p>

            {/* SEARCH */}
            <div className="search-box">
              <div className="search-icon">⌕</div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="What are you looking for?"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>All Categories</option>
                {categories.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>

              <button type="button">Search</button>
            </div>

            <div className="popular">
              <span>Popular:</span>
              <button onClick={() => setSearch("iPhone")}>iPhone</button>
              <button onClick={() => setSearch("Cars")}>Cars</button>
              <button onClick={() => setSearch("Property")}>Property</button>
              <button onClick={() => setSearch("Electronics")}>
                Electronics
              </button>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-top">
              <span>🚀</span>
              <span>Prominent Marketplace</span>
            </div>

            <h3>Put your business in front of Ghana.</h3>

            <p>
              Promote your products with featured listings and premium
              advertising.
            </p>

            <Link href="/advertise" className="hero-card-button">
              Start Advertising →
            </Link>

            <div className="hero-stats">
              <div>
                <strong>24/7</strong>
                <span>Marketplace</span>
              </div>
              <div>
                <strong>🇬🇭</strong>
                <span>Across Ghana</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-label">EXPLORE</span>
              <h2>Shop by category</h2>
            </div>

            <Link href="/listings" className="view-all">
              View all →
            </Link>
          </div>

          <div className="categories">
            {categories.map((item) => (
              <button
                className="category-card"
                key={item.name}
                onClick={() => {
                  setCategory(item.name);
                  window.scrollTo({ top: 1050, behavior: "smooth" });
                }}
              >
                <span>{item.icon}</span>
                <strong>{item.name}</strong>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="products-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-label">MARKETPLACE</span>
              <h2>
                {search || category !== "All Categories"
                  ? "Search results"
                  : "Featured listings"}
              </h2>
            </div>

            <Link href="/listings" className="view-all">
              Explore marketplace →
            </Link>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty">
              <div>🔎</div>
              <h3>No listings found</h3>
              <p>Try another product, category or location.</p>
            </div>
          ) : (
            <div className="products">
              {filteredProducts.map((product) => (
                <Link
                  href={`/listings/${product.id}`}
                  className="product-card"
                  key={product.id}
                >
                  <div className="product-image">
                    <img src={product.image} alt={product.title} />

                    {product.badge && (
                      <span className="badge">{product.badge}</span>
                    )}
                  </div>

                  <div className="product-info">
                    <span className="product-category">
                      {product.category}
                    </span>

                    <h3>{product.title}</h3>

                    <strong className="price">
                      {money(product.price)}
                    </strong>

                    <div className="product-location">
                      📍 {product.location}
                    </div>

                    <div className="seller">
                      <span className="seller-avatar">AP</span>

                      <span>
                        {product.seller}
                        {product.verified && (
                          <small> ✓ Verified seller</small>
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BUSINESS SERVICES */}
      <section className="services-section">
        <div className="container">
          <div className="services-heading">
            <span className="section-label">BUILT FOR BUSINESS</span>
            <h2>More than just a marketplace.</h2>
            <p>
              Tools designed to help Ghanaian businesses sell, advertise,
              receive payments and reach customers.
            </p>
          </div>

          <div className="services">
            <div className="service-card">
              <div className="service-icon">✓</div>
              <h3>Company Verification</h3>
              <p>
                Build trust with verified business profiles and seller
                verification.
              </p>
              <Link href="/account">Get verified →</Link>
            </div>

            <div className="service-card">
              <div className="service-icon">📢</div>
              <h3>Top Ads</h3>
              <p>
                Put your products at the top of marketplace searches and
                attract more customers.
              </p>
              <Link href="/advertise">Promote your business →</Link>
            </div>

            <div className="service-card">
              <div className="service-icon">💳</div>
              <h3>Secure Payments</h3>
              <p>
                A future-ready payment system for customers and businesses.
              </p>
              <Link href="/account">Payment options →</Link>
            </div>

            <div className="service-card">
              <div className="service-icon">📍</div>
              <h3>Delivery & Tracking</h3>
              <p>
                Customers can pin their delivery location and follow delivery
                progress.
              </p>
              <Link href="/account">Delivery service →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI SELLING SECTION */}
      <section className="ai-section">
        <div className="container ai-box">
          <div className="ai-icon">✦</div>

          <div>
            <span className="section-label">AI SELLER ASSISTANT</span>

            <h2>Let AI help you sell.</h2>

            <p>
              Add your product details and AI can help create a clear,
              professional product description that attracts buyers.
            </p>

            <Link href="/post-ad" className="primary-button">
              Create a listing with AI →
            </Link>
          </div>
        </div>
      </section>

      {/* SELL CTA */}
      <section className="sell-section">
        <div className="container sell-box">
          <div>
            <span className="section-label">READY TO SELL?</span>
            <h2>Turn your product into a business opportunity.</h2>
            <p>
              Sell products, vehicles, property, equipment, jobs and services
              to customers across Ghana.
            </p>
          </div>

          <Link href="/post-ad" className="white-button">
            + Post an Ad
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo footer-logo">
              <span className="logo-mark">AP</span>
              <span>
                <strong>ALL PROMINENT</strong>
                <small>GHANA</small>
              </span>
            </Link>

            <p>
              Buy. Sell. Advertise. Connect.
              <br />
              Your marketplace for Ghana.
            </p>
          </div>

          <div>
            <h4>Marketplace</h4>
            <Link href="/listings">Browse listings</Link>
            <Link href="/post-ad">Sell an item</Link>
            <Link href="/advertise">Advertise</Link>
          </div>

          <div>
            <h4>Business</h4>
            <Link href="/account">Business account</Link>
            <Link href="/account">Verification</Link>
            <Link href="/advertise">Top Ads</Link>
          </div>

          <div>
            <h4>Account</h4>
            <Link href="/account">Sign in</Link>
            <Link href="/account">My account</Link>
            <Link href="/account">Help</Link>
          </div>
        </div>

        <div className="container copyright">
          © {new Date().getFullYear()} All Prominent Ghana. All rights
          reserved.
        </div>
      </footer>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .site {
          min-height: 100vh;
          background: #ffffff;
          color: #14213d;
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        }

        .container {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
        }

        .topbar {
          background: #0757d9;
          color: white;
          font-size: 13px;
        }

        .topbar-inner {
          min-height: 38px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .top-links {
          display: flex;
          gap: 24px;
        }

        .top-links a {
          color: white;
          text-decoration: none;
        }

        .header {
          background: white;
          border-bottom: 1px solid #e7edf5;
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .header-inner {
          min-height: 78px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #0757d9;
          text-decoration: none;
        }

        .logo-mark {
          width: 43px;
          height: 43px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0757d9, #35baf6);
          color: white;
          display: grid;
          place-items: center;
          font-weight: 900;
          font-size: 15px;
        }

        .logo strong,
        .logo small {
          display: block;
        }

        .logo strong {
          font-size: 17px;
          letter-spacing: -0.5px;
        }

        .logo small {
          color: #68758c;
          font-size: 10px;
          letter-spacing: 3px;
          font-weight: 800;
        }

        .desktop-nav {
          display: flex;
          gap: 30px;
          align-items: center;
        }

        .desktop-nav a {
          color: #26344d;
          text-decoration: none;
          font-weight: 650;
          font-size: 14px;
        }

        .desktop-nav a:hover {
          color: #0757d9;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .login-btn,
        .sell-btn {
          text-decoration: none;
          padding: 11px 18px;
          border-radius: 10px;
          font-weight: 750;
          font-size: 14px;
        }

        .login-btn {
          color: #0757d9;
          border: 1px solid #cbd8eb;
        }

        .sell-btn {
          background: #0757d9;
          color: white;
        }

        .hero {
          background:
            radial-gradient(
              circle at 90% 20%,
              rgba(49, 189, 248, 0.24),
              transparent 30%
            ),
            linear-gradient(135deg, #edf7ff 0%, #f6fbff 50%, #e7f3ff 100%);
          border-bottom: 1px solid #dcecff;
        }

        .hero-content {
          min-height: 515px;
          display: grid;
          grid-template-columns: 1.35fr 0.65fr;
          gap: 60px;
          align-items: center;
          padding: 70px 0;
        }

        .eyebrow,
        .section-label {
          color: #0757d9;
          font-size: 12px;
          letter-spacing: 1.8px;
          font-weight: 850;
        }

        .hero h1 {
          font-size: clamp(42px, 6vw, 68px);
          line-height: 0.99;
          letter-spacing: -3px;
          margin: 15px 0 20px;
          color: #14213d;
        }

        .hero h1 span {
          color: #0789e8;
        }

        .hero-copy > p {
          color: #61708a;
          font-size: 18px;
          line-height: 1.6;
          max-width: 680px;
          margin-bottom: 30px;
        }

        .search-box {
          background: white;
          padding: 7px;
          border: 1px solid #cbd8eb;
          border-radius: 15px;
          display: flex;
          box-shadow: 0 12px 35px rgba(32, 88, 151, 0.1);
          max-width: 760px;
        }

        .search-icon {
          width: 48px;
          display: grid;
          place-items: center;
          font-size: 30px;
          color: #0789e8;
        }

        .search-box input {
          flex: 1;
          min-width: 100px;
          border: 0;
          outline: none;
          font-size: 15px;
          color: #14213d;
        }

        .search-box select {
          border: 0;
          border-left: 1px solid #e1e8f2;
          background: white;
          color: #52627a;
          padding: 0 12px;
          outline: none;
          max-width: 175px;
        }

        .search-box button {
          border: 0;
          background: #0757d9;
          color: white;
          border-radius: 10px;
          padding: 0 25px;
          font-weight: 800;
          cursor: pointer;
        }

        .popular {
          margin-top: 13px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          color: #68758c;
          font-size: 12px;
        }

        .popular button {
          border: 1px solid #d2dfed;
          background: white;
          border-radius: 50px;
          padding: 6px 11px;
          color: #42617f;
          cursor: pointer;
        }

        .hero-card {
          background: linear-gradient(145deg, #0757d9, #0789e8);
          color: white;
          border-radius: 25px;
          padding: 30px;
          box-shadow: 0 25px 60px rgba(7, 87, 217, 0.22);
        }

        .hero-card-top {
          display: flex;
          gap: 9px;
          align-items: center;
          font-size: 12px;
          font-weight: 800;
          opacity: 0.9;
        }

        .hero-card h3 {
          font-size: 29px;
          line-height: 1.1;
          margin: 30px 0 15px;
          letter-spacing: -1px;
        }

        .hero-card p {
          line-height: 1.6;
          color: #dcefff;
          font-size: 14px;
        }

        .hero-card-button {
          display: block;
          background: white;
          color: #0757d9;
          text-align: center;
          text-decoration: none;
          padding: 13px;
          border-radius: 11px;
          margin-top: 25px;
          font-weight: 800;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-top: 1px solid rgba(255, 255, 255, 0.25);
          margin-top: 25px;
          padding-top: 20px;
          gap: 15px;
        }

        .hero-stats strong,
        .hero-stats span {
          display: block;
        }

        .hero-stats strong {
          font-size: 18px;
        }

        .hero-stats span {
          font-size: 11px;
          color: #dcefff;
          margin-top: 3px;
        }

        .section {
          padding: 70px 0 40px;
        }

        .products-section {
          padding: 40px 0 80px;
          background: #f7faff;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          margin-bottom: 25px;
        }

        .section-heading h2,
        .services-heading h2,
        .ai-box h2,
        .sell-box h2 {
          margin: 7px 0 0;
          font-size: 32px;
          letter-spacing: -1.3px;
          color: #14213d;
        }

        .view-all {
          color: #0757d9;
          text-decoration: none;
          font-weight: 800;
          font-size: 14px;
        }

        .categories {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 12px;
        }

        .category-card {
          min-height: 125px;
          border: 1px solid #e1e8f2;
          background: white;
          border-radius: 15px;
          padding: 17px 8px;
          cursor: pointer;
          color: #1b2942;
          transition: 0.2s;
        }

        .category-card:hover {
          transform: translateY(-3px);
          border-color: #8ac9f7;
          box-shadow: 0 12px 30px rgba(36, 104, 170, 0.1);
        }

        .category-card span {
          display: block;
          font-size: 31px;
          margin-bottom: 12px;
        }

        .category-card strong {
          font-size: 12px;
          line-height: 1.25;
          display: block;
        }

        .products {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .product-card {
          background: white;
          border: 1px solid #e1e8f2;
          border-radius: 17px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: 0.2s;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 45px rgba(26, 74, 119, 0.12);
        }

        .product-image {
          height: 225px;
          position: relative;
          background: #edf3f8;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #0757d9;
          color: white;
          padding: 6px 10px;
          border-radius: 50px;
          font-size: 10px;
          font-weight: 850;
        }

        .product-info {
          padding: 18px;
        }

        .product-category {
          color: #0789e8;
          font-size: 11px;
          font-weight: 800;
        }

        .product-info h3 {
          margin: 7px 0;
          font-size: 18px;
          color: #182640;
        }

        .price {
          display: block;
          color: #0757d9;
          font-size: 19px;
          margin-bottom: 8px;
        }

        .product-location {
          color: #728198;
          font-size: 12px;
          margin-bottom: 15px;
        }

        .seller {
          border-top: 1px solid #edf1f6;
          padding-top: 13px;
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 11px;
          color: #52627a;
        }

        .seller-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #e6f4ff;
          color: #0757d9;
          display: grid;
          place-items: center;
          font-size: 9px;
          font-weight: 900;
        }

        .seller small {
          color: #0789e8;
          display: block;
          margin-top: 2px;
        }

        .services-section {
          padding: 85px 0;
          background: white;
        }

        .services-heading {
          max-width: 700px;
          margin-bottom: 35px;
        }

        .services-heading p {
          color: #68758c;
          line-height: 1.6;
        }

        .services {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .service-card {
          padding: 25px;
          border: 1px solid #e1e8f2;
          border-radius: 17px;
          background: #fbfdff;
        }

        .service-icon {
          width: 48px;
          height: 48px;
          border-radius: 13px;
          background: #e7f5ff;
          color: #0757d9;
          display: grid;
          place-items: center;
          font-size: 22px;
          font-weight: 900;
        }

        .service-card h3 {
          font-size: 17px;
          margin: 18px 0 8px;
        }

        .service-card p {
          color: #68758c;
          font-size: 13px;
          line-height: 1.55;
          min-height: 62px;
        }

        .service-card a {
          color: #0757d9;
          text-decoration: none;
          font-weight: 800;
          font-size: 12px;
        }

        .ai-section {
          background: #eef8ff;
          padding: 30px 0;
        }

        .ai-box {
          display: flex;
          align-items: center;
          gap: 25px;
          padding: 30px;
          border: 1px solid #cfeaff;
          background: white;
          border-radius: 20px;
        }

        .ai-icon {
          min-width: 65px;
          height: 65px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          background: #0757d9;
          color: white;
          font-size: 30px;
        }

        .ai-box p {
          color: #68758c;
          max-width: 700px;
          line-height: 1.55;
        }

        .primary-button {
          display: inline-block;
          background: #0757d9;
          color: white;
          padding: 12px 18px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 800;
          font-size: 13px;
        }

        .sell-section {
          padding: 65px 0;
          background: linear-gradient(135deg, #0757d9, #0789e8);
        }

        .sell-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        .sell-box h2 {
          color: white;
          max-width: 700px;
        }

        .sell-box p {
          color: #dcedff;
          max-width: 650px;
          line-height: 1.6;
        }

        .sell-box .section-label {
          color: #bde9ff;
        }

        .white-button {
          background: white;
          color: #0757d9;
          text-decoration: none;
          padding: 15px 24px;
          border-radius: 11px;
          font-weight: 850;
          white-space: nowrap;
        }

        .footer {
          background: #0d1729;
          color: white;
          padding: 55px 0 0;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 50px;
          padding-bottom: 45px;
        }

        .footer-logo {
          color: white;
        }

        .footer-brand p {
          color: #94a4bd;
          line-height: 1.6;
          font-size: 13px;
        }

        .footer h4 {
          margin-top: 0;
          font-size: 14px;
        }

        .footer a {
          display: block;
          color: #94a4bd;
          text-decoration: none;
          margin: 12px 0;
          font-size: 12px;
        }

        .footer a:hover {
          color: white;
        }

        .copyright {
          border-top: 1px solid #25344c;
          color: #728198;
          font-size: 11px;
          padding: 20px 0;
        }

        .empty {
          text-align: center;
          padding: 70px 20px;
          background: white;
          border-radius: 18px;
          border: 1px solid #e1e8f2;
        }

        .empty div {
          font-size: 40px;
        }

        @media (max-width: 950px) {
          .desktop-nav {
            display: none;
          }

          .hero-content {
            grid-template-columns: 1fr;
          }

          .categories {
            grid-template-columns: repeat(4, 1fr);
          }

          .services {
            grid-template-columns: repeat(2, 1fr);
          }

          .products {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 650px) {
          .container {
            width: min(100% - 24px, 1180px);
          }

          .top-links {
            display: none;
          }

          .header-inner {
            min-height: 67px;
          }

          .logo strong {
            font-size: 14px;
          }

          .logo-mark {
            width: 38px;
            height: 38px;
          }

          .login-btn {
            display: none;
          }

          .hero-content {
            padding: 45px 0;
          }

          .hero h1 {
            font-size: 44px;
            letter-spacing: -2px;
          }

          .hero-copy > p {
            font-size: 15px;
          }

          .search-box {
            display: grid;
            grid-template-columns: 45px 1fr;
          }

          .search-box input {
            height: 48px;
          }

          .search-box select {
            grid-column: 1 / -1;
            border: 1px solid #e1e8f2;
            border-radius: 8px;
            height: 44px;
            margin: 5px 0;
            max-width: none;
          }

          .search-box button {
            grid-column: 1 / -1;
            height: 45px;
          }

          .categories {
            grid-template-columns: repeat(2, 1fr);
          }

          .products {
            grid-template-columns: 1fr;
          }

          .product-image {
            height: 250px;
          }

          .services {
            grid-template-columns: 1fr;
          }

          .section-heading {
            align-items: start;
            gap: 15px;
          }

          .section-heading h2,
          .services-heading h2,
          .ai-box h2,
          .sell-box h2 {
            font-size: 27px;
          }

          .ai-box {
            align-items: flex-start;
            flex-direction: column;
          }

          .sell-box {
            flex-direction: column;
            align-items: flex-start;
          }

          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }

          .footer-brand {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </main>
  );
}
