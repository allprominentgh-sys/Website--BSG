"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

type Message = {
  id: number;
  sender: "buyer" | "seller";
  text: string;
  time: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    sender: "seller",
    text: "Hello, yes the item is still available.",
    time: "10:21 AM",
  },
  {
    id: 2,
    sender: "buyer",
    text: "Great. Is the price negotiable?",
    time: "10:23 AM",
  },
  {
    id: 3,
    sender: "seller",
    text: "We can discuss the price.",
    time: "10:24 AM",
  },
];

export default function ChatPage() {
  const searchParams = useSearchParams();

  const listingId = searchParams.get("listing");

  const sellerName =
    searchParams.get("seller") || "Seller";

  const listingTitle =
    searchParams.get("title") || "Marketplace Listing";

  const listingPrice =
    searchParams.get("price") || "Contact Seller";

  const [messages, setMessages] =
    useState<Message[]>(initialMessages);

  const [newMessage, setNewMessage] =
    useState("");

  function sendMessage() {
    const text = newMessage.trim();

    if (!text) return;

    const message: Message = {
      id: Date.now(),
      sender: "buyer",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    setMessages((current) => [
      ...current,
      message,
    ]);

    setNewMessage("");
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <Link href="/" className="block">
            <div className="text-xl font-black tracking-tight text-slate-900">
              ALL PROMINENT GHANA
            </div>

            <div className="text-xs font-medium text-slate-500">
              Buy • Sell • Advertise • Connect
            </div>
          </Link>

          <div className="flex items-center gap-2">

            <Link
              href="/listings"
              className="hidden rounded-xl px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-100 sm:block"
            >
              Marketplace
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-100"
            >
              Dashboard
            </Link>

            <Link
              href="/account"
              className="rounded-xl bg-blue-700 px-4 py-2.5 font-bold text-white hover:bg-blue-800"
            >
              Account
            </Link>

          </div>
        </div>
      </header>


      {/* CHAT AREA */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="grid min-h-[700px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[320px_1fr]">

          {/* CHAT LIST */}
          <aside className="hidden border-r border-slate-200 lg:block">

            <div className="border-b border-slate-200 p-5">

              <h1 className="text-2xl font-black text-slate-900">
                Messages
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Your marketplace conversations
              </p>

            </div>


            {/* SEARCH */}
            <div className="p-4">

              <input
                type="search"
                placeholder="Search conversations..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

            </div>


            {/* CURRENT CONVERSATION */}
            <button
              type="button"
              className="w-full border-l-4 border-blue-700 bg-blue-50 px-5 py-4 text-left"
            >

              <div className="flex items-start justify-between gap-3">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-700 font-black text-white">
                    {sellerName
                      .split(" ")
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate font-black text-slate-900">
                      {sellerName}
                    </p>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {messages.length > 0
                        ? messages[messages.length - 1].text
                        : "No messages yet"}
                    </p>

                  </div>

                </div>


                <span className="shrink-0 text-xs text-slate-400">
                  {messages.length > 0
                    ? messages[messages.length - 1].time
                    : ""}
                </span>

              </div>

            </button>

          </aside>


          {/* CHAT WINDOW */}
          <section className="flex min-w-0 flex-col">

            {/* CHAT HEADER */}
            <div className="border-b border-slate-200 bg-white p-4 sm:p-5">

              <div className="flex items-center justify-between gap-4">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-700 font-black text-white">

                    {sellerName
                      .split(" ")
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}

                  </div>


                  <div className="min-w-0">

                    <h2 className="truncate font-black text-slate-900">
                      {sellerName}
                    </h2>

                    <div className="mt-1 flex items-center gap-2 text-xs">

                      <span className="h-2 w-2 rounded-full bg-green-500" />

                      <span className="text-slate-500">
                        Active now
                      </span>

                    </div>

                  </div>

                </div>


                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Report
                  </button>

                  <button
                    type="button"
                    className="rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                  >
                    Block
                  </button>

                </div>

              </div>


              {/* LISTING REFERENCE */}
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">

                <div className="flex items-center justify-between gap-4">

                  <div className="min-w-0">

                    <p className="text-xs font-black uppercase tracking-wider text-blue-700">
                      Listing
                    </p>

                    <p className="mt-1 truncate font-black text-slate-900">
                      {listingTitle}
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-600">
                      {listingPrice}
                    </p>

                    {listingId && (
                      <p className="mt-1 text-xs text-slate-400">
                        Listing ID: {listingId}
                      </p>
                    )}

                  </div>


                  <Link
                    href={
                      listingId
                        ? `/listings/${listingId}`
                        : "/listings"
                    }
                    className="shrink-0 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800"
                  >
                    View Listing
                  </Link>

                </div>

              </div>

            </div>


            {/* MESSAGES */}
            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4 sm:p-6">

              <div className="text-center">

                <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-400 shadow-sm">
                  Today
                </span>

              </div>


              {messages.map((message) => (

                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "buyer"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.sender === "buyer"
                        ? "rounded-br-md bg-blue-700 text-white"
                        : "rounded-bl-md bg-white text-slate-800"
                    }`}
                  >

                    <p className="text-sm leading-6">
                      {message.text}
                    </p>

                    <p
                      className={`mt-1 text-right text-[10px] ${
                        message.sender === "buyer"
                          ? "text-blue-100"
                          : "text-slate-400"
                      }`}
                    >
                      {message.time}
                    </p>

                  </div>

                </div>

              ))}

            </div>


            {/* MESSAGE COMPOSER */}
            <div className="border-t border-slate-200 bg-white p-4">

              <div className="flex items-end gap-2">

                {/* ATTACHMENT */}
                <button
                  type="button"
                  title="Attach file"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-300 text-xl hover:bg-slate-50"
                >
                  📎
                </button>


                {/* MESSAGE INPUT */}
                <textarea
                  value={newMessage}
                  onChange={(event) =>
                    setNewMessage(event.target.value)
                  }
                  onKeyDown={(event) => {

                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      sendMessage();
                    }

                  }}
                  rows={1}
                  placeholder={`Message ${sellerName}...`}
                  className="min-h-12 flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />


                {/* SEND */}
                <button
                  type="button"
                  onClick={sendMessage}
                  className="h-12 rounded-xl bg-blue-700 px-5 font-black text-white shadow-sm hover:bg-blue-800"
                >
                  Send
                </button>

              </div>


              <p className="mt-2 text-center text-xs text-slate-400">
                Never share passwords, PINs or sensitive financial
                information in chat.
              </p>

            </div>

          </section>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="bg-slate-950 px-4 py-8 text-center text-sm text-slate-500">

        <p className="font-black text-white">
          ALL PROMINENT GHANA
        </p>

        <p className="mt-2">
          Buy • Sell • Advertise • Connect
        </p>

        <p className="mt-4">
          © {new Date().getFullYear()} All Prominent Ghana Limited.
          All rights reserved.
        </p>

      </footer>

    </main>
  );
}
