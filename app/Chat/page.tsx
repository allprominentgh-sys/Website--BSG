"use client";

import Link from "next/link";
import { useState } from "react";

type Conversation = {
  id: number;
  name: string;
  type: "Seller" | "Business" | "Support";
  listing: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
};

const conversations: Conversation[] = [
  {
    id: 1,
    name: "Industrial Equipment Ghana",
    type: "Business",
    listing: "Industrial Printing Machine",
    lastMessage: "Yes, the machine is still available.",
    time: "10:42 AM",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Kwame Mensah",
    type: "Seller",
    listing: "Toyota Hilux 2022",
    lastMessage: "You can come and inspect it.",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "BEST SALES GHANA Support",
    type: "Support",
    listing: "Payment Support",
    lastMessage: "Your request has been received.",
    time: "Monday",
    unread: 0,
    online: true,
  },
];

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState(1);
  const [message, setMessage] = useState("");

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ??
    conversations[0];

  const sendMessage = () => {
    if (!message.trim()) return;

    alert("Chat message interface ready. Real-time messaging will be connected in the next step.");
    setMessage("");
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <Link href="/" className="block">
            <div className="text-xl font-black tracking-tight text-slate-900">
              BEST SALES GHANA
            </div>

            <div className="text-xs font-medium text-slate-500 sm:text-sm">
              Buy • Sell • Advertise • Connect
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">

            <Link
              href="/"
              className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
            >
              Marketplace
            </Link>

            <Link
              href="/login"
              className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800"
            >
              Account
            </Link>

          </div>

        </div>
      </header>

      {/* CHAT AREA */}
      <section className="mx-auto max-w-7xl px-0 py-0 sm:px-6 sm:py-8 lg:px-8">

        <div className="overflow-hidden border-x border-slate-200 bg-white shadow-sm sm:rounded-3xl sm:border">

          <div className="grid min-h-[calc(100vh-105px)] md:grid-cols-[340px_1fr] lg:grid-cols-[380px_1fr]">

            {/* CONVERSATIONS */}
            <aside className="border-r border-slate-200 bg-white">

              <div className="border-b border-slate-200 p-5">

                <div className="flex items-center justify-between">

                  <div>
                    <h1 className="text-2xl font-black text-slate-900">
                      Messages
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                      Your marketplace conversations
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xl">
                    💬
                  </div>

                </div>

                {/* SEARCH */}
                <div className="mt-5">

                  <input
                    type="search"
                    placeholder="Search conversations..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

              {/* CONVERSATION LIST */}
              <div>

                {conversations.map((conversation) => (

                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedId(conversation.id)}
                    className={`w-full border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${
                      selectedId === conversation.id
                        ? "bg-blue-50"
                        : "bg-white"
                    }`}
                  >

                    <div className="flex gap-3">

                      {/* AVATAR */}
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-700 font-black text-white">

                        {conversation.name.charAt(0)}

                        {conversation.online && (
                          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                        )}

                      </div>

                      {/* INFO */}
                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-2">

                          <div className="truncate font-black text-slate-900">
                            {conversation.name}
                          </div>

                          <span className="shrink-0 text-xs text-slate-400">
                            {conversation.time}
                          </span>

                        </div>

                        <div className="mt-1 text-xs font-bold text-blue-700">
                          {conversation.type}
                        </div>

                        <div className="mt-1 truncate text-sm text-slate-500">
                          {conversation.lastMessage}
                        </div>

                        <div className="mt-2 flex items-center justify-between">

                          <span className="truncate text-xs text-slate-400">
                            {conversation.listing}
                          </span>

                          {conversation.unread > 0 && (
                            <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-700 px-1.5 text-[10px] font-black text-white">
                              {conversation.unread}
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                  </button>

                ))}

              </div>

            </aside>

            {/* CHAT WINDOW */}
            <section className="flex min-h-[calc(100vh-105px)] flex-col bg-slate-50">

              {/* CHAT HEADER */}
              <div className="border-b border-slate-200 bg-white px-5 py-4">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-700 font-black text-white">

                      {selectedConversation.name.charAt(0)}

                      {selectedConversation.online && (
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                      )}

                    </div>

                    <div className="min-w-0">

                      <h2 className="truncate font-black text-slate-900">
                        {selectedConversation.name}
                      </h2>

                      <p className="text-xs text-slate-500">
                        {selectedConversation.online
                          ? "Online now"
                          : "Offline"}
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100"
                  >
                    ⋮
                  </button>

                </div>

                {/* LISTING ATTACHMENT */}
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl">
                    📦
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                      Listing
                    </p>

                    <p className="truncate font-black text-slate-900">
                      {selectedConversation.listing}
                    </p>

                  </div>

                  <button
                    type="button"
                    className="rounded-lg bg-white px-3 py-2 text-xs font-black text-blue-700 hover:bg-blue-100"
                  >
                    View
                  </button>

                </div>

              </div>

              {/* MESSAGES */}
              <div className="flex-1 space-y-5 overflow-y-auto p-5">

                {/* DATE */}
                <div className="flex justify-center">
                  <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-slate-400 shadow-sm">
                    Today
                  </span>
                </div>

                {/* SELLER MESSAGE */}
                <div className="flex justify-start">

                  <div className="max-w-[80%] sm:max-w-[65%]">

                    <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm">

                      <p className="text-sm leading-6 text-slate-700">
                        Hello. Thank you for your interest in this listing.
                      </p>

                    </div>

                    <p className="mt-1 px-1 text-[11px] text-slate-400">
                      10:38 AM
                    </p>

                  </div>

                </div>

                {/* BUYER MESSAGE */}
                <div className="flex justify-end">

                  <div className="max-w-[80%] sm:max-w-[65%]">

                    <div className="rounded-2xl rounded-tr-md bg-blue-700 px-4 py-3 text-white shadow-sm">

                      <p className="text-sm leading-6">
                        Is the machine still available?
                      </p>

                    </div>

                    <div className="mt-1 flex justify-end gap-1 px-1 text-[11px] text-slate-400">
                      <span>10:40 AM</span>
                      <span className="font-black text-blue-600">
                        ✓✓
                      </span>
                    </div>

                  </div>

                </div>

                {/* SELLER MESSAGE */}
                <div className="flex justify-start">

                  <div className="max-w-[80%] sm:max-w-[65%]">

                    <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm">

                      <p className="text-sm leading-6 text-slate-700">
                        Yes, the machine is still available.
                      </p>

                    </div>

                    <p className="mt-1 px-1 text-[11px] text-slate-400">
                      10:42 AM
                    </p>

                  </div>

                </div>

              </div>

              {/* SAFETY NOTICE */}
              <div className="border-t border-slate-200 bg-amber-50 px-5 py-3">

                <p className="text-center text-xs leading-5 text-amber-800">
                  <strong>Safety:</strong> Keep conversations and payments
                  within BEST SALES GHANA whenever possible. Report suspicious
                  activity to Marketplace Support.
                </p>

              </div>

              {/* MESSAGE INPUT */}
              <div className="border-t border-slate-200 bg-white p-4">

                <div className="flex items-end gap-2">

                  <button
                    type="button"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl hover:bg-slate-200"
                    title="Attach file"
                  >
                    📎
                  </button>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a message..."
                    rows={1}
                    className="max-h-32 min-h-12 flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={sendMessage}
                    className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-blue-700 px-5 font-black text-white shadow-md hover:bg-blue-800"
                  >
                    Send
                  </button>

                </div>

              </div>

            </section>

          </div>

        </div>

      </section>

    </main>
  );
}
