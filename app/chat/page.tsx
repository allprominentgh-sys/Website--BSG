"use client";

import { Suspense, useSearchParams } from "react";
import Link from "next/link";

function ChatContent() {
  const searchParams = useSearchParams();

  const seller = searchParams.get("seller") || "Seller";
  const listing = searchParams.get("listing") || "Marketplace Listing";

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-2xl text-white shadow-md">
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
            href="/listings"
            className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
          >
            Back to Listings
          </Link>
        </div>
      </header>

      {/* CHAT AREA */}
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          {/* CHAT HEADER */}
          <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-500 px-6 py-6 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl">
                👤
              </div>

              <div>
                <h1 className="text-xl font-black">
                  Chat with {seller}
                </h1>

                <p className="mt-1 text-sm text-white/80">
                  {listing}
                </p>
              </div>
            </div>
          </div>

          {/* SECURITY NOTICE */}
          <div className="border-b border-slate-200 bg-blue-50 px-6 py-4">
            <p className="text-sm font-semibold text-blue-900">
              🛡️ Marketplace Safety
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-800">
              Never share your password, PIN or sensitive banking information
              with another user.
            </p>
          </div>

          {/* MESSAGES */}
          <div className="min-h-[420px] bg-slate-50 p-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-400 shadow-sm">
                Today
              </div>
            </div>

            <div className="mt-8 flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-5 py-4 shadow-sm">
                <p className="text-sm text-slate-700">
                  Hello! I am interested in this listing.
                </p>

                <p className="mt-1 text-right text-[10px] text-slate-400">
                  Buyer
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-blue-700 px-5 py-4 text-white shadow-sm">
                <p className="text-sm">
                  Hello! Thank you for your interest. How can I help you?
                </p>

                <p className="mt-1 text-right text-[10px] text-white/60">
                  {seller}
                </p>
              </div>
            </div>
          </div>

          {/* MESSAGE INPUT */}
          <div className="border-t border-slate-200 bg-white p-4">
            <form className="flex gap-3">
              <input
                type="text"
                placeholder="Type your message..."
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="submit"
                className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* DELIVERY OPTION */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🚚</div>

            <div>
              <h2 className="font-black text-slate-900">
                Marketplace Delivery
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                When buying this item, you can choose BEST SALES GHANA
                delivery if the seller offers it. Your delivery can then be
                tracked using a tracking number.
              </p>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-700">
                  Delivery is optional for individual sellers.
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Company sellers can have their own delivery arrangements,
                  while individual sellers can choose whether to use the
                  marketplace delivery system.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* LOCATION */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="text-3xl">📍</div>

            <div>
              <h2 className="font-black text-slate-900">
                GhanaPost GPS Location
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Buyers and sellers will be able to provide their GhanaPost GPS
                location for delivery and collection.
              </p>

              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  GhanaPost GPS:
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  Location will appear when provided
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-10 bg-slate-950 py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="text-xl font-black">BEST SALES GHANA</div>

          <p className="mt-2 text-sm text-slate-400">
            Buy • Sell • Advertise • Connect
          </p>

          <p className="mt-6 text-sm text-slate-500">
            © 2026 All Prominent Ghana Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-lg">
            <div className="text-3xl">💬</div>

            <p className="mt-3 font-bold text-slate-700">
              Loading chat...
            </p>
          </div>
        </main>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
