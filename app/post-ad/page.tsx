"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import Header from "../../components/Header";
import { categories } from "../../data";
import { supabaseBrowser } from "../../supabase-browser";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function PostAdPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [listingId, setListingId] = useState<number | null>(null);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const selectedCategory = categories.find(
    (item) => item.name.trim().toLowerCase() === category.trim().toLowerCase()
  );
  const subcategories = selectedCategory?.subcategories ?? [];

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError("");
    if (!file) {
      setImage(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }
    setImage(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Please sign in before posting an advertisement.");
      }

      const form = new FormData(e.currentTarget);
      const price = Number(form.get("price") || 0);
      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Please enter a valid price.");
      }

      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert({
          seller_id: user.id,
          category_id: null,
          title: String(form.get("title") || "").trim(),
          description: String(form.get("description") || "").trim(),
          price,
          currency_code: String(form.get("currency") || "GHS"),
          location: String(form.get("location") || "").trim(),
          subcategory: subcategory || null,
          seller_name: String(form.get("seller") || "").trim(),
          seller_phone: String(form.get("phone") || "").trim(),
          status: "active",
        })
        .select("id")
        .single();

      if (listingError) throw listingError;
      if (!listing) throw new Error("The advertisement could not be created.");

      if (image) {
        const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/${listing.id}-${Date.now()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(path, image, { contentType: image.type, upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicImage } = supabase.storage
          .from("listing-images")
          .getPublicUrl(path);

        const { error: imageError } = await supabase
          .from("listing_images")
          .insert({ listing_id: listing.id, image_url: publicImage.publicUrl });

        if (imageError) throw imageError;
      }

      setListingId(listing.id);
      setSubmitted(true);
      e.currentTarget.reset();
      setCategory("");
      setSubcategory("");
      setImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />
      <main className="post-ad-page">
        <div className="post-ad-container">
          <h1>Post an Ad</h1>
          <p className="post-ad-subtitle">
            Sell your product, property, vehicle, equipment, job or service across Ghana.
          </p>

          {submitted ? (
            <div className="success-box">
              <h2>Ad Submitted Successfully</h2>
              <p>Your advertisement has been published on the marketplace.</p>
              {listingId && <p className="ad-reference">Ad reference: #{listingId}</p>}
              <button onClick={() => { setSubmitted(false); setListingId(null); }} className="primary-button">
                Post Another Ad
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="ad-form">
              <label>
                Ad Title
                <input name="title" type="text" placeholder="e.g. Toyota Corolla 2020" required />
              </label>

              <label>
                Category
                <select name="category" value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(""); }} required>
                  <option value="">Select category</option>
                  {categories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                </select>
              </label>

              <label>
                Subcategory
                <select
                  name="subcategory"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  disabled={!selectedCategory}
                >
                  <option value="">
                    {selectedCategory ? "Select subcategory" : "Select category first"}
                  </option>
                  {subcategories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <div className="form-row">
                <label>
                  Price
                  <input type="number" name="price" placeholder="0.00" min="0" step="0.01" required />
                </label>
                <label>
                  Currency
                  <select name="currency" defaultValue="GHS">
                    <option value="GHS">GHS — Ghana Cedi</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — Pound</option>
                    <option value="CNY">CNY — Chinese Yuan</option>
                  </select>
                </label>
              </div>

              <label>
                Location
                <input name="location" type="text" placeholder="e.g. Accra, Ghana" required />
              </label>

              <label>
                Description
                <textarea name="description" rows={6} placeholder="Describe your product, property, vehicle or service..." required />
              </label>

              <label>
                Seller / Business Name
                <input name="seller" type="text" placeholder="Your name or business name" required />
              </label>

              <label>
                Phone Number
                <input name="phone" type="tel" placeholder="e.g. 024 000 0000" required />
              </label>

              <label>
                Product Image (optional, max 5 MB)
                <input name="image" type="file" accept="image/*" onChange={handleImageChange} />
              </label>

              {error && <div className="error-box" role="alert">{error}</div>}

              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "Publishing Ad..." : "Submit Advertisement"}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
