"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const products = [
  {
    id: "1",
    title: "iPhone 15 Pro",
    price: "GH₵12,500",
    location: "Accra, Ghana",
    category: "Phones & Tablets",
    description:
      "Premium smartphone offered by a verified seller. Contact the seller for availability, specifications and delivery arrangements.",
    image:
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1200&q=80",
    seller: "All Prominent Seller",
  },
  {
    id: "2",
    title: "Toyota Camry",
    price: "GH₵185,000",
    location: "Kumasi, Ghana",
    category: "Cars & Vehicles",
    description:
      "Well-presented Toyota Camry available from a verified seller in Ghana.",
    image:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80",
    seller: "Ghana Auto Seller",
  },
  {
    id: "3",
    title: "Modern 3 Bedroom House",
    price: "GH₵950,000",
    location: "East Legon, Accra",
    category: "Property",
    description:
      "Modern three bedroom property in a prime Accra location. Contact the seller for viewing and additional property information.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    seller: "Prominent Properties",
  },
  {
    id: "4",
    title: "Premium Laptop",
    price: "GH₵8,500",
    location: "Tema, Ghana",
    category: "Electronics",
    description:
      "Premium laptop suitable for business, school and professional use.",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
    seller: "Tech Ghana",
  },
];

export default function ProductDetails() {
  const params = useParams();

  const product = products.find(
    (item) => item.id === String(params.id)
  );

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold">
            Product not found
          </h1>

          <p className="mt-3 text-slate-500">
            This listing may have been removed.
          </p>

          <Link
            href="/listings"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-bold text-white"
          >
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

          <Link
            href="/"
            className="font-extrabold text-blue-700"
          >
            ALL PROMINENT GHANA
          </Link>

          <Link
            href="/listings"
            className="font-bold text-blue-600"
          >
            ← Marketplace
          </Link>

        </div>
      </header>

      {/* PRODUCT */}
      <section className="mx-auto max-w-7xl px-4 py-10">

        <div className="grid gap-8 lg:grid-cols-2">

          {/* IMAGE */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

            <div className="aspect-square overflow-hidden">
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>

          </div>

          {/* INFORMATION */}
          <div className="rounded-3xl bg-white p-7 shadow-sm md:p-10">

            <div className="flex items-center justify-between">

              <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600">
                {product.category}
              </span>

              <span className="text-sm font-bold text-green-600">
                ✓ Verified
              </span>

            </div>

            <h1 className="mt-6 text-4xl font-extrabold">
              {product.title}
            </h1>

            <p className="mt-5 text-3xl font-extrabold text-blue-700">
              {product.price}
            </p>

            <p className="mt-4 text-slate-500">
              📍 {product.location}
            </p>

            <div className="my-8 border-t" />

            <h2 className="text-xl font-extrabold">
              Description
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              {product.description}
            </p>

            {/* SELLER */}
            <div className="mt-8 rounded-2xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Seller
              </p>

              <div className="mt-2 flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  AP
                </div>

                <div>
                  <h3 className="font-bold">
                    {product.seller}
                  </h3>

                  <p className="text-sm font-semibold text-blue-600">
                    ✓ Verified Seller
                  </p>
                </div>

              </div>

            </div>

            {/* ACTIONS */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">

              <button className="rounded-xl bg-blue-600 px-6 py-4 font-bold text-white hover:bg-blue-700">
                Contact Seller
              </button>

              <button className="rounded-xl border-2 border-blue-600 px-6 py-4 font-bold text-blue-600 hover:bg-blue-50">
                Buy / Make Offer
              </button>

            </div>

            {/* DELIVERY */}
            <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-5">

              <h3 className="font-bold text-blue-700">
                🚚 Delivery Available
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                Delivery can be arranged using your pinned
                location. Tracking integration will be added
                to the marketplace.
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
