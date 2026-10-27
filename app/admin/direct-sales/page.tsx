"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

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
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [status, setStatus] = useState("Draft");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const previews = selectedImages.map((file) =>
      URL.createObjectURL(file)
    );

    setImagePreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedImages]);

  function handleImages(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const validImages = files.filter((file) =>
      file.type.startsWith("image/")
    );
    const oversized = validImages.some((file) => file.size > 10 * 1024 * 1024);

    setSelectedImages(validImages);
    event.target.value = "";

    if (files.length !== validImages.length) {
      setMessage("Some files were skipped. Please select image files only.");
    } else if (oversized) {
      setMessage("Each image must be 10 MB or smaller. Please select smaller images.");
      setSelectedImages([]);
    } else {
      setMessage("");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

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

    if (!price.trim() || !Number.isFinite(Number(price)) || Number(price) <= 0) {
      setMessage("Please enter a valid price greater than zero.");
      return;
    }

    if (stock.trim() && (!Number.isInteger(Number(stock)) || Number(stock) < 0)) {
      setMessage("Please enter a valid whole number for stock.");
      return;
    }

    setMessage(
      status === "Published"
        ? "Publishing is not connected yet. No product has been published or saved. The existing product API must be connected first."
        : "Saving drafts is not connected yet. No product has been saved. The existing product API must be connected first."
    );
  }

  const subcategories =
    category && category in categories
      ? categories[category as keyof typeof categories]
      : [];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-700 text-2xl shadow-md">
              ⭐
            </div>
            <div className="min-w-0">
              <div className="text-base font-black tracking-tight sm:text-xl">
                BEST SALES GHANA
              </div>
              <div className="text-xs text-slate-500">
                Admin • Direct Sales
              </div>
            </div>
          </Link>

          <Link
            href="/admin"
            className="shrink-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 sm:px-4"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-widest text-blue-700">
            Admin Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
            Direct Sales Products
          </h1>
          <p className="mt-3 max-w-3xl text-slate-500">
            Add and manage products owned and sold directly by Best Sales
            Ghana. These products are intended to appear as normal marketplace
            listings when successfully published.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex gap-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <h2 className="font-black text-blue-900">
                Direct Sales Product
              </h2>
              <p className="mt-1 text-sm leading-6 text-blue-800">
                Manage your company products, prices, pictures, stock and
                publication status here.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-8">
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
                  <div>
                    <label htmlFor="productName" className="mb-2 block text-sm font-black">
                      Product Name *
                    </label>
                    <input
                      id="productName"
                      required
                      type="text"
                      value={productName}
                      onChange={(event) => setProductName(event.target.value)}
                      placeholder="Example: 1350C Cutting Plotter"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="category" className="mb-2 block text-sm font-black">
                        Category *
                      </label>
                      <select
                        id="category"
                        required
                        value={category}
                        onChange={(event) => {
                          setCategory(event.target.value);
                          setSubcategory("");
                        }}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                      >
                        <option value="">Select category</option>
                        {Object.keys(categories).map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="subcategory" className="mb-2 block text-sm font-black">
                        Subcategory *
                      </label>
                      <select
                        id="subcategory"
                        required
                        value={subcategory}
                        onChange={(event) => setSubcategory(event.target.value)}
                        disabled={!category}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 disabled:bg-slate-100"
                      >
                        <option value="">
                          {category ? "Select subcategory" : "Select category first"}
                        </option>
                        {subcategories.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
                    <div>
                      <label htmlFor="price" className="mb-2 block text-sm font-black">
                        Price *
                      </label>
                      <input
                        id="price"
                        required
                        type="number"
                        min="0.01"
                        step="any"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        placeholder="7800"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3"
                      />
                    </div>
                    <div>
                      <label htmlFor="currency" className="mb-2 block text-sm font-black">
                        Currency
                      </label>
                      <select
                        id="currency"
                        value={currency}
                        onChange={(event) => setCurrency(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
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

                  <div>
                    <label htmlFor="description" className="mb-2 block text-sm font-black">
                      Product Description
                    </label>
                    <textarea
                      id="description"
                      rows={5}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Describe the product, condition, use and important information..."
                      className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label htmlFor="specifications" className="mb-2 block text-sm font-black">
                      Specifications
                    </label>
                    <textarea
                      id="specifications"
                      rows={7}
                      value={specifications}
                      onChange={(event) => setSpecifications(event.target.value)}
                      placeholder={`Example:\n\nWidth: 1350mm\nCutting Speed: ...\nMaximum Cutting Width: ...\nInterface: USB\nVoltage: 220V\nCondition: New`}
                      className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Enter the specifications in the format that best describes the product.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                    Step 2
                  </p>
                  <h2 className="mt-1 text-2xl font-black">Delivery</h2>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <label className="flex cursor-pointer items-start gap-4">
                    <input
                      type="checkbox"
                      checked={deliveryAvailable}
                      onChange={(event) => setDeliveryAvailable(event.target.checked)}
                      className="mt-1 h-5 w-5 accent-blue-700"
                    />
                    <span>
                      <span className="block font-black">
                        Best Sales Ghana delivery available
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-500">
                        Customers may choose the company delivery service for this product.
                      </span>
                    </span>
                  </label>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                  Product Media
                </p>
                <h2 className="mt-1 text-2xl font-black">Product Pictures</h2>

                <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <div className="text-4xl">📷</div>
                  <p className="mt-3 font-black">Choose product pictures</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Images will preview below. Maximum 10 MB per image.
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

                {imagePreviews.length > 0 && (
                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-black">
                        Image previews ({imagePreviews.length})
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImages([]);
                          setMessage("");
                        }}
                        className="text-sm font-bold text-red-600"
                      >
                        Remove all
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={`${selectedImages[index]?.name}-${index}`}
                          className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                        >
                          <img
                            src={preview}
                            alt={`Product preview ${index + 1}`}
                            className="h-36 w-full bg-slate-50 object-contain"
                          />
                          <div className="p-2">
                            <p className="truncate text-xs text-slate-700">
                              {selectedImages[index]?.name}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedImages((current) =>
                                  current.filter((_, i) => i !== index)
                                )
                              }
                              className="mt-2 text-xs font-bold text-red-600"
                            >
                              Remove image
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                  Inventory
                </p>
                <h2 className="mt-1 text-2xl font-black">Stock</h2>
                <label htmlFor="stock" className="mt-5 mb-2 block text-sm font-black">
                  Quantity
                </label>
                <input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                  Publishing
                </p>
                <h2 className="mt-1 text-2xl font-black">Product Status</h2>

                <div className="mt-5 space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                    <input
                      type="radio"
                      name="status"
                      value="Draft"
                      checked={status === "Draft"}
                      onChange={(event) => setStatus(event.target.value)}
                      className="h-4 w-4 accent-blue-700"
                    />
                    <div>
                      <div className="font-black">Draft</div>
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
                      <div className="font-black text-green-800">Published</div>
                      <div className="text-xs text-green-700">
                        Intended to be visible on the marketplace
                      </div>
                    </div>
                  </label>
                </div>
              </section>

              <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
                <h2 className="text-xl font-black">Save Product</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  The product-saving API still needs to be connected before this form can save or publish products.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Please wait..."
                    : status === "Published"
                      ? "Publish Product"
                      : "Save Draft"}
                </button>

                {message && (
                  <div
                    role="status"
                    className="mt-4 rounded-xl bg-white/10 p-4 text-sm font-bold text-white"
                  >
                    {message}
                  </div>
                )}
              </section>
            </aside>
          </div>
        </form>
      </section>

      <footer className="mt-12 border-t border-slate-200 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">
          <p className="font-black text-white">
            BEST SALES GHANA — DIRECT SALES
          </p>
          <p className="mt-2 text-sm text-slate-500">
            © {new Date().getFullYear()} All Prominent Ghana Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
