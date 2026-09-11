"use client";

import Link from "next/link";
import { useState } from "react";

const categories = [
  "Phones & Tablets",
  "Cars & Vehicles",
  "Property",
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Agriculture",
  "Jobs & Services",
];

export default function PostAdPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);

  const generateDescription = () => {
    if (!title) {
      setDescription(
        "Enter a product or service title first, then use AI Description."
      );
      return;
    }

    setDescription(
      `${title} is available on All Prominent Ghana. ${
        category ? `This listing is in the ${category} category. ` : ""
      }${
        price ? `The asking price is GH₵${price}. ` : ""
      }${
        location ? `The item is located in ${location}. ` : ""
      }Contact the seller for availability, additional details, viewing and delivery arrangements.`
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-white">
              AP
            </div>

            <div>
              <div className="font-extrabold text-blue-700">
                ALL PROMINENT
              </div>
              <div className="text-xs text-slate-500">
                GHANA LIMITED
              </div>
            </div>
          </Link>

          <Link
            href="/listings"
            className="font-bold text-blue-600"
          >
            ← Marketplace
          </Link>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-700 to-sky-500 px-4 py-12">
        <div className="mx-auto max-w-4xl text-white">

          <p className="font-bold text-blue-100">
            SELL ON ALL PROMINENT
          </p>

          <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">
            Create your listing
          </h1>

          <p className="mt-3 max-w-2xl text-blue-50">
            Put your product, service, property or vehicle in front
            of customers across Ghana.
          </p>

        </div>
      </section>

      {/* FORM */}
      <section className="mx-auto max-w-4xl px-4 py-10">

        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold">
              Listing information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Complete the information below.
            </p>
          </div>

          {/* TITLE */}
          <div>
            <label className="text-sm font-bold">
              Product / Service title
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. iPhone 15 Pro 256GB"
              className="mt-2 w-full rounded-xl border bg-slate-50 px-4 py-4 outline-none focus:border-blue-500"
            />
          </div>

          {/* CATEGORY + PRICE */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <div>
              <label className="text-sm font-bold">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-xl border bg-slate-50 px-4 py-4 outline-none focus:border-blue-500"
              >
                <option value="">
                  Select category
                </option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold">
                Price (GH₵)
              </label>

              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="mt-2 w-full rounded-xl border bg-slate-50 px-4 py-4 outline-none focus:border-blue-500"
              />
            </div>

          </div>

          {/* LOCATION */}
          <div className="mt-6">

            <label className="text-sm font-bold">
              Location
            </label>

            <div className="mt-2 flex gap-2">

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Accra, East Legon"
                className="min-w-0 flex-1 rounded-xl border bg-slate-50 px-4 py-4 outline-none focus:border-blue-500"
              />

              <button
                type="button"
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 font-bold text-blue-600"
              >
                📍 Pin
              </button>

            </div>

            <p className="mt-2 text-xs text-slate-400">
              Location pin and live map integration will be connected
              to the delivery system later.
            </p>

          </div>

          {/* PHOTOS */}
          <div className="mt-6">

            <label className="text-sm font-bold">
              Product photos
            </label>

            <div className="mt-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">

              <div className="text-4xl">
                📷
              </div>

              <p className="mt-3 font-bold">
                Add photos of your item
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Upload clear photos that show the product properly.
              </p>

              <button
                type="button"
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
              >
                Choose Photos
              </button>

            </div>

          </div>

          {/* DESCRIPTION */}
          <div className="mt-6">

            <div className="flex items-center justify-between gap-3">

              <label className="text-sm font-bold">
                Description
              </label>

              <button
                type="button"
                onClick={generateDescription}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-sm font-bold text-white"
              >
                🤖 AI Description
              </button>

            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={7}
              placeholder="Describe your product, condition, features and other important information..."
              className="mt-2 w-full resize-none rounded-xl border bg-slate-50 px-4 py-4 outline-none focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-slate-400">
              AI assistance will later be connected to an AI service
              to generate richer descriptions automatically.
            </p>

          </div>

          {/* TOP AD */}
          <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">

            <div className="flex items-start gap-4">

              <div className="text-3xl">
                ⭐
              </div>

              <div className="flex-1">

                <h3 className="font-extrabold text-blue-800">
                  Promote this listing
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Put your listing in prominent positions and reach
                  more potential customers.
                </p>

                <label className="mt-4 flex cursor-pointer items-center gap-3">

                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) =>
                      setFeatured(e.target.checked)
                    }
                    className="h-5 w-5 accent-blue-600"
                  />

                  <span className="font-bold">
                    Add Top Ads promotion
                  </span>

                </label>

              </div>

            </div>

          </div>

          {/* SELLER INFORMATION */}
          <div className="mt-8 rounded-2xl bg-slate-50 p-5">

            <h3 className="font-extrabold">
              Seller information
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Customers will see your seller profile with the listing.
            </p>

            <div className="mt-4 flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                AP
              </div>

              <div>
                <p className="font-bold">
                  Your account
                </p>

                <p className="text-sm text-slate-500">
                  ✓ Verification available
                </p>
              </div>

            </div>

          </div>

          {/* SUBMIT */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              href="/listings"
              className="rounded-xl border px-6 py-4 text-center font-bold text-slate-600"
            >
              Cancel
            </Link>

            <button
              type="button"
              className="rounded-xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700"
            >
              Publish Listing →
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}
