"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/supabase-browser";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    "google" | "apple" | null
  >(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const supabase = supabaseBrowser();

      const {
        data,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        throw loginError;
      }

      if (!data.user) {
        throw new Error("Login failed. Please try again.");
      }

      setSuccess("Login successful. Redirecting...");

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to sign in.";

      if (
        message.toLowerCase().includes("invalid login")
      ) {
        setError(
          "Incorrect email or password. Please check your details and try again."
        );
      } else if (
        message.toLowerCase().includes("email not confirmed")
      ) {
        setError(
          "Your email address has not been confirmed. Please check your email."
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setSuccess("");
    setSocialLoading("google");

    try {
      const supabase = supabaseBrowser();

      const redirectTo =
        `${window.location.origin}/auth/callback`;

      const { error: oauthError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
          },
        });

      if (oauthError) {
        throw oauthError;
      }
    } catch (err) {
      setSocialLoading(null);

      setError(
        err instanceof Error
          ? err.message
          : "Google sign-in failed."
      );
    }
  }

  async function handleAppleLogin() {
    setError("");
    setSuccess("");
    setSocialLoading("apple");

    try {
      const supabase = supabaseBrowser();

      const redirectTo =
        `${window.location.origin}/auth/callback`;

      const { error: oauthError } =
        await supabase.auth.signInWithOAuth({
          provider: "apple",
          options: {
            redirectTo,
          },
        });

      if (oauthError) {
        throw oauthError;
      }
    } catch (err) {
      setSocialLoading(null);

      setError(
        err instanceof Error
          ? err.message
          : "Apple sign-in failed."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

          <Link
            href="/"
            className="flex items-center gap-3"
          >

            {/* LOGO */}
            <div className="logo-mark">
              <div className="logo-ring">
                <div className="logo-person">
                  <span className="logo-head" />
                  <span className="logo-arm logo-arm-left" />
                  <span className="logo-arm logo-arm-right" />
                  <span className="logo-body" />
                </div>
              </div>
            </div>

            <div>
              <div className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                BEST SALES GHANA
              </div>

              <div className="text-xs font-medium text-slate-500 sm:text-sm">
                Buy • Sell • Advertise • Connect
              </div>
            </div>

          </Link>

          <Link
            href="/register"
            className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-800"
          >
            Create Account
          </Link>

        </div>
      </header>


      {/* LOGIN AREA */}
      <section className="relative flex min-h-[calc(100vh-90px)] items-center justify-center overflow-hidden px-4 py-12">

        {/* BACKGROUND */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-100/60" />

        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-cyan-100/60" />


        <div className="relative z-10 w-full max-w-md">

          {/* CARD */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">


            {/* TITLE */}
            <div className="mb-8 text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 shadow-lg">

                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line
                    x1="15"
                    y1="12"
                    x2="3"
                    y2="12"
                  />
                </svg>

              </div>

              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">
                Welcome Back
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                Sign in
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to your BEST SALES GHANA account.
              </p>

            </div>


            {/* ERROR */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}


            {/* SUCCESS */}
            {success && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                {success}
              </div>
            )}


            {/* EMAIL LOGIN */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* EMAIL */}
              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />

              </div>


              {/* PASSWORD */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-sm font-bold text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                  >
                    Forgot password?
                  </Link>

                </div>


                <div className="relative">

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-20 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>


              {/* REMEMBER */}
              <div className="flex items-center">

                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(event) =>
                    setRemember(
                      event.target.checked
                    )
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                />

                <label
                  htmlFor="remember"
                  className="ml-2 text-sm font-medium text-slate-600"
                >
                  Remember me
                </label>

              </div>


              {/* SIGN IN */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-700 px-5 py-3.5 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}

              </button>

            </form>


            {/* DIVIDER */}
            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-sm font-bold text-slate-400">
                OR
              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>


            {/* GOOGLE */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={
                socialLoading !== null ||
                loading
              }
              className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >

              {socialLoading === "google" ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.95h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.25Z"
                  />

                  <path
                    fill="#34A853"
                    d="M12 21.7c2.63 0 4.84-.87 6.45-2.37l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.7Z"
                  />

                  <path
                    fill="#FBBC05"
                    d="M6.54 13.77A5.86 5.86 0 0 1 6.23 12c0-.61.1-1.2.31-1.77V7.7H3.29A9.72 9.72 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.3l3.25-2.53Z"
                  />

                  <path
                    fill="#EA4335"
                    d="M12 6.2c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.28 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.71 5.4l3.25 2.53C7.31 7.92 9.46 6.2 12 6.2Z"
                  />
                </svg>
              )}

              {socialLoading === "google"
                ? "Connecting..."
                : "Continue with Google"}

            </button>


            {/* APPLE */}
            <button
              type="button"
              onClick={handleAppleLogin}
              disabled={
                socialLoading !== null ||
                loading
              }
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-black px-5 py-3.5 font-bold text-white transition hover:bg-slate-900 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >

              {socialLoading === "apple" ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.1.79 1.21-.24 2.37-.93 3.66-.84 1.55.12 2.72.74 3.5 1.84-3.2 1.92-2.44 6.13.49 7.31-.59 1.55-1.36 3.09-2.75 3.87ZM12.05 7.25C11.9 4.94 13.77 3.04 15.93 2.91c.3 2.66-2.42 4.64-3.88 4.34Z" />
                </svg>
              )}

              {socialLoading === "apple"
                ? "Connecting..."
                : "Continue with Apple"}

            </button>


            {/* REGISTER */}
            <div className="mt-8 border-t border-slate-200 pt-7 text-center">

              <p className="text-sm text-slate-500">
                Don't have an account?
              </p>

              <Link
                href="/register"
                className="mt-2 inline-block font-black text-blue-700 hover:text-blue-900"
              >
                Create an account
              </Link>

            </div>


            {/* BACK */}
            <Link
              href="/"
              className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-700"
            >
              ← Back to BEST SALES GHANA
            </Link>

          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-950 px-4 py-6 text-center text-sm text-slate-400">
        © 2026 All Prominent Ghana Limited. All rights reserved.
      </footer>

    </main>
  );
}
