"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const categories = {
  Vehicles: ["Cars", "Trucks", "Buses", "Motorcycles", "Other Vehicles"],
  Property: ["Houses", "Apartments", "Land", "Commercial Property"],
  Electronics: ["Phones", "Laptops", "Televisions", "Computers", "Accessories"],
  Machinery: [
    "Industrial Machinery",
    "Printing Equipment",
    "Construction Equipment",
    "Tools",
  ],
  Agriculture: [
    "Tractors",
    "Farm Equipment",
    "Irrigation",
    "Processing Machines",
    "Livestock",
  ],
  Services: [
    "Business Services",
    "Construction",
    "Transport",
    "Technical Services",
    "Other Services",
  ],
  Fashion: ["Men", "Women", "Children", "Shoes", "Accessories"],
  "Building Materials": [
    "Cement",
    "Steel",
    "Roofing",
    "Plumbing",
    "Electrical",
    "Other Materials",
  ],
};

export default function DirectSalesPage() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("GHS");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [stock, setStock] = useState("");
  const [location, setLocation] = useState("");
  const [ghanaPostGps, setGhanaPostGps] = useState("");
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [status, setStatus] = useState("Draft");
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  function handleImages(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (!files) return;

    const names = Array.from(files).map((file) => file.name);

    setImageNames(names);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!productName.trim()) {
      setMessage("Please enter a product name.");
      return;
    }

    if (!category) {
      setMessage("Please select a category.");
      return;
    }

    if (!subcategory) {
      setMessage("Please select a subcategory.");
      return;
    }

    if (!price.trim()) {
      setMessage("Please enter a price.");
      return;
    }

    setMessage(
      status === "Published"
        ? "Product is ready to be published."
        : "Product saved as a draft."
    );
  }

  const subcategories =
    category && category in categories
      ? categories[category as keyof typeof categories]
      : [];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-2xl shadow-md">
              ⭐
            </div>

            <div>
              <div className="text-lg font-black tracking-tight sm:text-xl">
                BEST SALES GHANA
              </div>

              <div className="text-xs text-slate-500">
                Admin • Direct Sales
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              ← Dashboard
            </Link>

            <Link
              href="/"
              className="hidden rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 sm:block"
            >
              View Website
            </Link>
          </div>
        </div>
      </header>

      {/* PAGE */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* TITLE */}
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-widest text-blue-700">
            Admin Dashboard
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            Direct Sales Products
          </h1>

          <p className="mt-3 max-w-3xl text-slate-500">
            Add and manage products owned and sold directly by Best Sales
            Ghana. Products will appear as normal marketplace listings when
            published. They will not be pinned.
          </p>
        </div>

        {/* NOTICE */}
        <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex gap-3">
            <div className="text-2xl">ℹ️</div>

            <div>
              <h2 className="font-black text-blue-900">
                Direct Sales Product
              </h2>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                These are your company&apos;s own products. You can manually
                add the product, change its price and pictures, update stock,
                and decide when it becomes visible on the marketplace.
              </p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            {/* LEFT */}
            <div className="space-y-8">
              {/* BASIC INFORMATION */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                    Step 1
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    Product Information
                  </h2>
                </div>

                <div className="space-y-5">
                  {/* PRODUCT NAME */}
                  <div>
                    <label className="mb-2 block text-sm font-black">
                      Product Name *
                    </label>

                    <input
                      type="text"
                      value={productName}
                      onChange={(event) =>
                        setProductName(event.target.value)
                      }
                      placeholder="Example: 1350C Cutting Plotter"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  {/* CATEGORY */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-black">
                        Category *
                      </label>

                      <select
                        value={category}
                        onChange={(event) => {
                          setCategory(event.target.value);
                          setSubcategory("");
                        }}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">Select category</option>

                        {Object.keys(categories).map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* SUBCATEGORY */}
                    <div>
                      <label className="mb-2 block text-sm font-black">
                        Subcategory *
                      </label>

                      <select
                        value={subcategory}
                        onChange={(event) =>
                          setSubcategory(event.target.value)
                        }
                        disabled={!category}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none disabled:bg-slate-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
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

                  {/* PRICE */}
                  <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
                    <div>
                      <label className="mb-2 block text-sm font-black">
                        Price *
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        placeholder="7800"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-black">
                        Currency
                      </label>

                      <select
                        value={currency}
                        onChange={(event) =>
                          setCurrency(event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="GHS">GHS — Ghana Cedi</option>
                        <option value="USD">USD — US Dollar</option>
                        <option value="EUR">EUR — Euro</option>
                        <option value="GBP">GBP — British Pound</option>
                        <option value="CNY">CNY — Chinese Yuan</option>
                        <option value="AED">AED — UAE Dirham</option>
                        <option value="NGN">NGN — Nigerian Naira</option>
                        <option value="XOF">XOF — CFA Franc</option>
                      </select>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <label className="mb-2 block text-sm font-black">
                      Product Description
                    </label>

                    <textarea
                      rows={5}
                      value={description}
                      onChange={(event) =>
                        setDescription(event.target.value)
                      }
                      placeholder="Describe the product, condition, use and important information..."
                      className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  {/* SPECIFICATIONS */}
                  <div>
                    <label className="mb-2 block text-sm font-black">
                      Specifications
                    </label>

                    <textarea
                      rows={7}
                      value={specifications}
                      onChange={(event) =>
                        setSpecifications(event.target.value)
                      }
                      placeholder={`Example:

Width: 1350mm
Cutting Speed: ...
Maximum Cutting Width: ...
Interface: USB
Voltage: 220V
Condition: New`}
                      className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      You can enter the specifications in the format that
                      best describes the product.
                    </p>
                  </div>
                </div>
              </section>

              {/* LOCATION */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                    Step 2
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    Location
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Add the physical location of your direct-sales product.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-black">
                      Location
                    </label>

                    <input
                      type="text"
                      value={location}
                      onChange={(event) =>
                        setLocation(event.target.value)
                      }
                      placeholder="Example: Accra, Ghana"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black">
                      Ghana Post GPS Address
                    </label>

                    <input
                      type="text"
                      value={ghanaPostGps}
                      onChange={(event) =>
                        setGhanaPostGps(event.target.value)
                      }
                      placeholder="Example: GA-123-4567"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      We will connect the actual Ghana Post GPS/location API
                      later. This field is ready for the integration.
                    </p>
                  </div>
                </div>
              </section>

              {/* DELIVERY */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                    Step 3
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    Delivery
                  </h2>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <label className="flex cursor-pointer items-start gap-4">
                    <input
                      type="checkbox"
                      checked={deliveryAvailable}
                      onChange={(event) =>
                        setDeliveryAvailable(event.target.checked)
                      }
                      className="mt-1 h-5 w-5 accent-blue-700"
                    />

                    <span>
                      <span className="block font-black">
                        Best Sales Ghana delivery available
                      </span>

                      <span className="mt-1 block text-sm leading-6 text-slate-500">
                        Customers can choose our delivery service for this
                        product and receive a delivery tracking number.
                      </span>
                    </span>
                  </label>
                </div>

                <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                  <p className="text-sm leading-6 text-cyan-900">
                    <strong>Important:</strong> The delivery system will later
                    support tracking so customers can follow their order from
                    pickup to delivery.
                  </p>
                </div>
              </section>
            </div>

            {/* RIGHT */}
            <aside className="space-y-6">
              {/* IMAGES */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                  Product Media
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Product Pictures
                </h2>

                <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <div className="text-4xl">📷</div>

                  <p className="mt-3 font-black">
                    Upload product pictures
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Add clear pictures of the product.
                  </p>

                  <label className="mt-4 inline-flex cursor-pointer rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800">
                    Choose Pictures

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImages}
                      className="hidden"
                    />
                  </label>
                </div>

                {imageNames.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-black">
                      Selected pictures
                    </p>

                    <div className="mt-2 space-y-2">
                      {imageNames.map((name) => (
                        <div
                          key={name}
                          className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"
                        >
                          📷 {name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* STOCK */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                  Inventory
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Stock
                </h2>

                <label className="mt-5 mb-2 block text-sm font-black">
                  Quantity
                </label>

                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </section>

              {/* STATUS */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                  Publishing
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Product Status
                </h2>

                <div className="mt-5 space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                    <input
                      type="radio"
                      name="status"
                      value="Draft"
                      checked={status === "Draft"}
                      onChange={(event) => setStatus(event.target.value)}
                      className="h-4 w-4 accent-blue-700"
                    />

                    <div>
                      <div className="font-black">
                        Draft
                      </div>

                      <div className="text-xs text-slate-500">
                        Not visible to customers
                      </div>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                    <input
                      type="radio"
                      name="status"
                      value="Published"
                      checked={status === "Published"}
                      onChange={(event) => setStatus(event.target.value)}
                      className="h-4 w-4 accent-green-600"
                    />

                    <div>
                      <div className="font-black text-green-800">
                        Published
                      </div>

                      <div className="text-xs text-green-700">
                        Visible on the marketplace
                      </div>
                    </div>
                  </label>
                </div>
              </section>

              {/* SAVE */}
              <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
                <h2 className="text-xl font-black">
                  Save Product
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Save the product as a draft or publish it to the normal
                  marketplace listings.
                </p>

                <button
                  type="submit"
                  className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-4 font-black text-white transition hover:bg-cyan-400 hover:text-slate-950"
                >
                  {status === "Published"
                    ? "Publish Product"
                    : "Save Draft"}
                </button>

                {message && (
                  <div className="mt-4 rounded-xl bg-white/10 p-4 text-sm font-bold text-white">
                    {message}
                  </div>
                )}
              </section>
            </aside>
          </div>
        </form>
      </section>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-200 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">
          <p className="font-black text-white">
            BEST SALES GHANA — DIRECT SALES
          </p>

          <p className="mt-2 text-sm text-slate-500">
            © {new Date().getFullYear()} All Prominent Ghana Limited. All
            rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
