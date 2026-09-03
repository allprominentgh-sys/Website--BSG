"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "../../../components/Header";

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
    title: "iPhone 15 Pro",
    description:
      "Clean and gently used iPhone 15 Pro. Excellent condition and ready for a new owner.",
    price: 12500,
    currency: "GHS",
    location: "Accra, Ghana",
    category: "Phones & Tablets",
    seller: "All Prominent Seller",
    phone: "+233240000000",
    image:
      "https://images.unsplash.com/photo-1696446701796-da61225697cc",
  },
  {
    id: 2,
    title: "Toyota Camry",
    description:
      "Neat and well-maintained Toyota Camry. Available for inspection in Kumasi.",
    price: 185000,
    currency: "GHS",
    location: "Kumasi, Ghana",
    category: "Cars",
    seller: "Ghana Auto Seller",
    phone: "+233240000001",
    image:
      "https://images.unsplash.com/photo-1550355291-bbee04a92027",
  },
  {
    id: 3,
    title: "Modern House",
    description:
      "Beautiful modern property available for sale in East Legon, Accra.",
    price: 850000,
    currency: "GHS",
    location: "East Legon, Accra",
    category: "Property",
    seller: "Prominent Properties",
    phone: "+233240000002",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  },
  {
    id: 4,
    title: "Designer Fashion",
    description:
      "Quality fashion items at affordable prices.",
    price: 850,
    currency: "GHS",
    location: "Accra, Ghana",
    category: "Fashion",
    seller: "Prominent Fashion",
    phone: "+233240000003",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050",
  },
];

export default function ListingDetailsPage() {
  const params = useParams();

  const id = Number(params.id);

  const product = products.find((item) => item.id === id);

  if (!product) {
    return (
      <>
        <Header />

        <main className="not-found">
          <div className="box">
            <h1>Listing not found</h1>

            <p>
              The listing you are looking for does not exist.
            </p>

            <Link href="/listings">
              Back to Marketplace
            </Link>
          </div>
        </main>

        <style jsx>{`
          .not-found {
            min-height: 80vh;
            background: #f6f8fb;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px 20px;
          }

          .box {
            width: 100%;
            max-width: 700px;
            background: white;
            padding: 55px 30px;
            border-radius: 18px;
            text-align: center;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          }

          .box h1 {
            font-size: 42px;
            margin: 0 0 15px;
            color: #172033;
          }

          .box p {
            color: #667085;
            font-size: 19px;
            margin-bottom: 30px;
          }

          .box a {
            display: inline-block;
            background: #1557c0;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
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

      <main className="page">
        <div className="container">

          <Link href="/listings" className="back">
            ← Back to Marketplace
          </Link>

          <div className="details">

            <div className="image-section">
              <img
                src={product.image}
                alt={product.title}
              />
            </div>

            <div className="information">

              <span className="category">
                {product.category}
              </span>

              <h1>{product.title}</h1>

              <div className="price">
                {product.currency}{" "}
                {product.price.toLocaleString()}
              </div>

              <p className="location">
                📍 {product.location}
              </p>

              <hr />

              <h2>Description</h2>

              <p className="description">
                {product.description}
              </p>

              <div className="seller-box">
                <h2>Seller Information</h2>

                <p>
                  <strong>Seller:</strong>{" "}
                  {product.seller}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {product.location}
                </p>
              </div>

              <div className="actions">

                <a
                  href={`tel:${product.phone}`}
                  className="call"
                >
                  📞 Call Seller
                </a>

                <a
                  href={`https://wa.me/${product.phone.replace(
                    /[^0-9]/g,
                    ""
                  )}?text=Hello%2C%20I%20am%20interested%20in%20your%20${encodeURIComponent(
                    product.title
                  )}%20listing%20on%20All%20Prominent%20Ghana.`}
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

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f6f8fb;
          padding: 35px 0 80px;
        }

        .container {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .back {
          display: inline-block;
          color: #1557c0;
          text-decoration: none;
          font-weight: 700;
          margin-bottom: 25px;
        }

        .details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.07);
        }

        .image-section {
          min-height: 550px;
          background: #e9edf2;
        }

        .image-section img {
          width: 100%;
          height: 100%;
          min-height: 550px;
          object-fit: cover;
          display: block;
        }

        .information {
          padding: 45px;
        }

        .category {
          color: #1557c0;
          font-weight: 800;
          font-size: 14px;
          text-transform: uppercase;
        }

        h1 {
          color: #172033;
          font-size: 42px;
          margin: 12px 0;
        }

        .price {
          color: #1557c0;
          font-size: 30px;
          font-weight: 800;
          margin: 15px 0;
        }

        .location {
          color: #667085;
          font-size: 16px;
        }

        hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 30px 0;
        }

        h2 {
          color: #172033;
          font-size: 21px;
          margin-bottom: 12px;
        }

        .description {
          color: #667085;
          line-height: 1.7;
          font-size: 16px;
        }

        .seller-box {
          margin-top: 30px;
          padding: 20px;
          background: #f6f8fb;
          border-radius: 12px;
        }

        .seller-box p {
          color: #667085;
        }

        .actions {
          display: flex;
          gap: 12px;
          margin-top: 30px;
        }

        .actions a {
          flex: 1;
          text-align: center;
          padding: 15px 12px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 800;
        }

        .call {
          background: #1557c0;
          color: white;
        }

        .whatsapp {
          background: #25d366;
          color: white;
        }

        @media (max-width: 800px) {
          .details {
            grid-template-columns: 1fr;
          }

          .image-section,
          .image-section img {
            min-height: 350px;
            height: 350px;
          }

          .information {
            padding: 28px 22px;
          }

          h1 {
            font-size: 32px;
          }

          .actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
