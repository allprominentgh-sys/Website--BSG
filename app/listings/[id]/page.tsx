"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

type Product = {
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
};

const products: Product[] = [
  {
    id: 1,
    title: "iPhone 15 Pro Max",
    description:
      "Clean and gently used iPhone 15 Pro Max. Excellent condition and ready for use.",
    price: 12500,
    currency: "GHS",
    location: "Accra, Ghana",
    category: "Phones & Tablets",
    seller: "All Prominent Seller",
    phone: "233240000000",
    image:
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 2,
    title: "Toyota Corolla",
    description:
      "Reliable Toyota Corolla available for sale. Contact the seller for inspection and further details.",
    price: 185000,
    currency: "GHS",
    location: "Accra, Ghana",
    category: "Cars",
    seller: "Prominent Motors",
    phone: "233240000000",
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 3,
    title: "Modern House for Sale",
    description:
      "Beautiful modern property in Ghana. Contact the seller for viewing arrangements and complete property information.",
    price: 850000,
    currency: "GHS",
    location: "East Legon, Accra",
    category: "Property",
    seller: "Prominent Properties",
    phone: "233240000000",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 4,
    title: "Designer Fashion Collection",
    description:
      "Quality fashion products available in different sizes and styles.",
    price: 450,
    currency: "GHS",
    location: "Kumasi, Ghana",
    category: "Fashion",
    seller: "Prominent Fashion",
    phone: "233240000000",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80",
  },
];

export default function ProductDetailsPage() {
  const params = useParams();
  const [saved, setSaved] = useState(false);

  const id = Number(params?.id);
  const product = products.find((item) => item.id === id);

  if (!product) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f6f7f8",
          padding: "40px 20px",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            background: "white",
            borderRadius: "20px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "32px", marginBottom: "15px" }}>
            Product Not Found
          </h1>

          <p style={{ color: "#667085", marginBottom: "25px" }}>
            The product you are looking for does not exist.
          </p>

          <Link
            href="/listings"
            style={{
              display: "inline-block",
              background: "#087443",
              color: "white",
              padding: "14px 24px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hello, I am interested in your ${product.title} listed on All Prominent Ghana.`
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f7f8",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#17201b",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "#087443",
              textDecoration: "none",
            }}
          >
            ALL PROMINENT GHANA
          </Link>

          <Link
            href="/listings"
            style={{
              color: "#087443",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Marketplace
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "35px 20px 70px",
        }}
      >
        {/* BACK */}
        <Link
          href="/listings"
          style={{
            display: "inline-block",
            marginBottom: "25px",
            color: "#087443",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          ← Back to Marketplace
        </Link>

        <div
          style={{
            background: "white",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
            }}
          >
            {/* IMAGE */}
            <div
              style={{
                background: "#eef1f3",
                minHeight: "480px",
              }}
            >
              <img
                src={product.image}
                alt={product.title}
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "480px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>

            {/* DETAILS */}
            <div style={{ padding: "35px" }}>
              <div
                style={{
                  display: "inline-block",
                  background: "#e8f5ee",
                  color: "#087443",
                  padding: "7px 12px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 700,
                  marginBottom: "15px",
                }}
              >
                {product.category}
              </div>

              <h1
                style={{
                  fontSize: "38px",
                  lineHeight: 1.1,
                  margin: "0 0 18px",
                }}
              >
                {product.title}
              </h1>

              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 900,
                  color: "#087443",
                  marginBottom: "15px",
                }}
              >
                {product.currency}{" "}
                {product.price.toLocaleString()}
              </div>

              <p
                style={{
                  color: "#667085",
                  fontSize: "17px",
                  lineHeight: 1.7,
                  marginBottom: "25px",
                }}
              >
                {product.description}
              </p>

              <div
                style={{
                  borderTop: "1px solid #e5e7eb",
                  borderBottom: "1px solid #e5e7eb",
                  padding: "18px 0",
                  marginBottom: "25px",
                }}
              >
                <p style={{ margin: "0 0 10px" }}>
                  <strong>📍 Location:</strong> {product.location}
                </p>

                <p style={{ margin: 0 }}>
                  <strong>👤 Seller:</strong> {product.seller}
                </p>
              </div>

              {/* ACTIONS */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <a
                  href={`https://wa.me/${product.phone}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#25D366",
                    color: "white",
                    padding: "15px 20px",
                    borderRadius: "10px",
                    textAlign: "center",
                    textDecoration: "none",
                    fontWeight: 800,
                    fontSize: "16px",
                  }}
                >
                  💬 WhatsApp Seller
                </a>

                <a
                  href={`tel:+${product.phone}`}
                  style={{
                    background: "#087443",
                    color: "white",
                    padding: "15px 20px",
                    borderRadius: "10px",
                    textAlign: "center",
                    textDecoration: "none",
                    fontWeight: 800,
                    fontSize: "16px",
                  }}
                >
                  📞 Call Seller
                </a>

                <button
                  onClick={() => setSaved(!saved)}
                  style={{
                    background: saved ? "#fff7d6" : "white",
                    color: "#17201b",
                    border: "1px solid #d0d5dd",
                    padding: "15px 20px",
                    borderRadius: "10px",
                    fontWeight: 800,
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  {saved ? "⭐ Saved" : "☆ Save Product"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SAFETY NOTICE */}
        <div
          style={{
            marginTop: "25px",
            background: "#fff8e7",
            border: "1px solid #f2d98b",
            borderRadius: "14px",
            padding: "20px",
          }}
        >
          <strong>⚠️ Safety tip</strong>

          <p
            style={{
              margin: "8px 0 0",
              color: "#665b38",
              lineHeight: 1.6,
            }}
          >
            Meet sellers in safe public places, inspect products before
            payment, and never share sensitive banking information.
          </p>
        </div>
      </div>
    </main>
  );
}
