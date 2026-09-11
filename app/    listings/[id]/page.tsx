"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "../../components/Header";

type Listing = {
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
  featured: boolean;
};

const listings: Listing[] = [
  {
    id: 1,
    title: "iPhone 15 Pro",
    description:
      "Clean and gently used iPhone 15 Pro in excellent condition.",
    price: 12500,
    currency: "GHS",
    location: "Accra, Ghana",
    category: "Phones & Tablets",
    seller: "All Prominent Seller",
    phone: "+233240000000",
    image:
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1200&q=80",
    featured: true,
  },
  {
    id: 2,
    title: "Toyota Camry",
    description:
      "Neat and well-maintained Toyota Camry available for sale.",
    price: 185000,
    currency: "GHS",
    location: "Kumasi, Ghana",
    category: "Cars",
    seller: "Ghana Auto Seller",
    phone: "+233240000001",
    image:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80",
    featured: true,
  },
  {
    id: 3,
    title: "Modern 3 Bedroom House",
    description:
      "Beautiful modern house in a good residential location.",
    price: 950000,
    currency: "GHS",
    location: "East Legon, Accra",
    category: "Property",
    seller: "Prominent Properties",
    phone: "+233240000002",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    featured: false,
  },
  {
    id: 4,
    title: "Samsung 55-inch Smart TV",
    description:
      "Samsung Smart TV with excellent picture quality.",
    price: 8500,
    currency: "GHS",
    location: "Accra, Ghana",
    category: "Electronics",
    seller: "Tech Ghana",
    phone: "+233240000003",
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=80",
    featured: false,
  },
];

export default function ListingDetailsPage() {
  const params = useParams();

  const id = Number(params.id);

  const listing = listings.find((item) => item.id === id);

  if (!listing) {
    return (
      <>
        <Header />

        <main className="details-page">
          <div className="container">
            <div className="not-found">
              <h1>Listing Not Found</h1>
              <p>
                Sorry, the product or property you are looking for
                could not be found.
              </p>

              <Link href="/listings" className="back-button">
                ← Back to Marketplace
              </Link>
            </div>
          </div>
        </main>

        <style jsx>{`
          .details-page {
            min-height: 100vh;
            background: #f6f8fb;
            padding: 60px 0;
          }

          .container {
            width: 100%;
            max-width: 1180px;
            margin: 0 auto;
            padding: 0 20px;
          }

          .not-found {
            background: white;
            border-radius: 20px;
            padding: 60px 30px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          }

          .not-found h1 {
            margin-bottom: 12px;
          }

          .not-found p {
            color: #667085;
            margin-bottom: 25px;
          }

          .back-button {
            display: inline-block;
            padding: 13px 20px;
            border-radius: 10px;
            background: #172033;
            color: white;
            text-decoration: none;
            font-weight: 700;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="details-page">
        <div className="container">

          <Link href="/listings" className="back-link">
            ← Back to Marketplace
          </Link>

          <div className="details-card">

            <div className="image-section">
              <img
                src={listing.image}
                alt={listing.title}
              />

              {listing.featured && (
                <span className="featured">
                  Featured
                </span>
              )}
            </div>

            <div className="details-section">

              <span className="category">
                {listing.category}
              </span>

              <h1>{listing.title}</h1>

              <div className="price">
                {listing.currency}{" "}
                {listing.price.toLocaleString()}
              </div>

              <p className="description">
                {listing.description}
              </p>

              <div className="info">
                <div>
                  <strong>Location</strong>
                  <span>{listing.location}</span>
                </div>

                <div>
                  <strong>Seller</strong>
                  <span>{listing.seller}</span>
                </div>

                <div>
                  <strong>Category</strong>
                  <span>{listing.category}</span>
                </div>
              </div>

              <div className="actions">

                <a
                  href={`tel:${listing.phone}`}
                  className="call-button"
                >
                  📞 Call Seller
                </a>

                <a
                  href={`https://wa.me/${listing.phone.replace(
                    /[^0-9]/g,
                    ""
                  )}`}
                  className="whatsapp-button"
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

      <style jsx>{`
        .details-page {
          min-height: 100vh;
          background: #f6f8fb;
          padding: 40px 0 80px;
        }

        .container {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 25px;
          color: #172033;
          font-weight: 700;
          text-decoration: none;
        }

        .details-card {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 40px;
          background: white;
          border-radius: 24px;
          padding: 25px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
        }

        .image-section {
          position: relative;
        }

        .image-section img {
          width: 100%;
          height: 520px;
          object-fit: cover;
          border-radius: 18px;
          display: block;
        }

        .featured {
          position: absolute;
          top: 18px;
          left: 18px;
          background: #ff7a00;
          color: white;
          padding: 8px 13px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 800;
        }

        .details-section {
          padding: 20px 10px;
        }

        .category {
          display: inline-block;
          background: #eef2ff;
          color: #3843d0;
          padding: 7px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 18px;
        }

        h1 {
          font-size: 38px;
          line-height: 1.15;
          margin: 0 0 18px;
          color: #172033;
        }

        .price {
          font-size: 30px;
          font-weight: 900;
          color: #0f7b45;
          margin-bottom: 20px;
        }

        .description {
          color: #667085;
          line-height: 1.7;
          font-size: 16px;
          margin-bottom: 30px;
        }

        .info {
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          padding: 20px 0;
          display: grid;
          gap: 18px;
        }

        .info div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .info strong {
          color: #172033;
        }

        .info span {
          color: #667085;
        }

        .actions {
          display: grid;
          gap: 12px;
          margin-top: 30px;
        }

        .actions a {
          text-align: center;
          padding: 15px 20px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 800;
        }

        .call-button {
          background: #172033;
          color: white;
        }

        .whatsapp-button {
          background: #20b15a;
          color: white;
        }

        @media (max-width: 800px) {
          .details-card {
            grid-template-columns: 1fr;
            padding: 15px;
          }

          .image-section img {
            height: 350px;
          }

          h1 {
            font-size: 30px;
          }

          .details-section {
            padding: 10px;
          }
        }
      `}</style>
    </>
  );
}
