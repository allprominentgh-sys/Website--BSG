"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SellerType = "company" | "individual";

const categoryData: Record<string, string[]> = {
  Vehicles: [
    "Cars",
    "SUVs",
    "Trucks",
    "Buses",
    "Motorcycles",
    "Commercial Vehicles",
    "Vehicle Parts",
    "Vehicle Accessories",
  ],

  Property: [
    "Houses",
    "Apartments",
    "Land",
    "Commercial Property",
    "Office Space",
    "Warehouses",
    "Shops",
    "Rentals",
  ],

  Electronics: [
    "Phones",
    "Laptops",
    "Televisions",
    "Computers",
    "Cameras",
    "Audio Equipment",
    "Accessories",
    "Other Electronics",
  ],

  Machinery: [
    "Industrial Machinery",
    "Printing Equipment",
    "Construction Equipment",
    "Generators",
    "Factory Equipment",
    "Agricultural Machinery",
    "Tools",
    "Spare Parts",
  ],

  Agriculture: [
    "Tractors",
    "Farm Equipment",
    "Irrigation",
    "Livestock",
    "Poultry",
    "Seeds",
    "Fertilizer",
    "Agricultural Products",
  ],

  Services: [
    "Business Services",
    "Construction",
    "Transport",
    "Delivery",
    "Graphic Design",
    "Repairs",
    "Professional Services",
    "Other Services",
  ],
};

const regions = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Western North",
  "Central",
  "Eastern",
  "Volta",
  "Oti",
  "Northern",
  "Savannah",
  "North East",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
];

