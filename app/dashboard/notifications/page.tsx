
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

type Notification = {
  id: string;
  type: string | null;
  title: string;
  body: string | null;
  href: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

export default function NotificationsPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const unreadCount = notifications.filter(
    (item) => !item.read_at
  ).length;

  const loadNotifications = useCallback(async () => {
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.replace("/login?next=/dashboard/notifications");
      return;
    }

    const { data, error: queryError } = await supabase
      .from("notifications")
      .select(
        "id, type, title, body, href, data, read_at, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (queryError) {
      setError(queryError.message);
      setNotifications([]);
    } else {
      setNotifications((data || []) as Notification[]);
    }

    setLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  async function markAsRead(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const readAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("id", id)
      .eq("user_id", user.id)
      .is("read_at", null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, read_at: readAt } : item
      )
    );
  }

  async function markAllAsRead() {
    if (!unreadCount) return;

    setUpdating(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUpdating(false);
      return;
    }

    const readAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (updateError) {
      setError(updateError.message);
    } else {
      setNotifications((current) =>
        current.map((item) =>
          item.read_at ? item : { ...item, read_at: readAt }
        )
      );
    }

    setUpdating(false);
  }

  function notificationIcon(type: string | null) {
    switch (type) {
      case "ad_view":
        return "👁️";
      case "message":
        return "💬";
      case "new_order":
      case "order":
        return "🛍️";
      case "payment":
      case "payment_received":
        return "💳";
      case "ad_approved":
        return "✅";
      case "ad_rejected":
        return "⚠️";
      case "promotion":
        return "📢";
      case "delivery":
        return "🚚";
      default:
        return "🔔";
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString("en-GH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl animate-pulse">
          <div className="mb-4 h-8 w-64 rounded bg-slate-200" />
          <div className="h-28 rounded-xl bg-slate-200" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="mb-3 inline-flex text-sm font-medium text-blue-700 hover:underline"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Stay updated on your adverts, customers and sales.
            </p>
          </div>

          <button
            onClick={() => void loadNotifications()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div>
            <p className="text-sm text-slate-500">Unread notifications</p>
            <p className="text-2xl font-bold text-blue-700">
              {unreadCount}
            </p>
          </div>

          <button
            onClick={() => void markAllAsRead()}
            disabled={!unreadCount || updating}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {updating ? "Updating..." : "Mark all as read"}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
            <div className="mb-3 text-4xl">🔔</div>
            <h2 className="font-semibold text-slate-900">
              No notifications yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Your advert views and account updates will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {notifications.map((item) => {
              const safeHref =
                item.href &&
                item.href.startsWith("/") &&
                !item.href.startsWith("//")
                  ? item.href
                  : null;

              return (
                <div
                  key={item.id}
                  className={`flex gap-3 border-b border-slate-100 p-4 last:border-b-0 ${
                    item.read_at ? "bg-white" : "bg-blue-50/60"
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
                    {notificationIcon(item.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="font-semibold text-slate-900">
                        {item.title}
                      </h2>

                      {!item.read_at && (
                        <span className="rounded-full bg-blue-700 px-2 py-1 text-xs font-semibold text-white">
                          New
                        </span>
                      )}
                    </div>

                    {item.body && (
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.body}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-400">
                      {formatDate(item.created_at)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-4">
                      {safeHref && (
                        <Link
                          href={safeHref}
                          onClick={() => {
                            if (!item.read_at) {
                              void markAsRead(item.id);
                            }
                          }}
                          className="text-sm font-semibold text-blue-700 hover:underline"
                        >
                          View details →
                        </Link>
                      )}

                      {!item.read_at && (
                        <button
                          onClick={() => void markAsRead(item.id)}
                          className="text-sm font-medium text-slate-500 hover:text-blue-700"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
