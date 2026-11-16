
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadUnreadCount = useCallback(async () => {
    const supabase = supabaseBrowser();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (!error) {
      setUnreadCount(count || 0);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadUnreadCount();

    const supabase = supabaseBrowser();

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let active = true;

    async function subscribeToNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active || !user) return;

      channel = supabase
        .channel(`notification-bell-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            void loadUnreadCount();
          }
        )
        .subscribe();
    }

    void subscribeToNotifications();

    return () => {
      active = false;

      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [loadUnreadCount]);

  return (
    <Link
      href="/dashboard/notifications"
      aria-label={`Notifications, ${unreadCount} unread`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-700 transition hover:bg-slate-100"
    >
      <span aria-hidden="true">🔔</span>

      {!loading && unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
