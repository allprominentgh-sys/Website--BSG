"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Listing = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  currency_code: string | null;
  location: string | null;
  featured: boolean;
};

export default function ListingPage() {
  const params = useParams();
  const id = params?.id;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Temporary listing data.
    // This removes the broken Supabase dependency so the site can build.
    const demoListings: Listing[] = [
      {
        id: 1,
        title: "iPhone 15 Pro",
        description:
          "Clean and fairly used iPhone 15 Pro available in Ghana.",
        price: 8500,
        currency_code: "GHS",
        location: "Accra, Ghana",
        featured: true,
      },
      {
        id: 2,
        title: "Toyota Camry",
        description:
          "Reliable Toyota Camry available for sale.",
        price: 180000,
        currency_code: "GHS",
        location: "Accra, Ghana",
        featured: true,
      },
      {
        id: 3,
        title: "Modern House",
        description:
          "Beautiful property available for sale in Ghana.",
        price: 950000,
        currency_code: "GHS",
        location: "East Legon, Accra",
        featured: false,
      },
    ];

    const found = demoListings.find(
      (item) => String(item.id) === String(id)
    );

    setListing(found || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading listing...
        </p>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <Link
              href="/"
              className="text-2xl font-black text-green-700"
            >
              ALL PROMINENT GHANA
            </Link>
          </div>
        </header>

        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="bg-white rounded-2xl shadow-sm border p-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Listing not found
            </h1>

            <p className="text-gray-600 mb-8">
              The listing you are looking for does not exist.
            </p>

            <Link
              href="/"
              className="inline-block bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Back to Marketplace
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const currency = listing.currency_code || "GHS";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-6">
          <Link
            href="/"
            className="text-xl md:text-2xl font-black text-green-700 whitespace-nowrap"
          >
            ALL PROMINENT GHANA
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-green-700 font-medium"
            >
              Home
            </Link>

            <Link
              href="/"
              className="text-gray-700 hover:text-green-700 font-medium"
            >
              Marketplace
            </Link>

            <Link
              href="/"
              className="text-gray-700 hover:text-green-700 font-medium"
            >
              Post an Ad
            </Link>
          </nav>
        </div>
      </header>

      {/* CONTENT */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-green-700 font-semibold mb-8"
        >
          ← Back to Marketplace
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* IMAGE PLACEHOLDER */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="text-7xl mb-4">🛍️</div>

                <p className="text-gray-500">
                  Product image
                </p>
              </div>
            </div>
          </div>

          {/* LISTING DETAILS */}
          <div className="bg-white rounded-2xl border shadow-sm p-8">
            {listing.featured && (
              <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold mb-4">
                FEATURED
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-5">
              {listing.title}
            </h1>

            <div className="text-3xl font-black text-green-700 mb-6">
              {currency}{" "}
              {listing.price.toLocaleString()}
            </div>

            <div className="border-t border-b py-5 mb-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Location
                </p>

                <p className="font-semibold text-gray-900">
                  📍 {listing.location || "Ghana"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Listing ID
                </p>

                <p className="font-semibold text-gray-900">
                  #{listing.id}
                </p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Description
            </h2>

            <p className="text-gray-600 leading-7 mb-8">
              {listing.description ||
                "No description has been provided for this listing."}
            </p>

            <div className="grid gap-3">
              <button
                type="button"
                className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-bold text-lg"
                onClick={() => {
                  alert(
                    "Seller contact feature will be connected next."
                  );
                }}
              >
                Contact Seller
              </button>

              <button
                type="button"
                className="w-full border-2 border-green-700 text-green-700 hover:bg-green-50 py-4 rounded-xl font-bold"
                onClick={() => {
                  alert(
                    "Save listing feature will be connected next."
                  );
                }}
              >
                ♡ Save Listing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h2 className="text-xl font-bold mb-2">
            ALL PROMINENT GHANA
          </h2>

          <p className="text-gray-400">
            Buy • Sell • Advertise • Connect
          </p>

          <p className="text-gray-500 text-sm mt-6">
            © {new Date().getFullYear()} All Prominent Ghana.
            All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
