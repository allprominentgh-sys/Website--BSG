"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Listing = {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
  currency_code: string | null;
  location: string | null;
  category: string | null;
  subcategory: string | null;
  featured: boolean | null;
  created_at: string;
};

export default function VehicleSearchPage() {
  const supabase = supabaseBrowser();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setQuery(params.get("query") || params.get("search") || "");
    setSubcategory(params.get("subcategory") || "");
    setLocation(params.get("location") || "");

    loadVehicles(
      params.get("query") || params.get("search") || "",
      params.get("subcategory") || "",
      params.get("location") || ""
    );
  }, []);

  async function loadVehicles(
    searchText: string,
    subcategoryText: string,
    locationText: string
  ) {
    setLoading(true);

    let request = supabase
      .from("listings")
      .select(
        `
        id,
        title,
        description,
        price,
        currency_code,
        location,
        category,
        subcategory,
        featured,
        created_at
        `
      )
      .eq("status", "active");

    /*
     * Vehicles are recognised through the marketplace
     * category/subcategory fields.
     */
    if (searchText.trim()) {
      const value = searchText.trim();

      request = request.or(
        `title.ilike.%${value}%,description.ilike.%${value}%,location.ilike.%${value}%`
      );
    }

    if (subcategoryText && subcategoryText !== "All Subcategories") {
      request = request.eq("subcategory", subcategoryText);
    }

    if (locationText && locationText !== "All Ghana") {
      request = request.ilike("location", `%${locationText}%`);
    }

    const { data, error } = await request
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Vehicle search error:", error);
      setListings([]);
    } else {
      setListings((data || []) as Listing[]);
    }

    setLoading(false);
  }

  function formatPrice(
    price: number | null,
    currency: string | null
  ) {
    if (price === null || price === undefined) {
      return "Price on request";
    }

    return `${currency || "GHS"} ${Number(price).toLocaleString()}`;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f8fc",
        paddingBottom: "60px",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e1e7f0",
          padding: "22px 30px",
        }}
      >
        <Link
          href="/vehicles"
          style={{
            textDecoration: "none",
            color: "#172554",
            fontWeight: 800,
            fontSize: "17px",
          }}
        >
          ← Back to Vehicles
        </Link>

        <div
          style={{
            marginTop: "22px",
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "#2453d8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "38px",
              boxShadow: "0 5px 14px rgba(0,0,0,0.12)",
            }}
          >
            ⭐
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                color: "#101a33",
                fontSize: "28px",
                fontWeight: 900,
              }}
            >
              BEST SALES GHANA
            </h1>

            <p
              style={{
                margin: "5px 0 0",
                color: "#64748b",
                fontSize: "17px",
                fontWeight: 600,
              }}
            >
              Buy • Sell • Advertise • Connect
            </p>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "45px 24px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "30px",
            boxShadow: "0 4px 15px rgba(15,23,42,0.08)",
            border: "1px solid #e1e7f0",
          }}
        >
          <div
            style={{
              color: "#2453d8",
              fontSize: "14px",
              fontWeight: 900,
              letterSpacing: "2px",
              marginBottom: "10px",
            }}
          >
            MARKETPLACE
          </div>

          <h2
            style={{
              margin: 0,
              color: "#101a33",
              fontSize: "38px",
              fontWeight: 900,
            }}
          >
            Vehicle Search Results
          </h2>

          <p
            style={{
              color: "#64748b",
              fontSize: "18px",
              marginTop: "10px",
            }}
          >
            Search results for vehicles available on Best Sales Ghana.
          </p>

          {/* SEARCH SUMMARY */}
          <div
            style={{
              marginTop: "25px",
              padding: "18px",
              background: "#eef5ff",
              borderRadius: "16px",
              color: "#172554",
              fontWeight: 700,
            }}
          >
            {query ? `Search: ${query}` : "All Vehicles"}

            {subcategory && subcategory !== "All Subcategories"
              ? ` • ${subcategory}`
              : ""}

            {location && location !== "All Ghana"
              ? ` • ${location}`
              : ""}
          </div>
        </div>

        {/* RESULTS */}
        <div style={{ marginTop: "30px" }}>
          {loading ? (
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "40px",
                textAlign: "center",
                color: "#64748b",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Searching vehicles...
            </div>
          ) : listings.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "45px 25px",
                textAlign: "center",
                border: "1px solid #e1e7f0",
              }}
            >
              <div style={{ fontSize: "50px" }}>🚗</div>

              <h3
                style={{
                  color: "#101a33",
                  fontSize: "25px",
                  margin: "15px 0 8px",
                }}
              >
                No vehicles found
              </h3>

              <p
                style={{
                  color: "#64748b",
                  fontSize: "17px",
                }}
              >
                Try another vehicle name, subcategory or location.
              </p>

              <Link
                href="/vehicles"
                style={{
                  display: "inline-block",
                  marginTop: "15px",
                  background: "#2453d8",
                  color: "#ffffff",
                  padding: "15px 25px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: 800,
                }}
              >
                Back to Vehicles
              </Link>
            </div>
          ) : (
            <>
              <div
                style={{
                  marginBottom: "18px",
                  color: "#64748b",
                  fontSize: "17px",
                  fontWeight: 700,
                }}
              >
                {listings.length} vehicle
                {listings.length === 1 ? "" : "s"} found
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {listings.map((listing) => (
                  <article
                    key={listing.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      padding: "22px",
                      border: "1px solid #e1e7f0",
                      boxShadow:
                        "0 4px 14px rgba(15,23,42,0.07)",
                    }}
                  >
                    <div
                      style={{
                        height: "150px",
                        borderRadius: "15px",
                        background:
                          "linear-gradient(135deg,#eaf1ff,#f4f7fb)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "60px",
                      }}
                    >
                      🚗
                    </div>

                    <h3
                      style={{
                        color: "#172554",
                        fontSize: "22px",
                        fontWeight: 900,
                        margin: "18px 0 8px",
                      }}
                    >
                      {listing.title}
                    </h3>

                    <div
                      style={{
                        color: "#2453d8",
                        fontSize: "20px",
                        fontWeight: 900,
                      }}
                    >
                      {formatPrice(
                        listing.price,
                        listing.currency_code
                      )}
                    </div>

                    {listing.location && (
                      <div
                        style={{
                          color: "#64748b",
                          marginTop: "10px",
                          fontWeight: 600,
                        }}
                      >
                        📍 {listing.location}
                      </div>
                    )}

                    {listing.subcategory && (
                      <div
                        style={{
                          color: "#64748b",
                          marginTop: "6px",
                        }}
                      >
                        🚘 {listing.subcategory}
                      </div>
                    )}

                    <Link
                      href={`/listings/${listing.id}`}
                      style={{
                        display: "block",
                        marginTop: "18px",
                        background: "#2453d8",
                        color: "#ffffff",
                        textAlign: "center",
                        padding: "14px",
                        borderRadius: "12px",
                        textDecoration: "none",
                        fontWeight: 800,
                      }}
                    >
                      View Vehicle
                    </Link>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
