
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/supabase-browser";

export default function CMSLoginPage() {
  const router = useRouter();

  const [companyId, setCompanyId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const supabase = supabaseBrowser();

    try {
      const normalizedCompanyId = companyId.trim().toUpperCase();
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedCompanyId || !normalizedEmail || !password) {
        setError("Enter your company ID, email and password.");
        return;
      }

      // Authenticate the staff member with Supabase Auth.
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (loginError) {
        setError("Invalid email or password.");
        return;
      }

      if (!data.user) {
        setError("Unable to verify your staff account.");
        return;
      }

      // Confirm that the administrator has registered this
      // authenticated user as an active CMS staff member.
      const { data: staff, error: staffError } = await supabase
        .from("cms_staff")
        .select("user_id, company_id, role, is_active")
        .eq("user_id", data.user.id)
        .eq("company_id", normalizedCompanyId)
        .maybeSingle();

      if (staffError) {
        await supabase.auth.signOut();
        setError(
          "Unable to verify your staff access. Please contact the administrator."
        );
        return;
      }

      if (!staff || !staff.is_active) {
        await supabase.auth.signOut();
        setError(
          "Your company ID is invalid or your CMS account is inactive."
        );
        return;
      }

      const allowedRoles = [
        "admin",
        "support_manager",
        "support_agent",
      ];

      if (!allowedRoles.includes(staff.role)) {
        await supabase.auth.signOut();
        setError("Your account does not have CMS access.");
        return;
      }

      // Store authentication in Supabase, not in a custom
      // client-side role or company-ID flag.
      router.replace("/cms");
      router.refresh();
    } catch (err) {
      console.error("CMS login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 text-2xl font-black text-white">
            B
          </div>

          <h1 className="mt-5 text-3xl font-black">
            BestSalesGH CMS
          </h1>

          <p className="mt-2 text-slate-600">
            Authorized staff and customer service login
          </p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black">
            Staff Sign In
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Use the company ID issued by your administrator
            and the email and password registered to your
            staff account.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="mt-6 space-y-5"
          >
            <div>
              <label
                htmlFor="companyId"
                className="mb-2 block text-sm font-bold"
              >
                Company ID
              </label>

              <input
                id="companyId"
                type="text"
                autoComplete="organization"
                value={companyId}
                onChange={(event) =>
                  setCompanyId(event.target.value.toUpperCase())
                }
                placeholder="e.g. BSGH-CS-0001"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold"
              >
                Staff Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="staff@company.com"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold"
              >
                Password
              </label>

              <div className="flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-blue-600">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  required
                  className="min-w-0 flex-1 px-4 py-3 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 text-sm font-bold text-blue-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-700 px-5 py-4 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying account..." : "Sign In to CMS"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-sm text-slate-500">
              Need access? Contact your CMS administrator.
            </p>

            <Link
              href="/"
              className="mt-4 inline-block font-bold text-blue-700 hover:underline"
            >
              ← Return to BestSalesGH
            </Link>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          BestSalesGH · Authorized personnel only
        </p>
      </div>
    </main>
  );
}
