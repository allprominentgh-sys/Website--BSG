
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Listing = {
  id: string | number;
  title: string | null;
  price: number | null;
  currency_code: string | null;
  currency: string | null;
  category: string | null;
  subcategory: string | null;
  status: string | null;
  created_at: string | null;
  location: string | null;
};

type Message = {
  id: number;
  sender_id: string;
  receiver_id: string;
  listing_id: number | null;
  message: string;
  created_at: string;
  is_read?: boolean;
  is_spam?: boolean;
};

type ChatFilter = "All" | "Read" | "Unread" | "Unanswered" | "Spam";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: "⌂" },
  { label: "My Listings", href: "/dashboard/listings", icon: "▣" },
  { label: "Post an Ad", href: "/sell", icon: "+" },
  { label: "My Profile", href: "/dashboard/profile", icon: "♙" },
  { label: "Company Profile", href: "/dashboard/company", icon: "▤" },
  { label: "Promote Ads", href: "/dashboard/promote", icon: "★" },
  { label: "Messages", href: "/dashboard/messages", icon: "✉" },
  { label: "More", href: "/dashboard/settings", icon: "☰" },
];

const chatFilters: ChatFilter[] = [
  "All",
  "Read",
  "Unread",
  "Unanswered",
  "Spam",
];

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [messageError, setMessageError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [accountType, setAccountType] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatFilter, setChatFilter] = useState<ChatFilter>("All");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const supabase = supabaseBrowser();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (authError || !user) {
          window.location.replace("/login");
          return;
        }

        setUserId(user.id);
        setUserEmail(user.email || "");

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("account_type")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (profileError) {
          console.error("PROFILE LOAD ERROR:", profileError);
        } else {
          setAccountType(profile?.account_type || "");
        }

        const { data, error } = await supabase
          .from("listings")
          .select(
            "id, title, price, currency_code, currency, category, subcategory, status, created_at, location"
          )
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false });

        if (cancelled) return;

        if (error) {
          console.error("DASHBOARD LISTINGS ERROR:", error);
          setErrorMessage(
            "Your listings could not be loaded. Please refresh the page."
          );
        } else {
          setListings((data || []) as Listing[]);
        }
      } catch (error) {
        if (cancelled) return;
        console.error("DASHBOARD ERROR:", error);
        setErrorMessage("Unable to load your dashboard. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    const supabase = supabaseBrowser();

    async function loadMessages() {
      setMessagesLoading(true);
      setMessageError("");

      const { data, error } = await supabase
        .from("messages")
        .select(
          "id, sender_id, receiver_id, listing_id, message, created_at"
        )
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(200);

      if (cancelled) return;

      if (error) {
        console.error("DASHBOARD MESSAGES ERROR:", error);
        setMessageError(
          "Messages could not be loaded. Open Messages to check your inbox."
        );
      } else {
        setMessages((data || []) as Message[]);
      }

      setMessagesLoading(false);
    }

    void loadMessages();

    const channel = supabase
      .channel(`dashboard-messages-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          void loadMessages();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  async function handleLogout() {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    window.location.replace("/login");
  }

  const activeListings = listings.filter(
    (listing) =>
      String(listing.status || "").toLowerCase() === "active"
  );

  const businessAccount = accountType.toLowerCase() === "business";

  function formatPrice(listing: Listing) {
    if (listing.price == null) return "Price not available";

    const currency = listing.currency_code || listing.currency || "GHS";

    const symbols: Record<string, string> = {
      GHS: "GH₵",
      USD: "$",
      EUR: "€",
      GBP: "£",
      CNY: "¥",
    };

    return `${symbols[currency] || currency}${Number(
      listing.price
    ).toLocaleString()}`;
  }

  const conversations = (() => {
    const groups = new Map<string, Message[]>();

    for (const message of messages) {
      const otherUser =
        message.sender_id === userId
          ? message.receiver_id
          : message.sender_id;

      const key = `${otherUser}:${message.listing_id ?? "none"}`;
      const items = groups.get(key) || [];

      items.push(message);
      groups.set(key, items);
    }

    return Array.from(groups.entries()).map(([key, items]) => {
      const latest = items.reduce((newest, item) =>
        new Date(item.created_at).getTime() >
        new Date(newest.created_at).getTime()
          ? item
          : newest
      );

      const unread = items.some(
        (item) =>
          item.receiver_id === userId &&
          item.is_read === false &&
          item.is_spam !== true
      );

      const spam = items.some((item) => item.is_spam === true);

      return {
        key,
        otherUser:
          latest.sender_id === userId
            ? latest.receiver_id
            : latest.sender_id,
        latest,
        unread,
        spam,
        unanswered: latest.sender_id !== userId,
      };
    });
  })();

  const visibleConversations = conversations.filter((conversation) => {
    switch (chatFilter) {
      case "Read":
        return !conversation.unread && !conversation.spam;
      case "Unread":
        return conversation.unread && !conversation.spam;
      case "Unanswered":
        return conversation.unanswered && !conversation.spam;
      case "Spam":
        return conversation.spam;
      default:
        return !conversation.spam;
    }
  });

  const stats = [
    {
      title: "My Listings",
      value: listings.length,
      icon: "▣",
      href: "/dashboard/listings",
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Active Ads",
      value: activeListings.length,
      icon: "✓",
      href: "/dashboard/listings",
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Listing Views",
      value: "—",
      icon: "◉",
      href: "/dashboard/analytics",
      color: "bg-purple-50 text-purple-700",
    },
    {
      title: "Payments",
      value: "View",
      icon: "₵",
      href: "/dashboard/payments",
      color: "bg-orange-50 text-orange-700",
    },
  ];

  const quickActions = [
    {
      title: "Post an Ad",
      description: "List a product or service.",
      icon: "+",
      href: "/sell",
      color: "bg-blue-700 text-white",
    },
    {
      title: "Promote Ads",
      description: "Give your advertisements more visibility.",
      icon: "★",
      href: "/dashboard/promote",
      color: "bg-amber-100 text-amber-700",
    },
    {
      title: "My Listings",
      description: "Edit and manage your advertisements.",
      icon: "▣",
      href: "/dashboard/listings",
      color: "bg-sky-100 text-sky-700",
    },
    {
      title: "My Account",
      description: "Update your personal information.",
      icon: "♙",
      href: "/dashboard/profile",
      color: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f3f7fb] text-[#15365d]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#12345b] text-lg font-black text-white">
              BS
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-wide">
                BEST SALES GHANA
              </p>
              <p className="text-[10px] font-bold tracking-widest text-slate-500">
                BUY · SELL · ADVERTISE
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/dashboard/profile"
              className="max-w-48 truncate text-sm font-semibold text-slate-600"
            >
              {userEmail || "My Account"}
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold hover:bg-slate-50"
            >
              Logout
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xl sm:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            ☰
          </button>
        </div>

        <nav className="hidden overflow-x-auto bg-[#12345b] px-4 py-2 text-white md:block">
          <div className="mx-auto flex max-w-7xl gap-2">
            {navigation.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-bold ${
                  index === 0
                    ? "bg-white/15 text-white"
                    : "text-blue-100 hover:bg-white/10"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {mobileMenuOpen && (
          <nav className="grid grid-cols-2 gap-2 border-t bg-white p-3 md:hidden">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-blue-50"
              >
                {item.icon} {item.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600"
            >
              Logout
            </button>
          </nav>
        )}
      </header>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 sm:py-7">
        <section className="flex flex-col justify-between gap-4 rounded-2xl bg-[#12345b] p-5 text-white sm:flex-row sm:items-center sm:p-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">
              Seller Centre
            </p>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Welcome back!
            </h1>

            <p className="mt-2 break-all text-sm text-blue-100">
              {userEmail || "Manage your BestSalesGH account"}
            </p>
          </div>

          <Link
            href="/sell"
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 font-black text-[#12345b] hover:bg-blue-50"
          >
            + Post an Ad
          </Link>
        </section>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.title}
              href={stat.href}
              className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-black ${stat.color}`}
              >
                {stat.icon}
              </span>

              <span className="min-w-0">
                <span className="block text-xs font-bold text-slate-500">
                  {stat.title}
                </span>

                <span className="mt-1 block text-2xl font-black text-[#12345b]">
                  {loading ? "…" : stat.value}
                </span>
              </span>
            </Link>
          ))}
        </section>

        {businessAccount && (
          <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-widest text-blue-700">
              Business Seller Benefits
            </p>

            <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="max-w-3xl">
                <h2 className="text-xl font-black text-[#12345b] sm:text-2xl">
                  Priority Posting Allowance
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Eligible business accounts can have up to 12 ads included
                  in the priority-posting allowance. Additional ads may incur
                  posting charges. Qualifying on-platform sales remain subject
                  to the 2.15% platform transaction fee.
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Actual allowance, eligibility, payment and priority status
                  must be enforced by the backend.
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  href="/dashboard/company"
                  className="rounded-xl bg-blue-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-800"
                >
                  Complete Company Profile
                </Link>

                <Link
                  href="/dashboard/promote"
                  className="rounded-xl border border-blue-200 px-4 py-3 text-center text-sm font-bold text-blue-700 hover:bg-blue-50"
                >
                  Manage Priority Ads
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Quick Actions
            </p>

            <h2 className="mt-1 text-xl font-black text-[#12345b]">
              Manage Your Account
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/50"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl font-black ${action.color}`}
                >
                  {action.icon}
                </span>

                <h3 className="mt-3 font-black text-[#15365d]">
                  {action.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {action.description}
                </p>

                <p className="mt-3 text-xs font-black text-blue-700">
                  Open →
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                Inbox
              </p>

              <h2 className="mt-1 text-xl font-black text-[#12345b]">
                Chats & Messages
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View conversations with buyers and sellers.
              </p>
            </div>

            <span className="rounded-xl bg-blue-50 p-3 text-2xl">✉</span>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {chatFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setChatFilter(filter)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${
                  chatFilter === filter
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {messageError && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {messageError}
            </p>
          )}

          <div className="mt-3 divide-y divide-slate-100">
            {messagesLoading ? (
              <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                Loading conversations…
              </p>
            ) : visibleConversations.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="font-bold text-slate-700">
                  {chatFilter === "All"
                    ? "No conversations yet."
                    : `No ${chatFilter.toLowerCase()} conversations found.`}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Messages from buyers and sellers will appear here.
                </p>
              </div>
            ) : (
              visibleConversations.slice(0, 5).map((conversation) => (
                <Link
                  key={conversation.key}
                  href="/dashboard/messages"
                  className="flex items-start justify-between gap-3 py-4 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="break-all text-sm font-bold text-[#15365d]">
                      User {conversation.otherUser.slice(0, 8)}…
                    </p>

                    <p className="mt-1 truncate text-sm text-slate-600">
                      {conversation.latest.message}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(
                        conversation.latest.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {conversation.unread && (
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">
                        Unread
                      </span>
                    )}

                    {conversation.spam && (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                        Spam
                      </span>
                    )}

                    {conversation.unanswered && (
                      <span className="text-xs text-slate-500">
                        Awaiting reply
                      </span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>

          <Link
            href="/dashboard/messages"
            className="mt-4 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
          >
            Open Messages →
          </Link>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                Seller Centre
              </p>

              <h2 className="mt-1 text-xl font-black text-[#12345b]">
                Recent Listings
              </h2>
            </div>

            <Link
              href="/dashboard/listings"
              className="text-sm font-black text-blue-700 hover:underline"
            >
              View All Listings →
            </Link>
          </div>

          {loading ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              Loading your listings…
            </p>
          ) : listings.length === 0 ? (
            <div className="mt-5 rounded-xl bg-slate-50 p-6 text-center">
              <p className="font-bold">No listings yet</p>

              <p className="mt-1 text-sm text-slate-500">
                Post your first ad to start selling.
              </p>

              <Link
                href="/sell"
                className="mt-4 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white"
              >
                + Post Your First Ad
              </Link>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {listings.slice(0, 3).map((listing) => (
                <article
                  key={String(listing.id)}
                  className="flex items-center justify-between gap-3 py-4"
                >
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-[#15365d]">
                      {listing.title || "Untitled Listing"}
                    </h3>

                    <p className="mt-1 text-sm font-black text-blue-700">
                      {formatPrice(listing)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {[listing.category, listing.status]
                        .filter(Boolean)
                        .join(" · ") || "Status unavailable"}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold"
                    >
                      View
                    </Link>

                    <Link
                      href="/dashboard/listings"
                      className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white"
                    >
                      Manage
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col justify-between gap-3 rounded-2xl bg-[#12345b] p-5 text-white sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="text-lg font-black">Need assistance?</h2>

            <p className="mt-1 text-sm text-blue-100">
              Get help with your account, advertisements or payments.
            </p>
          </div>

          <Link
            href="/dashboard/support"
            className="inline-flex shrink-0 justify-center rounded-xl bg-white px-5 py-3 text-sm font-black text-[#12345b] hover:bg-blue-50"
          >
            Help & Support →
          </Link>
        </section>

        <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">
          <p className="font-black tracking-wide text-[#12345b]">
            BEST SALES GHANA
          </p>

          <p className="mt-1">Buy · Sell · Advertise · Connect</p>

          <p className="mt-2">
            © 2026 All Prominent Ghana Limited. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
