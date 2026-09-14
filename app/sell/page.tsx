"use client";

import { useState } from "react";

export default function SellPage() {
  const [accountType, setAccountType] = useState("");
  const [agreed, setAgreed] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <a href="/" className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-slate-900">
              BEST SALES GHANA
            </span>

            <span className="text-xs font-medium text-slate-500">
              Buy • Sell • Advertise • Connect
            </span>
          </a>

          <a
            href="/login"
            className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 transition hover:border-blue-600 hover:text-blue-700"
          >
            Sign In
          </a>

        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-400">
        <div className="mx-auto max-w-7xl px-4 py-14 text-white sm:px-6 lg:px-8">

          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100">
            Sell on BEST SALES GHANA
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Turn your products into opportunities.
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/90">
            Create listings, advertise your business and connect with buyers
            across Ghana.
          </p>

        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

        {/* ===================================================
            ACCOUNT TYPE
        =================================================== */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">

          <div className="mb-8">
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Step 1
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Choose your seller type
            </h2>

            <p className="mt-2 text-slate-500">
              Your account type determines how payments and verification are
              handled on the marketplace.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* INDIVIDUAL */}
            <button
              type="button"
              onClick={() => setAccountType("individual")}
              className={`rounded-2xl border-2 p-6 text-left transition ${
                accountType === "individual"
                  ? "border-blue-600 bg-blue-50 shadow-lg"
                  : "border-slate-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="text-4xl">👤</div>

              <h3 className="mt-4 text-xl font-black">
                Individual Seller
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                For people selling products or services in their personal
                capacity.
              </p>

              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                <li>✓ National ID verification</li>
                <li>✓ Face verification may be required</li>
                <li>✓ Listings can be published</li>
                <li>✓ Payments subject to internal holding</li>
              </ul>
            </button>

            {/* BUSINESS */}
            <button
              type="button"
              onClick={() => setAccountType("business")}
              className={`rounded-2xl border-2 p-6 text-left transition ${
                accountType === "business"
                  ? "border-blue-600 bg-blue-50 shadow-lg"
                  : "border-slate-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="text-4xl">🏢</div>

              <h3 className="mt-4 text-xl font-black">
                Registered Business / Company
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                For registered businesses and companies selling products or
                services through the marketplace.
              </p>

              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                <li>✓ Business registration verification</li>
                <li>✓ Tax identification details</li>
                <li>✓ Authorized representative verification</li>
                <li className="font-bold text-blue-700">
                  ✓ Eligible for direct platform payments
                </li>
              </ul>
            </button>

          </div>

          {/* =================================================
              BUSINESS PAYMENT NOTICE
          ================================================= */}
          {accountType === "business" && (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">

              <div className="flex gap-3">
                <div className="text-xl">💳</div>

                <div>
                  <h3 className="font-black text-blue-900">
                    Business platform payments
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-blue-800">
                    Verified registered businesses may receive payments from
                    clients through the platform. Payments are processed for
                    five (5) business days before settlement, subject to
                    verification and dispute procedures.
                  </p>

                  <p className="mt-2 text-sm font-bold text-blue-900">
                    Platform processing fee: 2.15% of the transaction amount.
                  </p>
                </div>
              </div>

            </div>
          )}

          {accountType === "individual" && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">

              <div className="flex gap-3">
                <div className="text-xl">🛡️</div>

                <div>
                  <h3 className="font-black text-amber-900">
                    Individual seller payment protection
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Individual sellers do not receive direct platform payouts
                    to a bank account. Transactions may be held internally and
                    manually verified to protect buyers and sellers.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ===================================================
            LISTING DETAILS
        =================================================== */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">

          <div className="mb-8">
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Step 2
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Create your listing
            </h2>

            <p className="mt-2 text-slate-500">
              Give buyers accurate information about what you are selling.
            </p>
          </div>

          <div className="space-y-6">

            {/* TITLE */}
            <div>
              <label className="mb-2 block font-bold">
                Listing Title
              </label>

              <input
                type="text"
                placeholder="e.g. 2024 Toyota Land Cruiser"
                className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="mb-2 block font-bold">
                Category
              </label>

              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                defaultValue=""
              >
                <option value="" disabled>
                  Select a category
                </option>

                <option>Vehicles</option>
                <option>Property</option>
                <option>Electronics</option>
                <option>Machinery & Equipment</option>
                <option>Printing Equipment</option>
                <option>Agriculture</option>
                <option>Phones & Tablets</option>
                <option>Fashion</option>
                <option>Home & Garden</option>
                <option>Jobs & Services</option>
                <option>Industrial Equipment</option>
                <option>Construction Equipment</option>
                <option>Other</option>
              </select>
            </div>

            {/* PRICE */}
            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block font-bold">
                  Price
                </label>

                <div className="flex overflow-hidden rounded-xl border border-slate-300">
                  <div className="flex items-center bg-slate-100 px-4 font-bold">
                    GHS
                  </div>

                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-4 py-4 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-bold">
                  Location
                </label>

                <input
                  type="text"
                  placeholder="e.g. Accra, Ghana"
                  className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-2 block font-bold">
                Description
              </label>

              <textarea
                rows={7}
                placeholder="Describe the product or service accurately. Include condition, specifications, defects and other important information."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-4 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* PHOTOS */}
            <div>
              <label className="mb-2 block font-bold">
                Product Photos
              </label>

              <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center transition hover:border-blue-500">

                <div className="text-4xl">📷</div>

                <p className="mt-3 font-bold">
                  Upload clear photos
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Use original photographs that accurately represent your
                  product.
                </p>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="mx-auto mt-5 block max-w-full text-sm"
                />

              </div>
            </div>

          </div>

        </div>

        {/* ===================================================
            ADVERTISING
        =================================================== */}
        <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-10">

          <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
            Optional
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Promote your listing
          </h2>

          <p className="mt-3 max-w-2xl text-white/70">
            Increase visibility by selecting an advertising package after
            creating your listing.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="font-black">Standard</div>
              <p className="mt-2 text-sm text-white/60">
                Normal marketplace visibility.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-500/50 bg-blue-600/20 p-5">
              <div className="font-black">Featured</div>
              <p className="mt-2 text-sm text-white/60">
                Increased listing visibility.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/50 bg-cyan-400/10 p-5">
              <div className="font-black">Top Ad</div>
              <p className="mt-2 text-sm text-white/60">
                Premium marketplace placement.
              </p>
            </div>

          </div>

          <p className="mt-5 text-xs text-white/50">
            Advertising package fees are non-refundable once activated.
            Advertising does not guarantee sales or conversion.
          </p>

        </div>

        {/* ===================================================
            TERMS AGREEMENT
        =================================================== */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">

          <p className="text-sm font-black uppercase tracking-widest text-blue-700">
            Step 3
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Marketplace Terms
          </h2>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">

            <p>
              By publishing a listing, you confirm that the information,
              pricing, photographs and representations provided are accurate.
            </p>

            <p className="mt-3">
              You agree not to list prohibited, counterfeit, stolen, illegal
              or otherwise restricted products or services.
            </p>

            <p className="mt-3">
              You agree to comply with BEST SALES GHANA's payment, refund,
              dispute resolution, verification, privacy and anti-fraud
              policies.
            </p>

            <a
              href="/terms"
              className="mt-4 inline-block font-bold text-blue-700 hover:text-blue-900"
            >
              Read the complete Marketplace Terms & Conditions →
            </a>

          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3">

            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-slate-300"
            />

            <span className="text-sm leading-6 text-slate-700">
              I confirm that I have read and agree to the BEST SALES GHANA
              Marketplace Terms & Conditions and Listing Rules.
            </span>

          </label>

        </div>

        {/* ===================================================
            SUBMIT
        =================================================== */}
        <div className="mt-8">

          <button
            type="button"
            disabled={!accountType || !agreed}
            className={`w-full rounded-2xl px-6 py-5 text-lg font-black text-white shadow-lg transition ${
              !accountType || !agreed
                ? "cursor-not-allowed bg-slate-300"
                : "bg-blue-700 hover:-translate-y-0.5 hover:bg-blue-800"
            }`}
          >
            {accountType === "business"
              ? "Continue Business Verification →"
              : accountType === "individual"
              ? "Continue Seller Verification →"
              : "Select Seller Type to Continue"}
          </button>

          <p className="mt-4 text-center text-xs text-slate-500">
            Your listing will not be published until the required verification
            and review process is completed.
          </p>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="mt-10 bg-slate-950 py-10 text-white">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <div className="text-xl font-black">
            BEST SALES GHANA
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Buy • Sell • Advertise • Connect
          </p>

          <div className="mt-5 flex justify-center gap-5 text-sm text-slate-400">
            <a href="/terms" className="hover:text-white">
              Terms
            </a>

            <a href="/privacy" className="hover:text-white">
              Privacy
            </a>

            <a href="/contact" className="hover:text-white">
              Contact
            </a>
          </div>

          <p className="mt-6 text-xs text-slate-600">
            © {new Date().getFullYear()} All Prominent Ghana Limited. All
            rights reserved.
          </p>

        </div>

      </footer>

    </main>
  );
}
