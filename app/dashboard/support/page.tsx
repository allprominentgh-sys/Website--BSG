"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type SupportMessage = {
  id: string;
  user_id: string;
  sender_role: "customer" | "admin";
  message: string;
  created_at: string;
};

export default function SupportPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadMessages = useCallback(async () => {
    const supabase = supabaseBrowser();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      window.location.replace("/login");
      return;
    }

    setUserId(user.id);
    setUserEmail(user.email || "");

    const { data, error: messagesError } = await supabase
      .from("support_messages")
      .select("id, user_id, sender_role, message, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("SUPPORT MESSAGES ERROR:", messagesError);
      setError(
        "We couldn't load your messages. Please check your support database setup."
      );
      return;
    }

    setMessages((data || []) as SupportMessage[]);
    setError("");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        await loadMessages();
      } catch (err) {
        if (!cancelled) {
          console.error("SUPPORT INITIALIZATION ERROR:", err);
          setError("Unable to open customer support. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [loadMessages]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage || sending) return;

    setSending(true);
    setError("");
    setNotice("");

    try {
      const supabase = supabaseBrowser();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.replace("/login");
        return;
      }

      const { error: insertError } = await supabase
        .from("support_messages")
        .insert({
          user_id: user.id,
          sender_role: "customer",
          message: cleanMessage,
        });

      if (insertError) {
        console.error("SUPPORT SEND ERROR:", insertError);
        setError("Your message could not be sent. Please try again.");
        return;
      }

      setMessage("");
      setNotice("Your message has been sent to customer support.");

      await loadMessages();
    } catch (err) {
      console.error("SUPPORT SEND ERROR:", err);
      setError("Something went wrong while sending your message.");
    } finally {
      setSending(false);
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <main className="min-h-screen bg-[#f3f7fb] text-[#15365d]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#12345b] font-black text-white">
              AP
            </div>

            <div>
              <p className="text-sm font-black tracking-wide text-[#12345b]">
                BEST SALES GHANA
              </p>
              <p className="text-xs text-slate-500">
                Customer Service Centre
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold hover:bg-slate-50"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="overflow-hidden rounded-3xl border border-[#dce6ef] bg-white shadow-sm">
          <div className="bg-[#12345b] p-6 text-white sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
              We are here to help
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Help & Support
            </h1>

            <p className="mt-3 text-sm leading-6 text-blue-100 sm:text-base">
              Send our customer service team a message about your account,
              advertisements, payments or other issues.
            </p>

            {userEmail && (
              <p className="mt-4 break-all text-sm text-blue-200">
                Signed in as {userEmail}
              </p>
            )}
          </div>

          <div className="p-4 sm:p-7">
            {error && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {notice && (
              <div
                role="status"
                className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
              >
                {notice}
              </div>
            )}

            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-[#12345b]">
                  Your conversation
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your messages are linked to your account.
                </p>
              </div>

              <button
                type="button"
                onClick={loadMessages}
                disabled={loading}
                className="rounded-xl border border-blue-200 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
              >
                Refresh
              </button>
            </div>

            <div
              className="min-h-[280px] space-y-4 rounded-2xl bg-[#f7faff] p-4 sm:p-5"
              aria-live="polite"
            >
              {loading ? (
                <p className="py-12 text-center text-sm text-slate-500">
                  Loading your messages...
                </p>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-4xl">💬</div>
                  <h3 className="mt-3 font-black text-[#12345b]">
                    How can we help?
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Send your first message below. Our support team can
                    review your request through the administrator inbox
                    once it is connected.
                  </p>
                </div>
              ) : (
                messages.map((item) => {
                  const isCustomer = item.sender_role === "customer";

                  return (
                    <div
                      key={item.id}
                      className={`flex ${
                        isCustomer ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl p-4 sm:max-w-[80%] ${
                          isCustomer
                            ? "bg-[#2453dc] text-white"
                            : "border border-slate-200 bg-white text-[#15365d]"
                        }`}
                      >
                        <p className="mb-2 text-xs font-black uppercase tracking-wide opacity-80">
                          {isCustomer
                            ? "You"
                            : "BestSalesGH Support"}
                        </p>

                        <p className="whitespace-pre-wrap break-words text-sm leading-6">
                          {item.message}
                        </p>

                        <p className="mt-3 text-right text-[11px] opacity-75">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSend} className="mt-5 space-y-3">
              <label
                htmlFor="support-message"
                className="block text-sm font-bold text-[#15365d]"
              >
                Write your message
              </label>

              <textarea
                id="support-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Describe how our customer service team can help..."
                rows={4}
                maxLength={5000}
                required
                className="w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 text-base outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  {message.length}/5000 characters
                </p>

                <button
                  type="submit"
                  disabled={sending || !message.trim() || !userId}
                  className="rounded-xl bg-[#2453dc] px-6 py-3 font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send Message →"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <footer className="py-8 text-center">
          <p className="font-black text-[#12345b]">BEST SALES GHANA</p>
          <p className="mt-2 text-sm text-slate-500">
            © 2026 All Prominent Ghana Limited. All rights reserved.
          </p>
        </footer>
      </section>
    </main>
  );
}