export default function SellPage() {
  const [sellerType, setSellerType] =
    useState<SellerType>("individual");

  const [category, setCategory] = useState("");

  const [subcategory, setSubcategory] = useState("");

  const [deliveryEnabled, setDeliveryEnabled] =
    useState(false);

  const [locationStatus, setLocationStatus] =
    useState("");

  const [latitude, setLatitude] = useState("");

  const [longitude, setLongitude] = useState("");

  const subcategories = useMemo(() => {
    return category ? categoryData[category] || [] : [];
  }, [category]);

  function handleCategoryChange(value: string) {
    setCategory(value);
    setSubcategory("");
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationStatus(
        "Location services are not supported on this device."
      );
      return;
    }

    setLocationStatus("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));

        setLocationStatus(
          "Your location has been captured."
        );
      },
      () => {
        setLocationStatus(
          "Unable to get your location. Please allow location access."
        );
      }
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-2xl shadow-md">
              ⭐
            </div>

            <div>
              <div className="text-lg font-black tracking-tight text-slate-900">
                BEST SALES GHANA
              </div>

              <div className="text-xs text-slate-500">
                Buy • Sell • Advertise • Connect
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="font-bold text-blue-700 hover:text-blue-900"
          >
            ← Home
          </Link>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-400 text-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">
            Sell on BEST SALES GHANA
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Create Your Listing
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/90">
            Post your product, vehicle, property, machinery or
            service and connect with buyers across Ghana.
          </p>

        </div>
      </section>

      {/* FORM */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

        <form className="space-y-8">

          {/* SELLER TYPE */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <h2 className="text-2xl font-black text-slate-900">
              1. Seller Information
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Tell buyers whether you are selling as a company
              or individual.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <button
                type="button"
                onClick={() => {
                  setSellerType("company");
                  setDeliveryEnabled(true);
                }}
                className={`rounded-2xl border-2 p-6 text-left transition ${
                  sellerType === "company"
                    ? "border-blue-700 bg-blue-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="text-3xl">
                  🏢
                </div>

                <div className="mt-3 text-xl font-black text-slate-900">
                  Company
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Business, shop, dealer or registered company.
                </p>

              </button>

              <button
                type="button"
                onClick={() => {
                  setSellerType("individual");
                  setDeliveryEnabled(false);
                }}
                className={`rounded-2xl border-2 p-6 text-left transition ${
                  sellerType === "individual"
                    ? "border-blue-700 bg-blue-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="text-3xl">
                  👤
                </div>

                <div className="mt-3 text-xl font-black text-slate-900">
                  Individual
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Private seller listing an item.
                </p>

              </button>

            </div>

          </div>

          {/* CATEGORY */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <h2 className="text-2xl font-black text-slate-900">
              2. Category
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select a main category and then a more specific
              subcategory.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Main Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    handleCategoryChange(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 outline-none focus:border-blue-700"
                  required
                >
                  <option value="">
                    Select category
                  </option>

                  {Object.keys(categoryData).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Subcategory
                </label>

                <select
                  value={subcategory}
                  onChange={(e) =>
                    setSubcategory(e.target.value)
                  }
                  disabled={!category}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 outline-none disabled:bg-slate-100 focus:border-blue-700"
                  required
                >
                  <option value="">
                    {category
                      ? "Select subcategory"
                      : "Select category first"}
                  </option>

                  {subcategories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

            </div>

          </div>

          {/* ITEM DETAILS */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <h2 className="text-2xl font-black text-slate-900">
              3. Listing Details
            </h2>

            <div className="mt-6 space-y-5">

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Listing Title
                </label>

                <input
                  type="text"
                  placeholder="Example: Toyota Corolla 2020"
                  className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none focus:border-blue-700"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Description
                </label>

                <textarea
                  rows={6}
                  placeholder="Describe your item, condition, specifications and other important information..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none focus:border-blue-700"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Price (GH₵)
                  </label>

                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none focus:border-blue-700"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Item Condition
                  </label>

                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 outline-none focus:border-blue-700"
                    required
                  >
                    <option value="">
                      Select condition
                    </option>
                    <option>Brand New</option>
                    <option>Used - Like New</option>
                    <option>Used - Good</option>
                    <option>Used - Fair</option>
                    <option>For Parts / Repair</option>
                  </select>
                </div>

              </div>

            </div>

          </div>

          {/* LOCATION */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <h2 className="text-2xl font-black text-slate-900">
              4. Ghana Location
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Buyers will use this information to know where the
              item is located.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Region
                </label>

                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 outline-none focus:border-blue-700"
                  required
                >
                  <option value="">
                    Select region
                  </option>

                  {regions.map((region) => (
                    <option key={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  City / Town
                </label>

                <input
                  type="text"
                  placeholder="Example: Accra"
                  className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none focus:border-blue-700"
                  required
                />
              </div>

            </div>

            {/* GHANA POST GPS */}
            <div className="mt-5">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Ghana Post GPS Address
              </label>

              <input
                type="text"
                placeholder="Example: GA-123-4567"
                className="w-full rounded-xl border border-slate-300 px-4 py-4 uppercase outline-none focus:border-blue-700"
              />

              <p className="mt-2 text-xs text-slate-500">
                Enter the Ghana Post GPS digital address for the
                item's exact location.
              </p>

            </div>

            {/* GPS LOCATION */}
            <div className="mt-6 rounded-2xl bg-blue-50 p-5">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                  <div className="font-black text-slate-900">
                    📍 Exact GPS Location
                  </div>

                  <p className="mt-1 text-sm text-slate-600">
                    Allow BEST SALES GHANA to capture your
                    current location.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={useMyLocation}
                  className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
                >
                  Use My Location
                </button>

              </div>

              {locationStatus && (
                <p className="mt-4 text-sm font-semibold text-blue-700">
                  {locationStatus}
                </p>
              )}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">

                <input
                  type="text"
                  value={latitude}
                  onChange={(e) =>
                    setLatitude(e.target.value)
                  }
                  placeholder="Latitude"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3"
                />

                <input
                  type="text"
                  value={longitude}
                  onChange={(e) =>
                    setLongitude(e.target.value)
                  }
                  placeholder="Longitude"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3"
                />

              </div>

            </div>

          </div>

          {/* DELIVERY */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <h2 className="text-2xl font-black text-slate-900">
              5. Delivery
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Choose how buyers can receive their items.
            </p>

            {sellerType === "company" ? (
              <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">

                <div className="flex gap-4">

                  <div className="text-3xl">
                    🚚
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900">
                      BEST SALES GHANA Delivery
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Company sellers can use the BEST SALES
                      GHANA delivery system. Orders can be
                      assigned a tracking number so the buyer
                      can follow the delivery.
                    </p>

                    <div className="mt-4 inline-flex rounded-full bg-blue-700 px-4 py-2 text-xs font-black text-white">
                      DELIVERY ENABLED
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="mt-6 space-y-4">

                <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 p-5">

                  <input
                    type="checkbox"
                    checked={deliveryEnabled}
                    onChange={(e) =>
                      setDeliveryEnabled(e.target.checked)
                    }
                    className="mt-1 h-5 w-5"
                  />

                  <div>
                    <div className="font-black text-slate-900">
                      🚚 Offer BEST SALES GHANA Delivery
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      Individual sellers can optionally allow
                      buyers to choose our delivery service.
                    </p>
                  </div>

                </label>

                <div className="rounded-2xl bg-slate-50 p-5">

                  <p className="text-sm leading-6 text-slate-600">
                    When the buyer chooses BEST SALES GHANA
                    Delivery, the order can be collected,
                    assigned a tracking number and tracked
                    until delivery.
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* TRACKING */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <h2 className="text-2xl font-black text-slate-900">
              6. Order Tracking
            </h2>

            <div className="mt-5 rounded-2xl bg-slate-950 p-6 text-white">

              <div className="text-3xl">
                📦
              </div>

              <h3 className="mt-3 text-xl font-black">
                Tracking Number
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/70">
                A tracking number will be generated for orders
                using BEST SALES GHANA Delivery.
              </p>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">

                <div className="text-xs uppercase tracking-widest text-cyan-400">
                  Example
                </div>

                <div className="mt-2 font-mono text-lg font-bold">
                  BSG-2026-000001
                </div>

              </div>

            </div>

          </div>

          {/* SUBMIT */}
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">

            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

              <div>
                <h2 className="text-2xl font-black">
                  Ready to publish?
                </h2>

                <p className="mt-2 text-sm text-white/60">
                  Your listing will be submitted for processing.
                </p>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-8 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-cyan-400 hover:text-slate-950"
              >
                Publish Listing →
              </button>

            </div>

          </div>

        </form>

      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-10 text-center text-white">

        <div className="text-xl font-black">
          BEST SALES GHANA
        </div>

        <p className="mt-2 text-sm text-slate-400">
          Buy • Sell • Advertise • Connect
        </p>

        <p className="mt-5 text-sm text-slate-500">
          © 2026 All Prominent Ghana Limited. All rights reserved.
        </p>

      </footer>

    </main>
  );
}
