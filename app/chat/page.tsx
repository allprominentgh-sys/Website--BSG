"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase-browser";

type Message = {
  id: number;
  sender_id: string;
  receiver_id: string;
  listing_id: number | null;
  message: string;
  created_at: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  /*
   * DEMO RECEIVER
   *
   * We will replace this with the actual seller/buyer ID
   * when we connect the chat to a listing.
   */
  const receiverId = "";

  /*
   * DEMO LISTING
   *
   * We will replace this with the actual listing ID
   * when the listing page opens a conversation.
   */
  const listingId: number | null = null;

  useEffect(() => {
    loadChat();
  }, []);

  async function loadChat() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Please sign in to use chat.");
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data, error: messageError } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", {
        ascending: true,
      });

    if (messageError) {
      console.error(messageError);
      setError("Unable to load your messages.");
      setLoading(false);
      return;
    }

    setMessages((data as Message[]) || []);
    setLoading(false);
  }

  async function sendMessage() {
    const text = newMessage.trim();

    if (!text) return;

    if (!userId) {
      setError("Please sign in first.");
      return;
    }

    if (!receiverId) {
      setError(
        "The conversation recipient has not been connected yet."
      );
      return;
    }

    setSending(true);
    setError("");

    const { data, error: sendError } = await supabase
      .from("messages")
      .insert({
        sender_id: userId,
        receiver_id: receiverId,
        listing_id: listingId,
        message: text,
      })
      .select()
      .single();

    if (sendError) {
      console.error(sendError);
      setError("Message could not be sent.");
      setSending(false);
      return;
    }

    setMessages((current) => [...current, data as Message]);
    setNewMessage("");
    setSending(false);
  }

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`messages-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message;

          if (
            newMessage.sender_id === userId ||
            newMessage.receiver_id === userId
          ) {
            setMessages((current) => {
              const exists = current.some(
                (message) => message.id === newMessage.id
              );

              if (exists) return current;

              return [...current, newMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <Link href="/" className="block">
            <div className="text-xl font-black tracking-tight text-slate-900">
              BEST SALES GHANA
            </div>

            <div className="text-xs font-medium text-slate-500">
              Buy • Sell • Advertise • Connect
            </div>
          </Link>

          <div className="flex items-center gap-2">
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

      {/* CHAT */}
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* CHAT HEADER */}
          <div className="border-b border-slate-200 p-5">

            <h1 className="text-2xl font-black text-slate-900">
              Messages
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              BEST SALES GHANA marketplace chat
            </p>

          </div>

          {/* ERROR */}
          {error && (
            <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          {/* MESSAGES */}
          <div className="min-h-[550px] space-y-4 overflow-y-auto bg-slate-50 p-4 sm:p-6">

            {loading ? (
              <div className="flex min-h-[500px] items-center justify-center">
                <p className="font-bold text-slate-400">
                  Loading messages...
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex min-h-[500px] items-center justify-center text-center">

                <div>
                  <div className="text-5xl">
                    💬
                  </div>

                  <h2 className="mt-4 text-xl font-black text-slate-900">
                    No messages yet
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Your marketplace conversations will appear here.
                  </p>
                </div>

              </div>
            ) : (
              messages.map((message) => {

                const mine = message.sender_id === userId;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      mine
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                        mine
                          ? "rounded-br-md bg-blue-700 text-white"
                          : "rounded-bl-md bg-white text-slate-800"
                      }`}
                    >

                      <p className="text-sm leading-6">
                        {message.message}
                      </p>

                      <p
                        className={`mt-1 text-right text-[10px] ${
                          mine
                            ? "text-blue-100"
                            : "text-slate-400"
                        }`}
                      >
                        {new Date(
                          message.created_at
                        ).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>

                    </div>

                  </div>
                );
              })
            )}

          </div>

          {/* COMPOSER */}
          <div className="border-t border-slate-200 bg-white p-4">

            <div className="flex items-end gap-2">

              <button
                type="button"
                title="Attach file"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-300 text-xl hover:bg-slate-50"
              >
                📎
              </button>

              <textarea
                value={newMessage}
                onChange={(e) =>
                  setNewMessage(e.target.value)
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                placeholder="Write a message..."
                className="min-h-12 flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={sendMessage}
                disabled={sending}
                className="h-12 rounded-xl bg-blue-700 px-5 font-black text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send"}
              </button>

            </div>

            <p className="mt-2 text-center text-xs text-slate-400">
              Never share passwords, PINs or sensitive financial information
              in chat.
            </p>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 px-4 py-8 text-center text-sm text-slate-500">

        <p className="font-black text-white">
          BEST SALES GHANA
        </p>

        <p className="mt-2">
          Buy • Sell • Advertise • Connect
        </p>

        <p className="mt-4">
          © 2026 All Prominent Ghana Limited. All rights reserved.
        </p>

      </footer>

    </main>
  );
}
