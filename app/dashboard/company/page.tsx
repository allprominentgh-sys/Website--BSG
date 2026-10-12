
"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/supabase-browser";

type CompanyProfile = {
  company_name: string;
  registration_number: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_description: string;
  logo_path: string;
  certificate_path: string;
  verification_status: string;
};

const emptyCompany: CompanyProfile = {
  company_name: "",
  registration_number: "",
  company_address: "",
  company_phone: "",
  company_email: "",
  company_description: "",
  logo_path: "",
  certificate_path: "",
  verification_status: "pending",
};

export default function CompanyProfilePage() {
  const router = useRouter();
  const [company, setCompany] =
    useState<CompanyProfile>(emptyCompany);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCompany() {
      const supabase = supabaseBrowser();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (authError || !user) {
        router.replace("/login?redirect=/dashboard/company");
        return;
      }

      const { data, error: queryError } = await supabase
        .from("company_profiles")
        .select(
          "company_name, registration_number, company_address, company_phone, company_email, company_description, logo_path, certificate_path, verification_status"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (queryError) {
        console.error("COMPANY PROFILE ERROR:", queryError);
        setError(
          "Could not load your company profile. Please check the Supabase table and permissions."
        );
      } else if (data) {
        setCompany({
          company_name: data.company_name ?? "",
          registration_number: data.registration_number ?? "",
          company_address: data.company_address ?? "",
          company_phone: data.company_phone ?? "",
          company_email: data.company_email ?? "",
          company_description: data.company_description ?? "",
          logo_path: data.logo_path ?? "",
          certificate_path: data.certificate_path ?? "",
          verification_status: data.verification_status ?? "pending",
        });
      }

      setLoading(false);
    }

    loadCompany();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function updateField(
    field: keyof CompanyProfile,
    value: string
  ) {
    setCompany((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const supabase = supabaseBrowser();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Your session has expired. Please log in again.");
      setSaving(false);
      router.replace("/login?redirect=/dashboard/company");
      return;
    }

    const { error: saveError } = await supabase
      .from("company_profiles")
      .upsert(
        {
          user_id: user.id,
          company_name: company.company_name.trim(),
          registration_number:
            company.registration_number.trim() || null,
          company_address: company.company_address.trim() || null,
          company_phone: company.company_phone.trim() || null,
          company_email: company.company_email.trim() || null,
          company_description:
            company.company_description.trim() || null,
          logo_path: company.logo_path.trim() || null,
          certificate_path: company.certificate_path.trim() || null,
        },
        { onConflict: "user_id" }
      );

    if (saveError) {
      console.error("COMPANY SAVE ERROR:", saveError);
      setError(
        "Could not save company details. Please try again and check the Supabase permissions."
      );
      setSaving(false);
      return;
    }

    setMessage("Company details saved successfully.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        Loading company profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="font-semibold text-blue-700 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <header className="mt-6 rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-widest text-blue-700">
            BEST SALES GHANA
          </p>
          <h1 className="mt-2 text-3xl font-black">
            Company Profile
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Add your business information and prepare your documents
            for verification.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-6 rounded-2xl border bg-white p-5 shadow-sm sm:p-8"
        >
          <div>
            <h2 className="text-xl font-bold">
              Business Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter accurate information for your company.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Company Name"
              value={company.company_name}
              onChange={(v) => updateField("company_name", v)}
              required
            />
            <Field
              label="Registration Number"
              value={company.registration_number}
              onChange={(v) => updateField("registration_number", v)}
            />
            <Field
              label="Company Phone"
              value={company.company_phone}
              onChange={(v) => updateField("company_phone", v)}
              type="tel"
            />
            <Field
              label="Company Email"
              value={company.company_email}
              onChange={(v) => updateField("company_email", v)}
              type="email"
            />
          </div>

          <Field
            label="Company Address"
            value={company.company_address}
            onChange={(v) => updateField("company_address", v)}
          />

          <div>
            <label
              htmlFor="company-description"
              className="mb-2 block text-sm font-semibold"
            >
              Business Description
            </label>
            <textarea
              id="company-description"
              rows={4}
              maxLength={2000}
              value={company.company_description}
              onChange={(event) =>
                updateField("company_description", event.target.value)
              }
              placeholder="Describe your business and the products or services you offer."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <strong>Document uploads are not enabled yet.</strong>{" "}
            We will configure secure Supabase Storage uploads next.
            Do not enter public links to confidential registration
            certificates here.
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60 sm:w-auto"
          >
            {saving ? "Saving..." : "Save Company Details"}
          </button>
        </form>

        <section className="mt-6 rounded-2xl border bg-white p-5">
          <h2 className="font-bold">Verification Status</h2>
          <p className="mt-2 text-sm text-slate-600">
            Current status:{" "}
            <strong>
              {company.verification_status.replaceAll("_", " ")}
            </strong>
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Verification is subject to administrator review. Saving
            company details does not mean the company is verified.
          </p>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        maxLength={250}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
      />
    </div>
  );
}
