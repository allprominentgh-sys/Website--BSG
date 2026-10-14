
"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/supabase-browser";

type Message = {
  id: number;
  sender_id: string;
  receiver_id: string;
  listing_id: number | null;
  message: string;
  created_at: string;
};

type Filter = "All" | "Unanswered";

function ChatContent() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const listingParam = searchParams.get("listing");
  const sellerParam = searchParams.get("seller");
  const titleParam = searchParams.get("title") || "";
  const price = searchParams.get("price") || "";

  const listingId =
    listingParam && /^\d+$/.test(listingParam)
      ? Number(listingParam)
      : null;

  const [userId, setUserId] = useState("");
  const [sellerId, setSellerId] = useState(sellerParam || "");
  const [listingTitle, setListingTitle] = useState(
    titleParam || "Marketplace listing"
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [selectedUser, setSelectedUser] = useState(sellerParam || "");
  const [selectedListingId, setSelectedListingId] =
    useState<number | null>(listingId);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadMessages = useCallback(
    async (currentUser: string) => {
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select(
          "id,sender_id,receiver_id,listing_id,message,created_at"
        )
        .or(
          `sender_id.eq.${currentUser},receiver_id.eq.${currentUser}`
        )
        .order("created_at", { ascending: true });

      if (fetchError) {
        setError(
          "Unable to load messages. Please check your message-table permissions."
        );
        console.error("Message loading error:", fetchError.message);
        return;
      }

      setMessages((data || []) as Message[]);
      setError("");
    },
    [supabase]
  );

  useEffect(() => {
    let active = true;

    async function initialize() {
      setLoading(true);
      setError("");

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (!active) return;

      if (authError || !authData.user) {
        setError("Please sign in to view or send messages.");
        setLoading(false);
        return;
      }

      const currentUser = authData.user.id;
      setUserId(currentUser);

      if (listingId !== null) {
        const { data: listing, error: listingError } = await supabase
          .from("listings")
          .select("id,title,price,seller_id")
          .eq("id", listingId)
          .maybeSingle();

        if (!active) return;

        if (listingError) {
          console.error("Listing lookup error:", listingError.message);
          setError("Unable to load this listing's seller.");
        } else if (!listing) {
          setError("This listing could not be found.");
        } else {
          setListingTitle(listing.title || "Marketplace listing");

          if (!titleParam && listing.price !== null) {
            // The price remains optional in the chat header.
          }

          const actualSellerId = listing.seller_id;

          if (actualSellerId && actualSellerId !== currentUser) {
            setSellerId(actualSellerId);
            setSelectedUser(actualSellerId);
            setSelectedListingId(listingId);
          } else if (actualSellerId === currentUser) {
            setError("This is your own listing. Choose a buyer conversation.");
            setSellerId("");
            setSelectedUser("");
          }
        }
      } else if (sellerParam && sellerParam !== currentUser) {
        setSellerId(sellerParam);
        setSelectedUser(sellerParam);
      }

      await loadMessages(currentUser);

      if (active) setLoading(false);
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [
    supabase,
    listingId,
    sellerParam,
    titleParam,
    loadMessages,
  ]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`messages-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          void loadMessages(userId);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, userId, loadMessages]);

  const conversations = useMemo(() => {
    const groups = new Map<string, Message[]>();

    for (const message of messages) {
      const otherUser =
        message.sender_id === userId
          ? message.receiver_id
          : message.sender_id;

      const key = `${otherUser}:${message.listing_id ?? "none"}`;
      const group = groups.get(key) || [];

      group.push(message);
      groups.set(key, group);
    }

    return Array.from(groups.entries()).map(([key, items]) => {
      const latest = items[items.length - 1];

      return {
        key,
        otherUser:
          latest.sender_id === userId
            ? latest.receiver_id
            : latest.sender_id,
        listingId: latest.listing_id,
        latest,
        items,
        unanswered: latest.sender_id !== userId,
      };
    });
  }, [messages, userId]);

  const visibleConversations = useMemo(() => {
    if (activeFilter === "Unanswered") {
      return conversations.filter((conversation) => conversation.unanswered);
    }

    return conversations;
  }, [activeFilter, conversations]);

  const selectedConversation = conversations.find(
    (conversation) =>
      conversation.otherUser === selectedUser &&
      conversation.listingId === selectedListingId
  );

  const conversationMessages = selectedConversation?.items || [];

  async function sendMessage() {
    const text = draft.trim();
    const recipient = selectedUser || sellerId;

    if (!text || !userId || sending) return;

    if (!recipient || recipient === userId) {
      setError("Open a valid buyer or seller conversation first.");
      return;
    }

    if (listingParam && listingId === null) {
      setError("The listing ID is invalid.");
      return;
    }

    setSending(true);
    setError("");
    setNotice("");

    const payload: {
      sender_id: string;
      receiver_id: string;
      message: string;
      listing_id?: number;
    } = {
      sender_id: userId,
      receiver_id: recipient,
      message: text,
    };

    if (selectedListingId !== null) {
      payload.listing_id = selectedListingId;
    }

    const { error: sendError } = await supabase
      .from("messages")
      .insert(payload);

    if (sendError) {
      console.error("Message send error:", sendError.message);
      setError(
        "Message could not be sent. Please check your Supabase message insert policy."
      );
    } else {
      setDraft("");
      setSelectedUser(recipient);
      setNotice("Message sent.");
      await loadMessages(userId);
    }

    setSending(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-3 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">BestSalesGH</p>
            <h1 className="mt-1 text-2xl font-black">Chat with seller</h1>
            <p className="mt-1 text-sm text-slate-500">
              Discuss a listing directly with its seller.
            </p>
          </div>

          <Link
            href={listingId ? `/listings/${listingId}` : "/listings"}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-blue-700"
          >
            ← Back
          </Link>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800"
          >
            {notice}
          </div>
        )}

        <section className="grid min-h-[650px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[320px_1fr]">
          <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-200 p-4">
              <h2 className="font-black">Your conversations</h2>
              <p className="mt-1 text-xs text-slate-500">
                {conversations.length} conversations
              </p>

              <div className="mt-3 flex gap-2">
                {(["All", "Unanswered"] as Filter[]).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-full px-3 py-2 text-xs font-bold ${
                      activeFilter === filter
                        ? "bg-blue-700 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[330px] overflow-y-auto lg:max-h-[600px]">
              {loading ? (
                <p className="p-4 text-sm text-slate-500">
                  Loading conversations...
                </p>
              ) : visibleConversations.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">
                  No conversations yet. Open a listing and tap Contact Seller.
                </p>
              ) : (
                visibleConversations.map((conversation) => (
                  <button
                    key={conversation.key}
                    type="button"
                    onClick={() => {
                      setSelectedUser(conversation.otherUser);
                      setSellerId(conversation.otherUser);
                      setSelectedListingId(conversation.listingId);
                      setError("");
                      setNotice("");
                    }}
                    className={`w-full border-b border-slate-100 p-4 text-left ${
                      selectedUser === conversation.otherUser &&
                      selectedListingId === conversation.listingId
                        ? "bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <p className="break-all text-sm font-bold">
                      User {conversation.otherUser.slice(0, 8)}…
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-600">
                      {conversation.latest.message}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(
                        conversation.latest.created_at
                      ).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="flex min-h-[520px] min-w-0 flex-col">
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl">
                  👤
                </div>
                <div className="min-w-0">
                  <h2 className="font-black">
                    {selectedUser
                      ? "Chat with seller"
                      : "Start a conversation"}
                  </h2>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {listingTitle}
                    {price ? ` · ${price}` : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 sm:p-6">
              {conversationMessages.length === 0 ? (
                <div className="mx-auto mt-10 max-w-sm text-center">
                  <div className="text-4xl">💬</div>
                  <h3 className="mt-3 font-bold">Send your first message</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Ask about availability, condition, price, or delivery.
                    Your message will be sent to the listing seller.
                  </p>
                </div>
              ) : (
                conversationMessages.map((message) => {
                  const ownMessage = message.sender_id === userId;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        ownMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] ${
                          ownMessage
                            ? "rounded-br-sm bg-blue-700 text-white"
                            : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm">
                          {message.message}
                        </p>
                        <p
                          className={`mt-2 text-[10px] ${
                            ownMessage ? "text-blue-100" : "text-slate-400"
                          }`}
                        >
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form
              className="border-t border-slate-200 bg-white p-3 sm:p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
            >
              <label
                htmlFor="message-draft"
                className="mb-2 block text-sm font-bold"
              >
                Your message
              </label>

              <div className="flex items-end gap-2">
                <textarea
                  id="message-draft"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type your message..."
                  rows={2}
                  maxLength={5000}
                  disabled={!userId || sending || !selectedUser}
                  className="min-w-0 flex-1 resize-none rounded-2xl border border-slate-300 p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />

                <button
                  type="submit"
                  aria-label="Send message"
                  disabled={
                    !draft.trim() ||
                    !userId ||
                    sending ||
                    !selectedUser
                  }
                  className="flex h-12 shrink-0 items-center justify-center rounded-full bg-blue-700 px-5 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  {sending ? "…" : "➤"}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Never share passwords or verification codes.
              </p>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 p-6">
          <p className="text-slate-600">Loading chat...</p>
        </main>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
