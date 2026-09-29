"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

export default function ClientAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = supabaseBrowser();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  if (loading) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            My Account
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Register
          </Link>
        </>
      )}
    </div>
  );
}
