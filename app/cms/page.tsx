“use client”;

import Link from “next/link”;
import { useEffect, useState } from “react”;
import { supabaseBrowser } from “@/supabase-browser”;

type SupportMessage = {
id: string;
user_id: string;
sender_role: string | null;
message: string;
created_at: string;
};

export default function SupportCMSPage() {
const [messages, setMessages] = useState<SupportMessage[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(””);
const [isAdmin, setIsAdmin] = useState(false);

async function loadCMS() {
setLoading(true);
setError(””);

try {
  const supabase = supabaseBrowser();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    window.location.href = "/login";
    return;
  }
  // Replace this check with your verified admin-role
  // policy before granting administrative permissions.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (
    !["admin", "administrator"].includes(
      (profile?.account_type ?? "").toLowerCase()
    )
  ) {
    setIsAdmin(false);
    setMessages([]);
    setError("Administrator access required.");
    return;
  }
  setIsAdmin(true);
  const { data, error: messageError } = await supabase
    .from("support_messages")
    .select("id, user_id, sender_role, message, created_at")
    .order("created_at", { ascending: false });
  if (messageError) throw messageError;
  setMessages((data ?? []) as SupportMessage[]);
} catch (err) {
  setError(
    err instanceof Error ? err.message : "Unable to load the support CMS."
  );
} finally {
  setLoading(false);
}

}

useEffect(() => {
void loadCMS();
}, []);

useEffect(() => {
if (!isAdmin) return;

const supabase = supabaseBrowser();
const channel = supabase
  .channel("cms-support-live")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "support_messages",
    },
    () => {
      void loadCMS();
    }
  )
  .subscribe();
return () => {
  void supabase.removeChannel(channel);
};

}, [isAdmin]);

const openCount = messages.filter(
(item) => item.sender_role !== “admin”
).length;

return (
BestSalesGH Support CMS
Manage customer conversations, support agents and referrals.
Live updates enabled
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="rounded-xl border bg-white px-5 py-3 font-bold"
        >
          Back to Admin
        </Link>
        <button
          onClick={() => void loadCMS()}
          className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white"
        >
          Refresh
        </button>
      </div>
    </header>
    {error && (
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 font-semibold text-red-800">
        {error}
      </div>
    )}
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        ["Total Messages", messages.length],
        ["Open", openCount],
        ["Pending", 0],
        ["Unassigned", messages.length],
      ].map(([label, value]) => (
        <article
          key={String(label)}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <p className="font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-4xl font-black">
            {loading ? "…" : value}
          </p>
        </article>
      ))}
    </section>
    <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black">Support Team</h2>
      <p className="mt-2 text-slate-600">
        Five initial staff slots, with room to grow.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map((number) => (
          <article
            key={number}
            className="rounded-xl border border-slate-200 p-5"
          >
            <p className="text-sm font-bold text-blue-700">
              SUPPORT AGENT {number}
            </p>
            <p className="mt-2 font-semibold">
              {`Agent ${number}`}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Staff account not configured
            </p>
          </article>
        ))}
      </div>
      <p className="mt-5 text-sm text-slate-600">
        Agent accounts, assignments and individual dashboards require
        the support-team database and secure server-side permissions.
      </p>
    </section>
    <section className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-5">
        <h2 className="text-2xl font-black">Customer Support Inbox</h2>
      </div>
      {loading ? (
        <p className="p-6">Loading conversations...</p>
      ) : !isAdmin ? (
        <p className="p-6 text-slate-600">
          Sign in with an authorized administrator account to view
          customer conversations.
        </p>
      ) : messages.length === 0 ? (
        <p className="p-6 text-slate-600">
          No support messages found.
        </p>
      ) : (
        <div className="divide-y">
          {messages.map((item) => (
            <article key={item.id} className="p-5">
              <p className="font-bold">Customer Conversation</p>
              <p className="mt-1 break-all text-xs text-slate-500">
                Customer ID: {item.user_id}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(item.created_at).toLocaleString("en-GH")}
              </p>
              <p className="mt-3 whitespace-pre-wrap break-words">
                {item.message}
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Sender: {item.sender_role || "Customer"}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  </div>
</main>

);
}
