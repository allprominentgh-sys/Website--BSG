"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Category = {
  name: string;
  subcategories: string[];
};

const categories: Category[] = [
  {
    name: "Vehicles",
    subcategories: [
      "Cars",
      "SUVs",
      "Pickup Trucks",
      "Trucks",
      "Buses",
      "Motorcycles",
      "Commercial Vehicles",
      "Trailers",
      "Vehicle Parts",
      "Vehicle Accessories",
      "Car Rentals",
      "Other Vehicles",
    ],
  },
  {
    name: "Property",
    subcategories: [
      "Houses for Sale",
      "Houses for Rent",
      "Apartments",
      "Rooms",
      "Office Spaces",
      "Shops",
      "Warehouses",
      "Industrial Property",
      "Land",
      "Commercial Land",
      "Farm Land",
      "Hotels",
      "Guest Houses",
      "Other Property",
    ],
  },
  {
    name: "Electronics",
    subcategories: [
      "Mobile Phones",
      "Tablets",
      "Laptops",
      "Desktop Computers",
      "Televisions",
      "Cameras",
      "Audio Equipment",
      "Printers",
      "Gaming",
      "Networking Equipment",
      "Computer Accessories",
      "Other Electronics",
    ],
  },
  {
    name: "Machinery",
    subcategories: [
      "Industrial Machinery",
      "Printing Equipment",
      "DTF Printing Machines",
      "DTG Printing Machines",
      "UV Printing Machines",
      "Laser Machines",
      "CNC Machines",
      "Construction Equipment",
      "Excavators",
      "Generators",
      "Compressors",
      "Welding Machines",
      "Factory Equipment",
      "Tools",
      "Other Machinery",
    ],
  },
  {
    name: "Agriculture",
    subcategories: [
      "Tractors",
      "Farm Machinery",
      "Irrigation Equipment",
      "Poultry Equipment",
      "Livestock Equipment",
      "Processing Machines",
      "Harvesting Equipment",
      "Planting Equipment",
      "Greenhouse Equipment",
      "Animal Feed",
      "Seeds",
      "Fertilizer",
      "Livestock",
      "Farm Produce",
      "Other Agriculture",
    ],
  },
  {
    name: "Services",
    subcategories: [
      "Construction",
      "Graphic Design",
      "Printing Services",
      "Transport",
      "Delivery",
      "Cleaning",
      "Repairs",
      "IT Services",
      "Marketing",
      "Business Consulting",
      "Photography",
      "Events",
      "Security",
      "Professional Services",
      "Other Services",
    ],
  },
  {
    name: "Fashion",
    subcategories: [
      "Men's Clothing",
      "Women's Clothing",
      "Children's Clothing",
      "Shoes",
      "Bags",
      "Watches",
      "Jewelry",
      "Accessories",
      "Traditional Wear",
      "Other Fashion",
    ],
  },
  {
    name: "Home & Garden",
    subcategories: [
      "Furniture",
      "Kitchen Equipment",
      "Home Appliances",
      "Garden Equipment",
      "Decorations",
      "Building Materials",
      "Lighting",
      "Mattresses",
      "Other Home & Garden",
    ],
  },
  {
    name: "Jobs & Business",
    subcategories: [
      "Jobs",
      "Business Opportunities",
      "Companies for Sale",
      "Franchises",
      "Investments",
      "Partnerships",
      "Business Equipment",
      "Other Business",
    ],
  },
];

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
  const [sellerType, setSellerType] = useState<
    "individual" | "company"
  >("individual");

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");

  const [deliveryOption, setDeliveryOption] = useState<
    "our-delivery" | "seller-delivery" | "pickup"
  >("our-delivery");

  const [trackingNumber, setTrackingNumber] = useState("");

  const [publishing, setPublishing] = useState(false);

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (item) => item.name === category
      ),
    [category]
  );

  function handleCategoryChange(value: string) {
    setCategory(value);
    setSubcategory("");
  }

  function generateTrackingNumber() {
    const random = Math.floor(
      100000 + Math.random() * 900000
    );

    const generated = `BSG-${new Date().getFullYear()}-${random}`;

    setTrackingNumber(generated);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (publishing) {
      return;
    }

    setPublishing(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      const supabase = supabaseBrowser();

      // --------------------------------------------------
      // CHECK LOGIN
      // --------------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert(
          "Please log in before publishing a listing."
        );

        setPublishing(false);
        return;
      }

      // --------------------------------------------------
      // GET FORM VALUES
      // --------------------------------------------------

      const title = String(
        formData.get("title") || ""
      ).trim();

      const description = String(
        formData.get("description") || ""
      ).trim();

      const priceValue = String(
        formData.get("price") || ""
      ).trim();

      const price = Number(priceValue);

      const currencyCode = String(
        formData.get("currency") || "GHS"
      ).trim();

      const region = String(
        formData.get("region") || ""
      ).trim();

      const city = String(
        formData.get("city") || ""
      ).trim();

      const ghanaPostGps = String(
        formData.get("ghanaPostGps") || ""
      ).trim();

      const locationDetails = String(
        formData.get("locationDetails") || ""
      ).trim();

      // --------------------------------------------------
      // VALIDATION
      // --------------------------------------------------

      if (!title) {
        alert("Please enter an advertisement title.");
        setPublishing(false);
        return;
      }

      if (!description) {
        alert("Please enter a description.");
        setPublishing(false);
        return;
      }

      if (!category) {
        alert("Please select a main category.");
        setPublishing(false);
        return;
      }

      if (!subcategory) {
        alert("Please select a subcategory.");
        setPublishing(false);
        return;
      }

      if (!priceValue || price <= 0) {
        alert("Please enter a valid price.");
        setPublishing(false);
        return;
      }

      if (!region) {
        alert("Please select a region.");
        setPublishing(false);
        return;
      }

      if (!city) {
        alert("Please enter the city or town.");
        setPublishing(false);
        return;
      }

      if (!ghanaPostGps) {
        alert("Please enter your GhanaPost GPS address.");
        setPublishing(false);
        return;
      }

      // --------------------------------------------------
      // CREATE LOCATION
      // --------------------------------------------------

      const location = [
        region,
        city,
        ghanaPostGps,
        locationDetails,
      ]
        .filter(Boolean)
        .join(", ");

      // --------------------------------------------------
      // CREATE LISTING
      // --------------------------------------------------

      const { data: listing, error } = await supabase
        .from("listings")
        .insert({
          seller_id: user.id,
          title,
          description,
          price,
          currency_code: currencyCode,
          location,
          status: "active",
          featured: false,
          category,
          subcategory,
          currency: currencyCode,
        })
        .select()
        .single();

      // --------------------------------------------------
      // HANDLE DATABASE ERROR
      // --------------------------------------------------

      if (error) {
        console.error(
          "LISTING INSERT ERROR:",
          error
        );

        alert(
          `Unable to publish listing: ${error.message}`
        );

        setPublishing(false);
        return;
      }

      // --------------------------------------------------
      // SUCCESS
      // --------------------------------------------------

      console.log(
        "LISTING CREATED:",
        listing
      );

      alert(
        "Listing published successfully!"
      );

      window.location.href =
        "/dashboard/listings";
    } catch (error) {
      console.error(
        "PUBLISH LISTING ERROR:",
        error
      );

      alert(
        "Something went wrong while publishing your listing. Please try again."
      );

      setPublishing(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

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
              <div className="text-lg font-black tracking-tight">
                BEST SALES GHANA
              </div>

              <div className="text-xs text-slate-500">
                Buy • Sell • Advertise • Connect
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">

            <Link
              href="/"
              className="font-semibold text-slate-700 hover:text-blue-700"
            >
              Home
            </Link>

            <Link
              href="/categories"
              className="font-semibold text-slate-700 hover:text-blue-700"
            >
              Categories
            </Link>

            <Link
              href="/listings"
              className="font-semibold text-slate-700 hover:text-blue-700"
            >
              Listings
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-blue-700 px-5 py-3 font-bold text-blue-700 hover:bg-blue-50"
            >
              Login
            </Link>

          </nav>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-400 text-white">

        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

          <Link
            href="/"
            className="font-bold text-cyan-100 hover:text-white"
          >
            ← Back to Marketplace
          </Link>

          <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-cyan-100">
            Sell on BEST SALES GHANA
          </p>

          <h1 className="mt-2 text-4xl font-black sm:text-5xl">
            Create a Listing
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/90">
            Advertise your product, vehicle, property,
            machinery or service and connect with buyers
            across Ghana.
          </p>

        </div>
      </section>

      {/* FORM */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          {/* STEP 1 */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-6">

              <p className="text-sm font-black uppercase tracking-widest text-blue-700">
                Step 1
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Seller Information
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Tell buyers whether you are selling as an
                individual or registered business.
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <button
                type="button"
                onClick={() =>
                  setSellerType("individual")
                }
                className={`rounded-2xl border-2 p-5 text-left transition ${
                  sellerType === "individual"
                    ? "border-blue-700 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300"
                }`}
              >

                <div className="text-3xl">
                  👤
                </div>

                <div className="mt-3 font-black">
                  Individual Seller
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  I am selling as an individual.
                </p>

              </button>

              <button
                type="button"
                onClick={() =>
                  setSellerType("company")
                }
                className={`rounded-2xl border-2 p-5 text-left transition ${
                  sellerType === "company"
                    ? "border-blue-700 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300"
                }`}
              >

                <div className="text-3xl">
                  🏢
                </div>

                <div className="mt-3 font-black">
                  Company / Business
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  I am selling on behalf of a company
                  or business.
                </p>

              </button>

            </div>

            {sellerType === "company" && (
              <div className="mt-5 rounded-2xl bg-blue-50 p-5">

                <label className="text-sm font-bold">
                  Company / Business Name
                </label>

                <input
                  name="companyName"
                  type="text"
                  placeholder="Enter company name"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-600"
                />

              </div>
            )}

          </section>

          {/* STEP 2 */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-6">

              <p className="text-sm font-black uppercase tracking-widest text-blue-700">
                Step 2
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Product / Advertisement
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Select a broad category first, then select
                the appropriate subcategory.
              </p>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* CATEGORY */}
              <div>

                <label className="text-sm font-bold">
                  Main Category *
                </label>

                <select
                  required
                  value={category}
                  onChange={(e) =>
                    handleCategoryChange(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-600"
                >

                  <option value="">
                    Select category
                  </option>

                  {categories.map((item) => (
                    <option
                      key={item.name}
                      value={item.name}
                    >
                      {item.name}
                    </option>
                  ))}

                </select>

              </div>

              {/* SUBCATEGORY */}
              <div>

                <label className="text-sm font-bold">
                  Subcategory *
                </label>

                <select
                  required
                  value={subcategory}
                  onChange={(e) =>
                    setSubcategory(
                      e.target.value
                    )
                  }
                  disabled={!selectedCategory}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none disabled:bg-slate-100 focus:border-blue-600"
                >

                  <option value="">
                    {selectedCategory
                      ? "Select subcategory"
                      : "Select category first"}
                  </option>

                  {selectedCategory?.subcategories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* TITLE */}
            <div className="mt-5">

              <label className="text-sm font-bold">
                Advertisement Title *
              </label>

              <input
                required
                name="title"
                type="text"
                placeholder="Example: Brand New DTF Printing Machine"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
              />

            </div>

            {/* DESCRIPTION */}
            <div className="mt-5">

              <label className="text-sm font-bold">
                Description *
              </label>

              <textarea
                required
                name="description"
                rows={6}
                placeholder="Describe the product, condition, specifications, features and other important information..."
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
              />

            </div>

            {/* PRICE */}
            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <div>

                <label className="text-sm font-bold">
                  Price *
                </label>

                <input
                  required
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
                />

              </div>

              <div>

                <label className="text-sm font-bold">
                  Currency
                </label>

                <select
                  name="currency"
                  defaultValue="GHS"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-600"
                >

                  <option value="GHS">
                    Ghana Cedi (GH₵)
                  </option>

                  <option value="USD">
                    US Dollar ($)
                  </option>

                  <option value="EUR">
                    Euro (€)
                  </option>

                  <option value="GBP">
                    British Pound (£)
                  </option>

                  <option value="CNY">
                    Chinese Yuan (¥)
                  </option>

                </select>

              </div>

            </div>

          </section>

          {/* STEP 3 */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-6">

              <p className="text-sm font-black uppercase tracking-widest text-blue-700">
                Step 3
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Location
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Buyers need an accurate location. GhanaPost
                GPS will be used to make delivery and location
                finding easier.
              </p>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>

                <label className="text-sm font-bold">
                  Region *
                </label>

                <select
                  required
                  name="region"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-600"
                >

                  <option value="">
                    Select region
                  </option>

                  {regions.map((region) => (
                    <option
                      key={region}
                      value={region}
                    >
                      {region}
                    </option>
                  ))}

                </select>

              </div>

              <div>

                <label className="text-sm font-bold">
                  City / Town *
                </label>

                <input
                  required
                  name="city"
                  type="text"
                  placeholder="Example: Accra"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
                />

              </div>

            </div>

            {/* GHANA POST GPS */}
            <div className="mt-5">

              <label className="text-sm font-bold">
                GhanaPost GPS Address *
              </label>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row">

                <input
                  required
                  name="ghanaPostGps"
                  type="text"
                  placeholder="Example: GA-123-4567"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 uppercase outline-none focus:border-blue-600"
                />

                <button
                  type="button"
                  className="shrink-0 rounded-xl border border-blue-700 px-5 py-3 font-bold text-blue-700 hover:bg-blue-50"
                  onClick={() =>
                    alert(
                      "GhanaPost GPS/map integration will be connected in the delivery and maps step."
                    )
                  }
                >
                  📍 Use My Location
                </button>

              </div>

              <p className="mt-2 text-xs text-slate-500">
                This address will help the delivery system
                locate the seller accurately.
              </p>

            </div>

            {/* EXACT ADDRESS */}
            <div className="mt-5">

              <label className="text-sm font-bold">
                Additional Location Details
              </label>

              <textarea
                name="locationDetails"
                rows={3}
                placeholder="House number, street, landmark, shop number, building name..."
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
              />

            </div>

          </section>

          {/* STEP 4 */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-6">

              <p className="text-sm font-black uppercase tracking-widest text-blue-700">
                Step 4
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Delivery Options
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                The seller can decide how the buyer receives
                the item.
              </p>

            </div>

            <div className="space-y-4">

              {/* OUR DELIVERY */}
              <button
                type="button"
                onClick={() =>
                  setDeliveryOption(
                    "our-delivery"
                  )
                }
                className={`w-full rounded-2xl border-2 p-5 text-left transition ${
                  deliveryOption ===
                  "our-delivery"
                    ? "border-blue-700 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300"
                }`}
              >

                <div className="flex items-start gap-4">

                  <div className="text-3xl">
                    🚚
                  </div>

                  <div>

                    <div className="font-black">
                      BEST SALES GHANA Delivery
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      Let our delivery system collect and
                      deliver the item to the buyer.
                    </p>

                    <p className="mt-2 text-sm font-bold text-blue-700">
                      ✓ Buyer can track delivery
                    </p>

                  </div>

                </div>

              </button>

              {/* SELLER DELIVERY */}
              <button
                type="button"
                onClick={() =>
                  setDeliveryOption(
                    "seller-delivery"
                  )
                }
                className={`w-full rounded-2xl border-2 p-5 text-left transition ${
                  deliveryOption ===
                  "seller-delivery"
                    ? "border-blue-700 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300"
                }`}
              >

                <div className="flex items-start gap-4">

                  <div className="text-3xl">
                    🏪
                  </div>

                  <div>

                    <div className="font-black">
                      Seller Handles Delivery
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      The seller or company will arrange
                      delivery directly with the buyer.
                    </p>

                  </div>

                </div>

              </button>

              {/* PICKUP */}
              <button
                type="button"
                onClick={() =>
                  setDeliveryOption("pickup")
                }
                className={`w-full rounded-2xl border-2 p-5 text-left transition ${
                  deliveryOption === "pickup"
                    ? "border-blue-700 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300"
                }`}
              >

                <div className="flex items-start gap-4">

                  <div className="text-3xl">
                    🤝
                  </div>

                  <div>

                    <div className="font-black">
                      Buyer Pickup
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      Buyer collects the item directly from
                      the seller.
                    </p>

                  </div>

                </div>

              </button>

            </div>

            {/* TRACKING */}
            {deliveryOption ===
              "our-delivery" && (
              <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">

                <div className="flex items-start gap-3">

                  <div className="text-2xl">
                    📦
                  </div>

                  <div>

                    <h3 className="font-black text-slate-900">
                      Delivery Tracking
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      When our delivery service receives
                      the item, a unique tracking number will
                      be attached to the order.
                    </p>

                  </div>

                </div>

                <div className="mt-5">

                  <label className="text-sm font-bold">
                    Tracking Number
                  </label>

                  <div className="mt-2 flex flex-col gap-3 sm:flex-row">

                    <input
                      value={trackingNumber}
                      onChange={(e) =>
                        setTrackingNumber(
                          e.target.value
                        )
                      }
                      name="trackingNumber"
                      type="text"
                      placeholder="Generated after delivery request"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-blue-600"
                    />

                    <button
                      type="button"
                      onClick={
                        generateTrackingNumber
                      }
                      className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
                    >
                      Generate
                    </button>

                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    In the final system, this number will be
                    generated automatically when a delivery
                    order is created.
                  </p>

                </div>

              </div>
            )}

          </section>

          {/* STEP 5 */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-6">

              <p className="text-sm font-black uppercase tracking-widest text-blue-700">
                Step 5
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Seller Contact
              </h2>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>

                <label className="text-sm font-bold">
                  Seller Name *
                </label>

                <input
                  required
                  name="sellerName"
                  type="text"
                  placeholder="Full name"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
                />

              </div>

              <div>

                <label className="text-sm font-bold">
                  Phone Number *
                </label>

                <input
                  required
                  name="phone"
                  type="tel"
                  placeholder="024 XXX XXXX"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
                />

              </div>

            </div>

            <div className="mt-5">

              <label className="text-sm font-bold">
                Email Address
              </label>

              <input
                name="email"
                type="email"
                placeholder="seller@example.com"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
              />

            </div>

          </section>

          {/* FINAL SUBMIT */}
          <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

              <div>

                <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
                  Almost Done
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Publish Your Advertisement
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Your listing will be saved to your seller
                  account and will appear in your dashboard.
                </p>

              </div>

              <button
                type="submit"
                disabled={publishing}
                className="shrink-0 rounded-xl bg-blue-600 px-8 py-4 font-black text-white shadow-lg transition hover:bg-cyan-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {publishing
                  ? "Publishing..."
                  : "Publish Listing →"}
              </button>

            </div>

          </section>

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
