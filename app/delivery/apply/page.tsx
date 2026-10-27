
"use client";

import { FormEvent, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type ApplicationStatus = "idle" | "success" | "error";

export default function DeliveryRiderApplicationPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ApplicationStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setMessage("");

    const name = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    if (name.length < 2) {
      setStatus("error");
      setMessage("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    if (normalizedPhone.length < 7 || normalizedPhone.length > 25) {
      setStatus("error");
      setMessage("Please enter a valid phone number.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
          "Registration is temporarily unavailable. Please contact support."
        );
      }

      const supabase = createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
      );

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: name,
            phone: normalizedPhone,
            requested_account_type: "rider",
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error(
          "We could not create your account. Please try again."
        );
      }

      // Create the pending profile only when Supabase has
      // established an authenticated session. The database
      // trigger must enforce pending approval for rider profiles.
      if (data.session) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: data.user.id,
              full_name: name,
              phone: normalizedPhone,
              account_type: "rider",
              verified: false,
              verification_status: "pending",
            },
            { onConflict: "id" }
          );

        if (profileError) {
          console.error(
            "Rider profile creation failed:",
            profileError.message
          );

          throw new Error(
            "Your login account was created, but your application profile could not be saved. Please contact support before registering again."
          );
        }
      }

      setStatus("success");
      setMessage(
        data.session
          ? "Your account and rider application have been created. Your application is pending administrator approval. Do not begin deliveries until approved."
          : "Your account has been created. Check your email to confirm your address. After confirmation, sign in to complete your rider application. You cannot accept deliveries until your application is approved."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <header className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
            BEST SALES GHANA
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
            Become a delivery rider
          </h1>

          <p className="mt-3 text-slate-600">
            Apply to join our delivery team. Your application
            must be reviewed and approved before you can receive
            delivery assignments.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {status === "success" ? (
            <div
              className="rounded-xl border border-green-200 bg-green-50 p-5"
              role="status"
            >
              <h2 className="text-lg font-bold text-green-900">
                Application update
              </h2>

              <p className="mt-2 text-sm leading-6 text-green-900">
                {message}
              </p>

              <p className="mt-3 text-sm text-green-800">
                Keep your email accessible so you can receive
                account and application updates.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>

                <input
                  id="fullName"
                  autoComplete="name"
                  required
                  maxLength={120}
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  Phone number
                </label>

                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  maxLength={25}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. 024 XXX XXXX"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  Create password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your password again"
                />
              </div>

              {status === "error" && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-700 px-5 py-3.5 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Submitting application…"
                  : "Apply to become a rider"}
              </button>

              <p className="text-center text-xs leading-5 text-slate-500">
                Registration does not guarantee approval.
                Never share your password with an administrator
                or another person.
              </p>
            </form>
          )}
        </section>

        <p className="mt-6 text-center text-sm text-slate-500">
          BEST SALES GHANA · All Prominent Ghana Limited
        </p>
      </div>
    </main>
  );
}
