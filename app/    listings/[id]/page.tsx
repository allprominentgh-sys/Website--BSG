"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const products = {
  "iphone-15-pro-max": {
    title: "iPhone 15 Pro Max",
    category: "Phones & Tablets",
    price: "GH₵ 14,500",
    location: "Accra, Ghana",
    seller: "Prominent Store",
    emoji: "📱",
    description:
      "Premium smartphone available from a verified seller. Contact the seller for availability, specifications and delivery.",
  },

  "toyota-corolla-2020": {
    title: "Toyota Corolla 2020",
    category: "Cars & Vehicles",
    price: "GH₵ 185,000",
    location: "Kumasi, Ghana",
    seller: "Ghana Auto Hub",
    emoji: "🚗",
    description:
      "Toyota Corolla available for sale. Contact the verified seller for vehicle details, inspection and location.",
  },

  "modern-3-bedroom-house": {
    title: "Modern 3 Bedroom House",
    category: "Property",
    price: "GH₵ 850,000",
    location: "East Legon, Accra",
    seller: "Prominent Properties",
    emoji: "🏠",
    description:
      "Modern three-bedroom property available in a prime location. Contact the verified seller for viewing and property information.",
  },

  "hp-laptop-core-i7": {
    title: "HP Laptop Core i7",
    category: "Electronics",
    price: "GH₵ 8,500",
    location: "Accra, Ghana",
    seller: "Tech World Ghana",
    emoji: "💻",
    description:
      "HP Core i7 laptop suitable for business, school and professional use.",
  },

  "office-furniture-set": {
    title: "Office Furniture Set",
    category: "Furniture",
    price: "GH₵ 12,000",
    location: "Tema, Ghana",
    seller: "Modern Office Ghana",
    emoji: "🪑",
    description:
      "Complete modern office furniture set available for businesses and offices.",
  },

  "industrial-generator": {
    title: "Industrial Generator",
    category: "Machinery",
    price: "GH₵ 95,000",
    location: "Takoradi, Ghana",
    seller: "Industrial Ghana",
    emoji: "⚙️",
    description:
      "Industrial generator suitable for commercial and business applications.",
  },

  "fashion-clothing-bundle": {
    title: "Fashion Clothing Bundle",
    category: "Fashion",
    price: "GH₵ 4,500",
    location: "Accra, Ghana",
    seller: "Prominent Fashion",
    emoji: "👕",
    description:
      "Fashion clothing collection available for retail and wholesale buyers.",
  },

  "shipping-container": {
    title: "40ft Shipping Container",
    category: "Business & Industry",
    price: "GH₵ 38,000",
    location: "Tema, Ghana",
    seller: "APG Logistics",
    emoji: "📦",
    description:
      "40ft shipping container available for business and storage purposes.",
  },
};

export default function ProductPage() {
  const params = useParams();

  const id = String(params.id);

  const product =
    products[id as keyof typeof products];

  if (!product) {
    return (
      <main className="product-page">
        <div className="product-container not-found">
          <div className="not-found-icon">🔎</div>

          <h1>Listing not found</h1>

          <p>
            This listing may have been removed or is no
            longer available.
          </p>

          <Link href="/listings" className="product-button">
            ← Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="product-page">

      {/* HEADER */}

      <div className="product-topbar">
        <div className="product-container">
          <Link
            href="/listings"
            className="product-back"
          >
            ← Back to Marketplace
          </Link>
        </div>
      </div>

      {/* PRODUCT */}

      <section className="product-section">
        <div className="product-container">

          <div className="product-layout">

            {/* IMAGE */}

            <div className="product-image">
              <span>{product.emoji}</span>

              <div className="product-image-label">
                VERIFIED LISTING
              </div>
            </div>

            {/* DETAILS */}

            <div className="product-details">

              <span className="product-category">
                {product.category}
              </span>

              <h1>{product.title}</h1>

              <div className="product-price">
                {product.price}
              </div>

              <div className="product-location">
                📍 {product.location}
              </div>

              <div className="seller-card">

                <div className="seller-avatar">
                  {product.seller.charAt(0)}
                </div>

                <div>
                  <span>SELLER</span>

                  <h3>{product.seller}</h3>

                  <div className="verified-text">
                    ✓ Verified Seller
                  </div>
                </div>

              </div>

              <div className="product-actions">

                <button
                  type="button"
                  className="contact-button"
                  onClick={() =>
                    alert(
                      "Seller contact will be connected to the messaging system."
                    )
                  }
                >
                  Contact Seller
                </button>

                <button
                  type="button"
                  className="save-button"
                  onClick={() =>
                    alert("Listing saved.")
                  }
                >
                  ♡ Save
                </button>

              </div>

            </div>

          </div>

          {/* DESCRIPTION */}

          <div className="product-description">

            <div>
              <span className="description-label">
                ABOUT THIS LISTING
              </span>

              <h2>Description</h2>

              <p>{product.description}</p>
            </div>

            <div className="safety-card">

              <h3>🛡️ Shop safely</h3>

              <p>
                Verify the item and seller before making
                payment. Never share sensitive account
                information with another person.
              </p>

            </div>

          </div>

          {/* DELIVERY */}

          <div className="delivery-card">

            <div className="delivery-icon">
              🚚
            </div>

            <div>
              <h3>Delivery available</h3>

              <p>
                Delivery and location tracking will be
                integrated into BestSalesGH.
              </p>
            </div>

            <span className="coming-soon">
              COMING SOON
            </span>

          </div>

        </div>
      </section>

    </main>
  );
}
