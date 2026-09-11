"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const listings: Record<string, any> = {
  "iphone-15-pro-max": {
    category: "Phones & Tablets",
    title: "iPhone 15 Pro Max",
    price: "GH₵ 14,500",
    location: "Accra",
    seller: "Prominent Store",
    icon: "📱",
    description:
      "iPhone 15 Pro Max in excellent condition. Contact the seller for availability, specifications and delivery information.",
  },

  "toyota-corolla-2020": {
    category: "Cars & Vehicles",
    title: "Toyota Corolla 2020",
    price: "GH₵ 185,000",
    location: "Kumasi",
    seller: "Ghana Auto Hub",
    icon: "🚗",
    description:
      "Toyota Corolla 2020 available for sale. Contact the seller for vehicle inspection and additional information.",
  },

  "modern-3-bedroom-house": {
    category: "Property",
    title: "Modern 3 Bedroom House",
    price: "GH₵ 850,000",
    location: "East Legon",
    seller: "Prominent Properties",
    icon: "🏠",
    description:
      "Modern three-bedroom house in East Legon. Contact the seller for viewing arrangements and property details.",
  },

  "hp-laptop-core-i7": {
    category: "Electronics",
    title: "HP Laptop Core i7",
    price: "GH₵ 8,500",
    location: "Accra",
    seller: "Tech World Ghana",
    icon: "💻",
    description:
      "HP Core i7 laptop suitable for business, school and professional use.",
  },

  "office-chair": {
    category: "Furniture",
    title: "Executive Office Chair",
    price: "GH₵ 2,200",
    location: "Accra",
    seller: "Office Solutions",
    icon: "🪑",
    description: "Comfortable executive office chair for offices and businesses.",
  },

  "printing-machine": {
    category: "Business Equipment",
    title: "DTF Printing Machine",
    price: "GH₵ 65,000",
    location: "Tema",
    seller: "Prominent Printing",
    icon: "🖨️",
    description:
      "Professional DTF printing machine for commercial printing operations.",
  },

  "warehouse-space": {
    category: "Property",
    title: "Warehouse for Lease",
    price: "GH₵ 12,000 / month",
    location: "Tema",
    seller: "APG Properties",
    icon: "🏭",
    description:
      "Warehouse space available for lease in Tema. Contact the seller for viewing and lease conditions.",
  },

  "iphone-13": {
    category: "Phones & Tablets",
    title: "iPhone 13",
    price: "GH₵ 7,500",
    location: "Accra",
    seller: "Mobile Hub",
    icon: "📱",
    description:
      "iPhone 13 available in Accra. Contact the seller for more information.",
  },
};

export default function ListingDetailsPage() {
  const params = useParams();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const listing = listings[id];

  if (!listing) {
    return (
      <main className="account-page">
        <header className="account-header">
          <Link href="/" className="brand">
            ALL PROMINENT GHANA
          </Link>
        </header>

        <section className="login-card">
          <h1>Listing not found</h1>

          <p className="login-subtitle">
            This listing may have been removed or is no longer available.
          </p>

          <Link href="/listings" className="phone-button">
            Back to Marketplace
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="listing-details-page">
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

      {/* DETAILS */}
      <section className="details-section">
        <div className="container">
          <Link href="/listings" className="back-link">
            ← Back to Marketplace
          </Link>

          <div className="details-card">
            <div className="details-image">
              <span>{listing.icon}</span>
            </div>

            <div className="details-content">
              <p className="category-name">{listing.category}</p>

              <h1>{listing.title}</h1>

              <div className="details-price">{listing.price}</div>

              <p className="details-location">
                📍 {listing.location}
              </p>

              <div className="seller-box">
                <strong>{listing.seller}</strong>

                <span className="verified">
                  ✓ Verified Seller
                </span>
              </div>

              <h2>Description</h2>

              <p className="description">
                {listing.description}
              </p>

              <div className="details-actions">
                <button type="button" className="contact-button">
                  Contact Seller
                </button>

                <button type="button" className="message-button">
                  💬 Message Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
