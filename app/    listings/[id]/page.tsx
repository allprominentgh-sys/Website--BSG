"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const products = [
  {
    id: "1",
    title: "iPhone 15 Pro Max",
    price: "GH₵ 14,500",
    location: "Accra, Ghana",
    category: "Phones & Tablets",
    seller: "Prominent Store",
    image: "📱",
    verified: true,
    description:
      "Premium iPhone 15 Pro Max available from a verified seller in Ghana. Contact the seller for availability, delivery and payment options.",
  },
  {
    id: "2",
    title: "Toyota Corolla 2020",
    price: "GH₵ 185,000",
    location: "Kumasi, Ghana",
    category: "Cars & Vehicles",
    seller: "Ghana Auto Hub",
    image: "🚗",
    verified: true,
    description:
      "Clean Toyota Corolla 2020 available for sale. Contact the seller to arrange inspection and delivery.",
  },
  {
    id: "3",
    title: "Modern 3 Bedroom House",
    price: "GH₵ 850,000",
    location: "East Legon, Accra",
    category: "Property",
    seller: "Prime Properties",
    image: "🏠",
    verified: true,
    description:
      "Modern three-bedroom property in a prime location. Contact the seller for viewing, documentation and further details.",
  },
  {
    id: "4",
    title: "HP Laptop Core i7",
    price: "GH₵ 8,500",
    location: "Accra, Ghana",
    category: "Electronics",
    seller: "Tech World GH",
    image: "💻",
    verified: true,
    description:
      "HP Core i7 laptop suitable for business, school and professional work.",
  },
  {
    id: "5",
    title: "Men's Premium Shirt",
    price: "GH₵ 350",
    location: "Tema, Ghana",
    category: "Fashion",
    seller: "Fashion House",
    image: "👕",
    verified: false,
    description:
      "Premium men's shirt available in different sizes. Contact the seller for colours and availability.",
  },
  {
    id: "6",
    title: "Professional Plumbing Service",
    price: "From GH₵ 250",
    location: "Accra, Ghana",
    category: "Jobs & Services",
    seller: "Pro Services GH",
    image: "🛠️",
    verified: true,
    description:
      "Professional plumbing services for homes, offices and businesses.",
  },
  {
    id: "7",
    title: "Samsung Galaxy S24 Ultra",
    price: "GH₵ 13,800",
    location: "Accra, Ghana",
    category: "Phones & Tablets",
    seller: "Mobile Centre",
    image: "📱",
    verified: true,
    description:
      "Samsung Galaxy S24 Ultra available from a verified mobile seller.",
  },
  {
    id: "8",
    title: "Commercial Shop Space",
    price: "GH₵ 4,500 / month",
    location: "Spintex, Accra",
    category: "Property",
    seller: "City Properties",
    image: "🏢",
    verified: true,
    description:
      "Commercial shop space available in Spintex. Contact the seller for viewing and leasing information.",
  },
];

export default function ProductDetailsPage() {
  const params = useParams();
  const [message, setMessage] = useState("");

  const product =
    products.find((item) => item.id === String(params.id)) || products[0];

  return (
    <main className="product-page">

      {/* HEADER */}
      <header className="product-header">
        <div className="product-header-inner">

          <Link href="/" className="brand">
            <strong>ALL PROMINENT GHANA</strong>
            <span>Buy • Sell • Advertise • Connect</span>
          </Link>

          <nav className="product-nav">
            <Link href="/">Home</Link>
            <Link href="/listings">Marketplace</Link>
            <Link href="/account">Sign In</Link>
          </nav>

        </div>
      </header>

      {/* BREADCRUMB */}
      <section className="product-breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <Link href="/listings">Marketplace</Link>
        <span>›</span>
        <span>{product.category}</span>
      </section>

      {/* PRODUCT */}
      <section className="product-section">

        <div className="product-layout">

          {/* IMAGE */}
          <div className="product-image-box">

            <div className="product-main-image">
              {product.image}
            </div>

            {product.verified && (
              <div className="product-image-badge">
                ✓ Verified Seller
              </div>
            )}

          </div>

          {/* INFORMATION */}
          <div className="product-information">

            <span className="product-category">
              {product.category}
            </span>

            <h1>{product.title}</h1>

            <div className="product-price">
              {product.price}
            </div>

            <p className="product-location">
              📍 {product.location}
            </p>

            <div className="seller-card">

              <div className="seller-avatar">
                {product.seller.charAt(0)}
              </div>

              <div>
                <strong>{product.seller}</strong>

                <p>
                  {product.verified
                    ? "✓ Verified seller"
                    : "Seller"}
                </p>
              </div>

            </div>

            <div className="product-actions">

              <button
                type="button"
                className="primary-action"
                onClick={() =>
                  setMessage(
                    "Seller contact will be available after sign in."
                  )
                }
              >
                Contact Seller
              </button>

              <button
                type="button"
                className="secondary-action"
                onClick={() =>
                  setMessage(
                    "Sign in to save this item to your favourites."
                  )
                }
              >
                ♡ Save Item
              </button>

            </div>

            {message && (
              <div className="product-message">
                {message}
              </div>
            )}

            <div className="product-safety">

              <strong>🛡️ Buy safely</strong>

              <p>
                Confirm the seller, inspect the item and agree on
                payment and delivery before completing your purchase.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* DESCRIPTION */}
      <section className="product-description-section">

        <div className="description-card">

          <p className="eyebrow">PRODUCT INFORMATION</p>

          <h2>Description</h2>

          <p>{product.description}</p>

        </div>

        <div className="description-card">

          <p className="eyebrow">DELIVERY</p>

          <h2>Delivery available</h2>

          <p>
            Delivery service with pinned location and tracking
            integration will be available as the platform develops.
          </p>

          <button type="button" className="location-button">
            📍 Use my location
          </button>

        </div>

      </section>

      {/* SELL CTA */}
      <section className="product-sell-cta">

        <div>

          <p className="eyebrow">
            SELL ON ALL PROMINENT GHANA
          </p>

          <h2>Have something to sell?</h2>

          <p>
            Reach customers across Ghana with your products,
            services, vehicles and property.
          </p>

          <Link href="/post-ad">
            + Post an Ad
          </Link>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="product-footer">

        <strong>ALL PROMINENT GHANA</strong>

        <p>
          Buy • Sell • Advertise • Connect
        </p>

        <div>
          <Link href="/">Home</Link>
          <Link href="/listings">Marketplace</Link>
          <Link href="/account">My Account</Link>
        </div>

      </footer>

    </main>
  );
}
