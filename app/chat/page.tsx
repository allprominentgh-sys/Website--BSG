"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ChatPage() {
  const [listing, setListing] = useState("");
  const [seller, setSeller] = useState("Seller");
  const [title, setTitle] = useState("Listing");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setListing(params.get("listing") || "");
    setSeller(params.get("seller") || "Seller");
    setTitle(params.get("title") || "Listing");
    setPrice(params.get("price") || "");
  }, []);

  function sendMessage() {
    if (!message.trim()) {
      alert("Please type a message first.");
      return;
    }

    alert("Message sent successfully.");

    setMessage("");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            background: "#1769e0",
            color: "#ffffff",
            padding: "22px",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            ← Back to Marketplace
          </Link>

          <h1
            style={{
              margin: "18px 0 6px",
              fontSize: "28px",
            }}
          >
            Chat with Seller
          </h1>

          <p
            style={{
              margin: 0,
              opacity: 0.9,
            }}
          >
            Contact the seller about this listing.
          </p>
        </div>

        {/* LISTING DETAILS */}
        <div
          style={{
            background: "#ffffff",
            padding: "22px",
            borderLeft: "1px solid #e5e7eb",
            borderRight: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px",
              fontSize: "23px",
              color: "#111827",
            }}
          >
            {title}
          </h2>

          <p
            style={{
              margin: "8px 0",
              color: "#555555",
            }}
          >
            Seller: <strong>{seller}</strong>
          </p>

          {price && (
            <p
              style={{
                margin: "8px 0",
                color: "#1769e0",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              Price: {price}
            </p>
          )}

          {listing && (
            <p
              style={{
                margin: "8px 0",
                color: "#777777",
                fontSize: "13px",
              }}
            >
              Listing ID: {listing}
            </p>
          )}
        </div>

        {/* CHAT */}
        <div
          style={{
            background: "#ffffff",
            padding: "22px",
            border: "1px solid #e5e7eb",
            borderRadius: "0 0 16px 16px",
          }}
        >
          <div
            style={{
              background: "#f1f5f9",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            <strong>{seller}</strong>

            <p
              style={{
                margin: "8px 0 0",
                color: "#444444",
              }}
            >
              Hello! How can I help you with this listing?
            </p>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message to the seller..."
            rows={5}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              resize: "vertical",
              fontSize: "16px",
              outline: "none",
            }}
          />

          <button
            type="button"
            onClick={sendMessage}
            style={{
              marginTop: "12px",
              width: "100%",
              padding: "15px",
              background: "#1769e0",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Send Message
          </button>

          <div
            style={{
              marginTop: "20px",
              textAlign: "center",
            }}
          >
            <Link
              href="/listings"
              style={{
                color: "#1769e0",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              ← Browse More Listings
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
