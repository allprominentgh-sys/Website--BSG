"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Message = {
  id: number;
  sender_id: string;
  receiver_id: string;
  listing_id: number | null;
  message: string;
  created_at: string;
  is_read: boolean;
  is_spam: boolean;
  read_at?: string | null;
};

type Filter = "All" | "Read" | "Unread" | "Unanswered" | "Spam";

const FILTERS: Filter[] = [
  "All",
  "Read",
  "Unread",
  "Unanswered",
  "Spam",
];

function ChatContent() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const listingParam = searchParams.get("listing");
  const sellerParam = searchParams.get("seller");
  const title = searchParams.get("title") || "Marketplace listing";
  const price = searchParams.get("price") || "";

  const listingId =
    listingParam && Number.isSafeInteger(Number(listingParam))
      ? Number(listingParam)
      : null;

  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [selectedUser, setSelectedUser] = useState("");
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
          "id, sender_id, receiver_id, listing_id, message, created_at, is_read, is_spam, read_at"
        )
        .or(
          `sender_id.eq.${currentUser},receiver_id.eq.${currentUser}`
        )
        .order("created_at", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
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
      const { data, error: authError } =
        await supabase.auth.getUser();

      if (!active) return;

      if (authError || !data.user) {
        setError("Please sign in to view your messages.");
        setLoading(false);
        return;
      }

      const currentUser = data.user.id;
      setUserId(currentUser);

      if (sellerParam && sellerParam !== currentUser) {
        setSelectedUser(sellerParam);
        setSelectedListingId(listingId);
      }

      await loadMessages(currentUser);

      if (active) setLoading(false);
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [supabase, sellerParam, listingId, loadMessages]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`messages-inbox-${userId}`)
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
        unread: items.some(
          (message) =>
            message.receiver_id === userId &&
            !message.is_read &&
            !message.is_spam
        ),
        spam: items.some((message) => message.is_spam),
        unanswered: latest.sender_id !== userId,
      };
    });
  }, [messages, userId]);

  const visibleConversations = useMemo(
    () =>
      conversations.filter((conversation) => {
        switch (activeFilter) {
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
      }),
    [activeFilter, conversations]
  );

  const selectedConversation = conversations.find(
    (conversation) =>
      conversation.otherUser === selectedUser &&
      conversation.listingId === selectedListingId
  );

  const conversationMessages = selectedConversation?.items || [];

  const markRead = useCallback(
    async (message: Message) => {
      if (
        message.receiver_id !== userId ||
        message.is_read ||
        message.is_spam
      ) {
        return;
      }

      const readAt = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("messages")
        .update({
          is_read: true,
          read_at: readAt,
        })
        .eq("id", message.id)
        .eq("receiver_id", userId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessages((current) =>
        current.map((item) =>
          item.id === message.id
            ? { ...item, is_read: true, read_at: readAt }
            : item
        )
      );
    },
    [supabase, userId]
  );

  useEffect(() => {
    if (!selectedConversation) return;

    for (const message of selectedConversation.items) {
      if (
        message.receiver_id === userId &&
        !message.is_read &&
        !message.is_spam
      ) {
        void markRead(message);
      }
    }
  }, [selectedConversation, userId, markRead]);

  async function sendMessage() {
    const text = draft.trim();

    if (!text || !userId || sending) return;

    const recipient = selectedUser || sellerParam || "";

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
      setError(sendError.message);
    } else {
      setDraft("");
      setSelectedUser(recipient);
      setNotice("Message sent successfully.");
      await loadMessages(userId);
    }

    setSending(false);
  }

  async function toggleSpam(conversation: {
    items: Message[];
    spam: boolean;
  }) {
    const receivedIds = conversation.items
      .filter((message) => message.receiver_id === userId)
      .map((message) => message.id);

    if (receivedIds.length === 0) {
      setError("Only received messages can be marked as spam.");
      return;
    }

    const nextSpam = !conversation.spam;

    const { error: updateError } = await supabase
      .from("messages")
      .update({ is_spam: nextSpam })
      .in("id", receivedIds)
      .eq("receiver_id", userId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadMessages(userId);
    setNotice(nextSpam ? "Messages marked as spam." : "Spam status removed.");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-3 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">
              BestSalesGH / Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-bold">Messages</h1>
            <p className="mt-1 text-sm text-slate-500">
              Communicate with buyers and sellers.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-100"
          >
            Back to Dashboard
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

        <section className="grid min-h-[650px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[340px_1fr]">
          <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-200 p-4">
              <h2 className="font-semibold">Your Inbox</h2>
              <p className="mt-1 text-xs text-slate-500">
                {conversations.length} conversations
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      activeFilter === filter
                        ? "bg-blue-700 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[360px] overflow-y-auto lg:max-h-[600px]">
              {loading ? (
                <p className="p-5 text-sm text-slate-500">
                  Loading messages...
                </p>
              ) : visibleConversations.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">
                  No conversations in this filter.
                </p>
              ) : (
                visibleConversations.map((conversation) => (
                  <button
                    key={conversation.key}
                    type="button"
                    onClick={() => {
                      setSelectedUser(conversation.otherUser);
                      setSelectedListingId(conversation.listingId);
                      setError("");
                      setNotice("");
                    }}
                    className={`w-full border-b border-slate-100 p-4 text-left hover:bg-slate-50 ${
                      selectedUser === conversation.otherUser &&
                      selectedListingId === conversation.listingId
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="break-all text-sm font-semibold">
                        User {conversation.otherUser.slice(0, 8)}...
                      </span>

                      {conversation.unread && (
                        <span className="rounded-full bg-blue-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                          Unread
                        </span>
                      )}
                    </div>

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

          <section className="flex min-h-[500px] flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 sm:p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Conversation
                </p>
                <h2 className="mt-1 break-all text-lg font-bold">
                  {selectedUser
                    ? `User ${selectedUser.slice(0, 8)}...`
                    : sellerParam
                      ? `Seller ${sellerParam.slice(0, 8)}...`
                      : "Select a conversation"}
                </h2>

                {(listingParam || title !== "Marketplace listing") && (
                  <p className="mt-1 text-sm text-slate-500">
                    {title}
                    {price ? ` · ${price}` : ""}
                  </p>
                )}
              </div>

              {selectedConversation && (
                <button
                  type="button"
                  onClick={() => void toggleSpam(selectedConversation)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-100"
                >
                  {selectedConversation.spam
                    ? "Remove Spam"
                    : "Mark Spam"}
                </button>
              )}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 sm:p-6">
              {conversationMessages.length === 0 ? (
                <div className="mx-auto mt-12 max-w-sm text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl">
                    ✉
                  </div>
                  <h3 className="mt-3 font-semibold">
                    Start a conversation
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Select a conversation or open chat from a listing to get started.
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
                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
                          ownMessage
                            ? "bg-blue-700 text-white"
                            : "border border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm">
                          {message.message}
                        </p>
                        <p
                          className={`mt-2 text-[10px] ${
                            ownMessage
                              ? "text-blue-100"
                              : "text-slate-400"
                          }`}
                        >
                          {new Date(
                            message.created_at
                          ).toLocaleString()}
                          {ownMessage && message.is_read ? " · Read" : ""}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form
              className="border-t border-slate-200 bg-white p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
            >
              <label
                htmlFor="message-draft"
                className="mb-2 block text-sm font-semibold"
              >
                Your message
              </label>

              <textarea
                id="message-draft"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write your message..."
                rows={3}
                maxLength={5000}
                disabled={!userId || sending}
                className="w-full resize-y rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  Keep conversations safe and respectful.
                </p>

                <button
                  type="submit"
                  disabled={
                    !draft.trim() ||
                    !userId ||
                    sending ||
                    !(selectedUser || sellerParam)
                  }
                  className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </div>
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
          <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-6">
            Loading messages...
          </div>
        </main>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
