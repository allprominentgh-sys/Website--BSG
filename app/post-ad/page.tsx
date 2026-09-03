"use client";

import { useState } from "react";
import Header from "../../components/Header";

export default function PostAdPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Header />

      <main className="post-ad-page">
        <div className="post-ad-container">
          <h1>Post an Ad</h1>
          <p className="post-ad-subtitle">
            Sell your product, property, vehicle, equipment, job or service
            across Ghana.
          </p>

          {submitted ? (
            <div className="success-box">
              <h2>Ad Submitted Successfully</h2>
              <p>
                Your advertisement has been received. We will prepare it for
                publication.
              </p>

              <button
                onClick={() => setSubmitted(false)}
                className="primary-button"
              >
                Post Another Ad
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="ad-form">
              <label>
                Ad Title
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Toyota Corolla 2020"
                  required
                />
              </label>

              <label>
                Category
                <select name="category" required>
                  <option value="">Select category</option>
                  <option>Industrial Machinery</option>
                  <option>Construction Equipment</option>
                  <option>Vehicles</option>
                  <option>Property</option>
                  <option>Electronics</option>
                  <option>Jobs</option>
                  <option>Services</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                Subcategory
                <input
                  type="text"
                  name="subcategory"
                  placeholder="Enter subcategory"
                />
              </label>

              <div className="form-row">
                <label>
                  Price
                  <input
                    type="number"
                    name="price"
                    placeholder="0.00"
                    min="0"
                  />
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
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Accra, Ghana"
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  rows={6}
                  placeholder="Describe your product, property, vehicle or service..."
                  required
                />
              </label>

              <label>
                Seller / Business Name
                <input
                  type="text"
                  name="seller"
                  placeholder="Your name or business name"
                  required
                />
              </label>

              <label>
                Phone Number
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. 024 000 0000"
                  required
                />
              </label>

              <label>
                Product Image
                <input type="file" accept="image/*" />
              </label>

              <button type="submit" className="primary-button">
                Submit Advertisement
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
