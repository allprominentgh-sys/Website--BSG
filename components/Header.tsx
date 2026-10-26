
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

export default function Header() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [currency, setCurrency] = useState("GHS");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  const closeMenu = () => setMenuOpen(false);

  const loadNotifications = useCallback(
    async (currentUserId: string) => {
      setLoadingNotifications(true);
      setNotificationError("");

      try {
        const [listResult, countResult] = await Promise.all([
          supabase
            .from("notifications")
            .select("id, type, title, body, href, read_at, created_at")
            .eq("user_id", currentUserId)
            .order("created_at", { ascending: false })
            .limit(10),

          supabase
            .from("notifications")
            .select("id", { count: "exact", head: true })
            .eq("user_id", currentUserId)
            .is("read_at", null),
        ]);

        if (listResult.error) throw listResult.error;
        if (countResult.error) throw countResult.error;

        setNotifications((listResult.data ?? []) as NotificationItem[]);
        setUnreadCount(countResult.count ?? 0);
      } catch (error) {
        console.error("Could not load notifications:", error);
        setNotificationError("Unable to load notifications. Please try again.");
      } finally {
        setLoadingNotifications(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    let active = true;

    async function checkUser() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        setUserId(null);
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      setUserId(data.user.id);
      void loadNotifications(data.user.id);
    }

    void checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      const nextUserId = session?.user?.id ?? null;
      setUserId(nextUserId);

      if (nextUserId) {
        void loadNotifications(nextUserId);
      } else {
        setNotifications([]);
        setUnreadCount(0);
        setNotificationsOpen(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase, loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    const notification = notifications.find(
      (item) => item.id === notificationId
    );

    if (!notification || notification.read_at) return;

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("id", notificationId)
      .eq("user_id", userId)
      .is("read_at", null);

    if (error) {
      console.error("Could not mark notification as read:", error);
      setNotificationError("Could not update this notification.");
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, read_at: now } : item
      )
    );

    setUnreadCount((current) => Math.max(0, current - 1));
  };

  const markAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("user_id", userId)
      .is("read_at", null);

    if (error) {
      console.error("Could not mark all notifications as read:", error);
      setNotificationError("Could not update notifications.");
      return;
    }

    setNotifications((current) =>
      current.map((item) => ({ ...item, read_at: item.read_at ?? now }))
    );
    setUnreadCount(0);
  };

  const safeHref = (href: string | null) => {
    if (!href || !href.startsWith("/") || href.startsWith("//")) {
      return "/account";
    }

    return href;
  };

  const formatDate = (date: string) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "";

    return parsed.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" onClick={closeMenu}>
          <span className="brand-name">ALL PROMINENT GHANA</span>
          <span className="brand-tagline">
            Buy • Sell • Advertise • Connect
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/listings">Marketplace</Link>
          <Link href="/post-ad">Advertise</Link>
          <Link href="/supermarket" className="supermarket-link">
            Supermarket
          </Link>
          <Link href="/account">My Account</Link>
        </nav>

        <div className="header-actions">
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            aria-label="Currency"
          >
            <option value="GHS">GH₵ GHS</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
            <option value="CNY">¥ CNY</option>
          </select>

          {userId && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const opening = !notificationsOpen;
                  setNotificationsOpen(opening);

                  if (opening && userId) {
                    void loadNotifications(userId);
                  }
                }}
                className="relative inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-gray-300 bg-white px-3 py-2 text-xl text-gray-800 hover:bg-gray-100"
                aria-label={`Notifications, ${unreadCount} unread`}
                aria-expanded={notificationsOpen}
                aria-haspopup="true"
              >
                <span aria-hidden="true">🔔</span>

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div
                  className="absolute right-0 z-50 mt-2 w-[min(92vw,24rem)] overflow-hidden rounded-xl border border-gray-200 bg-white text-left text-gray-900 shadow-xl"
                  role="region"
                  aria-label="Your notifications"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
                    <div>
                      <h2 className="font-semibold">Notifications</h2>
                      <p className="text-xs text-gray-500">
                        {unreadCount} unread
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void markAllAsRead()}
                      disabled={unreadCount === 0}
                      className="text-sm font-medium text-blue-700 hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                      Mark all read
                    </button>
                  </div>

                  {notificationError && (
                    <div className="px-4 py-3 text-sm text-red-700">
                      {notificationError}
                      <button
                        type="button"
                        onClick={() => {
                          if (userId) void loadNotifications(userId);
                        }}
                        className="ml-2 font-semibold underline"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {loadingNotifications && notifications.length === 0 && (
                    <p className="px-4 py-6 text-center text-sm text-gray-500">
                      Loading notifications…
                    </p>
                  )}

                  {!loadingNotifications &&
                    !notificationError &&
                    notifications.length === 0 && (
                      <div className="px-4 py-8 text-center">
                        <p className="text-2xl" aria-hidden="true">🔔</p>
                        <p className="mt-2 font-medium">You’re all caught up</p>
                        <p className="mt-1 text-sm text-gray-500">
                          New marketplace updates will appear here.
                        </p>
                      </div>
                    )}

                  <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`border-b border-gray-100 ${
                          notification.read_at ? "bg-white" : "bg-blue-50"
                        }`}
                      >
                        <Link
                          href={safeHref(notification.href)}
                          onClick={() => {
                            void markAsRead(notification.id);
                            setNotificationsOpen(false);
                            closeMenu();
                          }}
                          className="block px-4 py-3 hover:bg-gray-50"
                        >
                          <div className="flex items-start gap-2">
                            {!notification.read_at && (
                              <span
                                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600"
                                aria-label="Unread"
                              />
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold">
                                {notification.title}
                              </p>

                              {notification.body && (
                                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-600">
                                  {notification.body}
                                </p>
                              )}

                              <p className="mt-1 text-xs text-gray-400">
                                {formatDate(notification.created_at)}
                              </p>
                            </div>
                          </div>
                        </Link>

                        {!notification.read_at && (
                          <div className="px-4 pb-2 pl-8">
                            <button
                              type="button"
                              onClick={() => void markAsRead(notification.id)}
                              className="text-xs font-medium text-blue-700 hover:underline"
                            >
                              Mark as read
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (userId) void loadNotifications(userId);
                      }}
                      className="text-sm font-medium text-blue-700 hover:underline"
                    >
                      Refresh notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <Link href="/post-ad" className="sell-button">
            + Sell an Item
          </Link>
        </div>

        <button
          type="button"
          className="menu-button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <Link href="/" onClick={closeMenu}>🏠 Home</Link>
          <Link href="/listings" onClick={closeMenu}>🛍️ Marketplace</Link>
          <Link href="/post-ad" onClick={closeMenu}>📢 Advertise</Link>
          <Link href="/supermarket" onClick={closeMenu}>🛒 Supermarket</Link>
          <Link href="/account" onClick={closeMenu}>👤 My Account</Link>

          {userId && (
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((value) => !value);
                if (userId) void loadNotifications(userId);
                closeMenu();
              }}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left"
            >
              <span>🔔 Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          )}

          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            aria-label="Mobile currency"
          >
            <option value="GHS">GH₵ GHS</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
            <option value="CNY">¥ CNY</option>
          </select>

          <Link href="/post-ad" className="mobile-sell" onClick={closeMenu}>
            + Sell an Item
          </Link>
        </div>
      )}
    </header>
  );
}
