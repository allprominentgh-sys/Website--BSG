"use client";

import { Suspense, useSearchParams } from "next/navigation";
import Link from "next/link";

function ChatContent() {
  const searchParams = useSearchParams();

  const listing = searchParams.get("listing") || "";
  const seller = searchParams.get("seller") || "Seller";
  const title = searchParams.get("title") || "Listing";
  const price = searchParams.get("price") || "";

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
        {/* Header */}
        <div
          style={{
            background: "#1769e0",
            color: "white",
            padding: "20px",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <Link
            href="/"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            ← Back to Marketplace
          </Link>

          <h1
            style={{
              margin: "15px 0 5px",
              fontSize: "26px",
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

        {/* Listing information */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderLeft: "1px solid #e5e7eb",
            borderRight: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "8px",
              fontSize: "22px",
            }}
          >
            {title}
          </h2>

          <p
            style={{
              margin: "5px 0",
              color: "#555",
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
                color: "#777",
                fontSize: "13px",
              }}
            >
              Listing ID: {listing}
            </p>
          )}
        </div>

        {/* Chat area */}
        <div
          style={{
            background: "white",
            padding: "20px",
            border: "1px solid #e5e7eb",
            borderRadius: "0 0 16px 16px",
          }}
        >
          <div
            style={{
              background: "#f1f5f9",
              padding: "15px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            <strong>{seller}</strong>

            <p
              style={{
                margin: "8px 0 0",
                color: "#444",
              }}
            >
              Hello! How can I help you with this listing?
            </p>
          </div>

          {/* Message box */}
          <textarea
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
            style={{
              marginTop: "12px",
              width: "100%",
              padding: "14px",
              background: "#1769e0",
              color: "white",
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

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <p>Loading chat...</p>
        </main>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
