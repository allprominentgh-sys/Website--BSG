"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type AccountType = "buyer" | "seller" | "business" | "";

type DeliveryOption =
  | "best-sales-delivery"
  | "seller-delivery"
  | "buyer-pickup"
  | "";

export default function RegisterPage() {
  const supabase = supabaseBrowser();

  const [accountType, setAccountType] = useState<AccountType>("");
  const [deliveryOption, setDeliveryOption] =
    useState<DeliveryOption>("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!accountType) {
      setError("Please select an account type.");
      return;
    }

    if (!deliveryOption) {
      setError("Please select your preferred delivery option.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms & Conditions and Privacy Policy.");
      return;
    }

    try {
      setLoading(true);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            account_type: accountType,
            delivery_option: deliveryOption,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user && !data.session) {
        setMessage(
          "Account created successfully. Please check your email to confirm your account."
        );
      } else if (data.session) {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err?.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setError("");
    setMessage("");
    setGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      setError(err?.message || "Google sign-in could not be started.");
      setGoogleLoading(false);
    }
  }

  async function signInWithApple() {
    setError("");
    setMessage("");
    setAppleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      setError(err?.message || "Apple sign-in could not be started.");
      setAppleLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

          <Link href="/" className="block">
            <div className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              BEST SALES GHANA
            </div>

            <div className="text-sm font-medium text-slate-500">
              Buy • Sell • Advertise • Connect
            </div>
          </Link>

          <Link
            href="/login"
            className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-md hover:bg-blue-800"
          >
            Sign In
          </Link>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-700 to-cyan-500 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">

          <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-100">
            Join Our Marketplace
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Create an account
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/90">
            Join BEST SALES GHANA and start buying, selling and connecting.
          </p>

        </div>
      </section>

      {/* FORM */}
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">

          {/* STATUS */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
              {message}
            </div>
          )}

          {/* BASIC INFORMATION */}
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Account Information
            </h2>

            <p className="mt-2 text-slate-500">
              Enter your information accurately.
            </p>
          </div>

          {/* FULL NAME */}
          <div className="mt-8">
            <label className="text-sm font-black text-slate-700">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* EMAIL */}
          <div className="mt-6">
            <label className="text-sm font-black text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* PHONE */}
          <div className="mt-6">
            <label className="text-sm font-black text-slate-700">
              Phone Number
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 024 000 0000"
              autoComplete="tel"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* ACCOUNT TYPE */}
          <div className="mt-6">
            <label className="text-sm font-black text-slate-700">
              Account Type
            </label>

            <select
              value={accountType}
              onChange={(e) =>
                setAccountType(e.target.value as AccountType)
              }
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select account type</option>
              <option value="buyer">Buyer — Registered Buyer</option>
              <option value="seller">Seller — Individual</option>
              <option value="business">Business / Company</option>
            </select>
          </div>

          {/* DELIVERY OPTION */}
          <
