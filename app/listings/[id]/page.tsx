"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "../../../components/Header";
import { listings, formatPrice } from "../../../data";

export default function ListingDetailsPage() {
  const params = useParams();

  const id = Number(params.id);

  const listing = listings.find(
    (item) => item.id === id
  );

  if (!listing) {
    return (
      <>
        <Header />

        <main className="not-found">
          <h1>Listing not found</h1>

          <p>
            The listing you requested does not exist.
          </p>

          <Link
            href="/listings"
            className="card-link"
          >
            Back to Marketplace
          </Link>
        </main>
      </>
    );
  }

  const whatsappNumber =
    listing.phone.replace(/[^0-9]/g, "");

  const message = encodeURIComponent(
    `Hello, I am interested in your ${listing.title} listing on All Prominent Ghana.`
  );

  return (
    <>
      <Header />

      <main className="detail-page">
        <div className="container">

          <Link
            href="/listings"
            className="back-link"
          >
            ← Back to Marketplace
          </Link>

          <div className="detail-grid">

            <div className="detail-image">
              <img
                src={listing.image}
                alt={listing.title}
              />
            </div>

            <div className="detail-info">

              <small>
                {listing.category} •{" "}
                {listing.subcategory}
              </small>

              <h1>{listing.title}</h1>

              <div className="price">
                {formatPrice(
                  listing.price,
                  listing.currency
                )}
              </div>

              <p className="location">
                📍 {listing.location}
              </p>

              <hr />

              <h2>Description</h2>

              <p className="detail-description">
                {listing.description}
              </p>

              <div className="seller-box">

                <h2>
                  Seller Information
                </h2>

                <p>
                  <strong>Seller:</strong>{" "}
                  {listing.seller}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {listing.phone}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {listing.location}
                </p>

              </div>

              <div className="detail-actions">

                <a
                  href={`tel:${listing.phone}`}
                  className="call"
                >
                  📞 Call Seller
                </a>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${message}`}
                  className="whatsapp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 WhatsApp Seller
                </a>

              </div>

            </div>

          </div>

        </div>
      </main>
    </>
  );
}
