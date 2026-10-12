
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Listing = {
  id: number;
  seller_id: string;
  title: string;
  description: string | null;
  price: number | string;
  currency_code: string | null;
  currency: string | null;
  location: string | null;
  status: string | null;
  featured: boolean | null;
  created_at: string;
  category: string | null;
  subcategory: string | null;
  item_region: string | null;
  item_city: string | null;
  item_area: string | null;
};

function formatMoney(listing: Listing) {
  const currency = listing.currency_code || listing.currency || "GHS";
  const amount = Number(listing.price);

  if (!Number.isFinite(amount)) return String(listing.price);

  try {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Listing | null>(null);

  const loadListings = useCallback(async (term = "") => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const params = new URLSearchParams();

      if (term.trim()) params.set("search", term.trim());

      const response = await fetch(
        `/api/admin/listings?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load listings.");
      }

      setListings(result.listings || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load listings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadListings(search);
  }

  async function deleteListing(listing: Listing) {
    const confirmed = window.confirm(
      `Permanently delete "${listing.title}" (ID ${listing.id})?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(listing.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/admin/listings", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: listing.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not delete this listing.");
      }

      setListings((current) =>
        current.filter((item) => item.id !== listing.id)
      );

      setSelected((current) =>
        current?.id === listing.id ? null : current
      );

      setNotice(`Listing "${listing.title}" was deleted.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete this listing."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #dbe3ef",
    borderRadius: 14,
    padding: 16,
    color: "#111827",
  };

  const primaryButton: React.CSSProperties = {
    background: "#2453e6",
    color: "#ffffff",
    border: 0,
    borderRadius: 9,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  };

  const dangerButton: React.CSSProperties = {
    background: "#b91c1c",
    color: "#ffffff",
    border: 0,
    borderRadius: 9,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "20px 14px 40px",
        color: "#111827",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link
          href="/admin"
          style={{
            color: "#2453e6",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          ← Back to Admin Dashboard
        </Link>

        <header style={{ margin: "22px 0" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
            Marketplace Listings
          </h1>
          <p style={{ color: "#64748b", lineHeight: 1.6 }}>
            Search, inspect and manage advertisements posted on BestSalesGH.
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div style={cardStyle}>
            <p style={{ color: "#64748b", margin: "0 0 8px" }}>
              Loaded listings
            </p>
            <strong style={{ fontSize: 28 }}>{listings.length}</strong>
          </div>

          <div style={cardStyle}>
            <p style={{ color: "#64748b", margin: "0 0 8px" }}>
              Featured listings
            </p>
            <strong style={{ fontSize: 28 }}>
              {listings.filter((item) => item.featured).length}
            </strong>
          </div>
        </section>

        <form
          onSubmit={handleSearch}
          style={{
            ...cardStyle,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search listing title..."
            aria-label="Search listing title"
            style={{
              flex: "1 1 220px",
              minWidth: 0,
              padding: 12,
              border: "1px solid #cbd5e1",
              borderRadius: 9,
              fontSize: 16,
            }}
          />

          <button type="submit" style={primaryButton} disabled={loading}>
            Search
          </button>

          <button
            type="button"
            style={{
              ...primaryButton,
              background: "#e2e8f0",
              color: "#1e293b",
            }}
            onClick={() => {
              setSearch("");
              void loadListings("");
            }}
            disabled={loading}
          >
            Show All
          </button>
        </form>

        {error && (
          <div
            role="alert"
            style={{
              ...cardStyle,
              borderColor: "#fecaca",
              background: "#fef2f2",
              color: "#991b1b",
              marginBottom: 16,
            }}
          >
            <strong>Problem:</strong> {error}
            <p style={{ marginBottom: 0 }}>
              If you are not signed in as Admin, sign in and try again.
            </p>
          </div>
        )}

        {notice && (
          <div
            role="status"
            style={{
              ...cardStyle,
              background: "#f0fdf4",
              borderColor: "#bbf7d0",
              color: "#166534",
              marginBottom: 16,
            }}
          >
            {notice}
          </div>
        )}

        {loading ? (
          <div style={cardStyle}>Loading listings...</div>
        ) : listings.length === 0 ? (
          <div style={cardStyle}>No listings found.</div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {listings.map((listing) => (
              <article key={listing.id} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: "1 1 230px", minWidth: 0 }}>
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: 12,
                        margin: "0 0 6px",
                      }}
                    >
                      LISTING ID: {listing.id}
                    </p>

                    <h2
                      style={{
                        fontSize: 19,
                        margin: "0 0 8px",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {listing.title}
                    </h2>

                    <p
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#2453e6",
                        margin: "0 0 8px",
                      }}
                    >
                      {formatMoney(listing)}
                    </p>

                    <p style={{ color: "#64748b", margin: "5px 0" }}>
                      {listing.category || "Uncategorized"}
                      {listing.subcategory
                        ? ` · ${listing.subcategory}`
                        : ""}
                    </p>

                    <p style={{ color: "#64748b", margin: "5px 0" }}>
                      {[
                        listing.item_city,
                        listing.item_region,
                        listing.location,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Location not provided"}
                    </p>

                    <p style={{ fontSize: 13, color: "#64748b" }}>
                      Status: {listing.status || "Unknown"} · Seller:{" "}
                      {listing.seller_id}
                    </p>

                    {listing.featured && (
                      <span
                        style={{
                          display: "inline-block",
                          background: "#fef3c7",
                          color: "#92400e",
                          borderRadius: 20,
                          padding: "5px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        Featured
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      alignSelf: "flex-start",
                      width: "100%",
                      maxWidth: 180,
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        ...primaryButton,
                        background: "#e8efff",
                        color: "#2453e6",
                      }}
                      onClick={() => setSelected(listing)}
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      style={dangerButton}
                      disabled={deletingId === listing.id}
                      onClick={() => void deleteListing(listing)}
                    >
                      {deletingId === listing.id
                        ? "Deleting..."
                        : "Delete Listing"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {selected && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="listing-details-title"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(15,23,42,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
            onClick={() => setSelected(null)}
          >
            <section
              style={{
                ...cardStyle,
                width: "100%",
                maxWidth: 560,
                maxHeight: "85vh",
                overflowY: "auto",
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <h2
                id="listing-details-title"
                style={{ fontSize: 23, marginTop: 0 }}
              >
                Listing Details
              </h2>

              <p>
                <strong>Title:</strong> {selected.title}
              </p>
              <p>
                <strong>Price:</strong> {formatMoney(selected)}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {selected.description || "No description"}
              </p>
              <p>
                <strong>Category:</strong>{" "}
                {selected.category || "Not specified"}
              </p>
              <p>
                <strong>Subcategory:</strong>{" "}
                {selected.subcategory || "Not specified"}
              </p>
              <p>
                <strong>Seller ID:</strong> {selected.seller_id}
              </p>
              <p>
                <strong>Status:</strong> {selected.status || "Unknown"}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(selected.created_at).toLocaleString()}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 20,
                }}
              >
                <button
                  type="button"
                  style={primaryButton}
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>

                <button
                  type="button"
                  style={dangerButton}
                  disabled={deletingId === selected.id}
                  onClick={() => void deleteListing(selected)}
                >
                  Delete This Listing
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
