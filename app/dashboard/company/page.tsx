
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
  logo_url: string;
  certificate_url: string;
};

const emptyCompany: CompanyProfile = {
  company_name: "",
  registration_number: "",
  company_address: "",
  company_phone: "",
  company_email: "",
  company_description: "",
  logo_url: "",
  certificate_url: "",
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

      // The company table must be created before this query can work.
      const { data, error: queryError } = await supabase
        .from("companies")
        .select(
          "company_name, registration_number, company_address, company_phone, company_email, company_description, logo_url, certificate_url"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (queryError) {
        console.error("COMPANY PROFILE ERROR:", queryError);
        setError(
          "The company profile database is not configured yet. Complete Step 2B before saving company details."
        );
      } else if (data) {
        setCompany({
          company_name: data.company_name ?? "",
          registration_number: data.registration_number ?? "",
          company_address: data.company_address ?? "",
          company_phone: data.company_phone ?? "",
          company_email: data.company_email ?? "",
          company_description: data.company_description ?? "",
          logo_url: data.logo_url ?? "",
          certificate_url: data.certificate_url ?? "",
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
      return;
    }

    const { error: saveError } = await supabase
      .from("companies")
      .upsert(
        {
          user_id: user.id,
          company_name: company.company_name.trim(),
          registration_number: company.registration_number.trim(),
          company_address: company.company_address.trim(),
          company_phone: company.company_phone.trim(),
          company_email: company.company_email.trim(),
          company_description: company.company_description.trim(),
          logo_url: company.logo_url.trim() || null,
          certificate_url: company.certificate_url.trim() || null,
        },
        { onConflict: "user_id" }
      );

    if (saveError) {
      console.error("COMPANY SAVE ERROR:", saveError);
      setError(
        "Could not save company details. Check the database setup and permissions."
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
            Add your registered business information and prepare
            your documents for verification.
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
            <h2 className="text-xl font-bold">Business Information</h2>
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
            <label className="mb-2 block text-sm font-semibold">
              Business Description
            </label>
            <textarea
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
            <strong>Document upload:</strong> Certificate and logo
            uploads require a configured private Supabase Storage
            bucket. Do not paste public links to confidential
            registration documents into these fields. We will
            configure secure uploads in the next step.
          </div>

          <Field
            label="Logo URL (optional; temporary field)"
            value={company.logo_url}
            onChange={(v) => updateField("logo_url", v)}
          />

          <Field
            label="Certificate URL (optional; do not use for confidential files)"
            value={company.certificate_url}
            onChange={(v) => updateField("certificate_url", v)}
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60 sm:w-auto"
          >
            {saving ? "Saving..." : "Save Company Details"}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border bg-white p-5">
          <h2 className="font-bold">Verification Status</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your company has not been verified by this page. An
            administrator review and a database verification workflow
            must be implemented before a verified status can be shown.
          </p>
        </div>
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
