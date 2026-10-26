"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AdvertisingSettings = {
  individual_premium_price: number;
  individual_priority_price: number;
  individual_top_priority_price: number;
  company_top_priority_monthly_price: number;
  business_transaction_fee_percent: number;
  individual_free_ads_limit: number;
  company_free_ads_limit: number;
  company_priority_ads_limit: number;
  promotion_duration_days: number;
};

const initialSettings: AdvertisingSettings = {
  individual_premium_price: 160,
  individual_priority_price: 420,
  individual_top_priority_price: 790,
  company_top_priority_monthly_price: 630,
  business_transaction_fee_percent: 2.15,
  individual_free_ads_limit: 9,
  company_free_ads_limit: 12,
  company_priority_ads_limit: 12,
  promotion_duration_days: 30,
};

const integerKeys: (keyof AdvertisingSettings)[] = [
  "individual_free_ads_limit",
  "company_free_ads_limit",
  "company_priority_ads_limit",
  "promotion_duration_days",
];

const settingLabels: {
  key: keyof AdvertisingSettings;
  label: string;
  description: string;
  min: number;
  max: number;
  step: string;
  unit: "currency" | "percent" | "ads" | "days";
}[] = [
  {
    key: "individual_premium_price",
    label: "Individual Premium advertisement",
    description: "Price per individual advertisement.",
    min: 1,
    max: 1000000,
    step: "0.01",
    unit: "currency",
  },
  {
    key: "individual_priority_price",
    label: "Individual Priority advertisement",
    description: "Price per individual advertisement.",
    min: 1,
    max: 1000000,
    step: "0.01",
    unit: "currency",
  },
  {
    key: "individual_top_priority_price",
    label: "Individual Top Priority advertisement",
    description: "Price per individual advertisement.",
    min: 1,
    max: 1000000,
    step: "0.01",
    unit: "currency",
  },
  {
    key: "company_top_priority_monthly_price",
    label: "Company Top Priority monthly package",
    description: "Monthly price for the company advertising package.",
    min: 1,
    max: 10000000,
    step: "0.01",
    unit: "currency",
  },
  {
    key: "business_transaction_fee_percent",
    label: "Business transaction fee",
    description:
      "Percentage charged on eligible business transactions processed through BestSalesGH.",
    min: 0,
    max: 100,
    step: "0.01",
    unit: "percent",
  },
  {
    key: "individual_free_ads_limit",
    label: "Individual free advertisements",
    description: "Number of free advertisements per individual seller.",
    min: 0,
    max: 1000000,
    step: "1",
    unit: "ads",
  },
  {
    key: "company_free_ads_limit",
    label: "Company free advertisements",
    description: "Number of free advertisements for company sellers.",
    min: 0,
    max: 1000000,
    step: "1",
    unit: "ads",
  },
  {
    key: "company_priority_ads_limit",
    label: "Company Priority advertisement limit",
    description: "Company advertisements covered by the Priority arrangement.",
    min: 0,
    max: 1000000,
    step: "1",
    unit: "ads",
  },
  {
    key: "promotion_duration_days",
    label: "Promotion duration",
    description: "Duration of an individual paid promotion in days.",
    min: 1,
    max: 3650,
    step: "1",
    unit: "days",
  },
];

export default function AdvertisingSettingsPage() {
  const [settings, setSettings] =
    useState<AdvertisingSettings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setLoadError(false);
      setMessage("");

      try {
        const response = await fetch("/api/admin/advertising", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load advertising settings."
          );
        }

        if (
          !result.settings ||
          typeof result.settings !== "object" ||
          Array.isArray(result.settings)
        ) {
          throw new Error("The server returned invalid settings.");
        }

        const merged = {
          ...initialSettings,
          ...result.settings,
        };

        for (const item of settingLabels) {
          const value = merged[item.key];

          if (
            typeof value !== "number" ||
            !Number.isFinite(value)
          ) {
            throw new Error(
              `The server returned an invalid value for ${item.label}.`
            );
          }
        }

        if (!cancelled) {
          setSettings(merged);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(true);
          setError(true);
          setMessage(
            err instanceof Error
              ? err.message
              : "Unable to load advertising settings."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateSetting(
    key: keyof AdvertisingSettings,
    rawValue: string
  ) {
    const value = rawValue === "" ? 0 : Number(rawValue);

    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveSettings() {
    setMessage("");
    setError(false);

    if (loadError) {
      setError(true);
      setMessage(
        "Settings were not loaded successfully. Reload the page before saving."
      );
      return;
    }

    for (const item of settingLabels) {
      const value = settings[item.key];

      if (
        !Number.isFinite(value) ||
        value < item.min ||
        value > item.max
      ) {
        setError(true);
        setMessage(
          `${item.label} must be between ${item.min} and ${item.max}.`
        );
        return;
      }

      if (integerKeys.includes(item.key) && !Number.isInteger(value)) {
        setError(true);
        setMessage(`${item.label} must be a whole number.`);
        return;
      }

      if (
        Number(value.toFixed(item.unit === "currency" || item.unit === "percent" ? 2 : 0)) !==
        value
      ) {
        setError(true);
        setMessage(`${item.label} has too many decimal places.`);
        return;
      }
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/advertising", {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to save advertising settings."
        );
      }

      if (
        !result.settings ||
        typeof result.settings !== "object" ||
        Array.isArray(result.settings)
      ) {
        throw new Error(
          "The server saved the request but returned invalid settings. Reload to verify."
        );
      }

      setSettings((current) => ({
        ...current,
        ...result.settings,
      }));

      setMessage("Advertising settings saved successfully.");
      setError(false);
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error
          ? err.message
          : "Unable to save advertising settings."
      );
    } finally {
      setSaving(false);
    }
  }

  const fee = settings.business_transaction_fee_percent;
  const exampleAmount = 1000;
  const feeAmount = (exampleAmount * fee) / 100;
  const sellerAmount = exampleAmount - feeAmount;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
              BestSalesGH Administration
            </p>
            <h1 className="mt-1 text-2xl font-black sm:text-3xl">
              Advertising Settings
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage promotion prices, advertising limits, and transaction fees.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold hover:bg-slate-50"
          >
            ← Admin Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="font-black text-blue-950">
            Advertising and transaction fees are separate
          </h2>
          <p className="mt-2 text-sm leading-6 text-blue-900">
            Purchasing Top Priority advertising does not automatically
            exempt an eligible company from its transaction fee.
            Individual sellers are excluded from this platform fee under
            the current business rules.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Pricing and limits</h2>
              <p className="mt-1 text-sm text-slate-500">
                Prices are in Ghana cedis (GH₵).
              </p>
            </div>

            {loading && (
              <span className="text-sm font-bold text-slate-500">
                Loading saved settings…
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {settingLabels.map((item) => (
              <div
                key={item.key}
                className="rounded-xl border border-slate-200 p-4"
              >
                <label
                  htmlFor={item.key}
                  className="block font-bold text-slate-900"
                >
                  {item.label}
                </label>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {item.description}
                </p>

                <div className="mt-3 flex items-center rounded-xl border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
                  {item.unit === "currency" && (
                    <span className="pl-4 font-black text-slate-500">
                      GH₵
                    </span>
                  )}

                  <input
                    id={item.key}
                    type="number"
                    min={item.min}
                    max={item.max}
                    step={item.step}
                    value={settings[item.key]}
                    disabled={loading || loadError || saving}
                    onChange={(event) =>
                      updateSetting(item.key, event.target.value)
                    }
                    className="w-full rounded-xl border-0 bg-transparent px-4 py-3 font-black outline-none disabled:opacity-60"
                  />

                  {item.unit === "percent" && (
                    <span className="pr-4 font-black text-slate-500">
                      %
                    </span>
                  )}

                  {(item.unit === "ads" || item.unit === "days") && (
                    <span className="whitespace-nowrap pr-4 text-sm font-bold text-slate-500">
                      {item.unit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {message && (
            <div
              role="status"
              className={`mt-5 rounded-xl border p-4 text-sm font-bold ${
                error
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-green-200 bg-green-50 text-green-800"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveSettings}
              disabled={loading || loadError || saving}
              className="rounded-xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Advertising Settings"}
            </button>

            <Link
              href="/admin"
              className="rounded-xl border border-slate-300 px-6 py-3 font-bold hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-black">Transaction fee example</h2>
          <p className="mt-2 text-sm text-slate-500">
            Illustration for an eligible GH₵1,000 business transaction.
            Actual settlement can depend on payment processor fees,
            refunds, and other adjustments.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">
                Transaction amount
              </p>
              <p className="mt-2 text-2xl font-black">
                GH₵{exampleAmount.toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-800">
                Platform fee ({fee}%)
              </p>
              <p className="mt-2 text-2xl font-black text-amber-900">
                GH₵{feeAmount.toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm font-bold text-green-800">
                Balance before other adjustments
              </p>
              <p className="mt-2 text-2xl font-black text-green-900">
                GH₵{sellerAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-black">Current advertising rules</h2>

          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>
              <strong>Individual sellers:</strong> The first{" "}
              {settings.individual_free_ads_limit} advertisements are free.
              Additional advertisements may require paid promotion.
            </p>

            <p>
              <strong>Company accounts:</strong> The first{" "}
              {settings.company_free_ads_limit} advertisements are free.
              Applicable company requirements still apply.
            </p>

            <p>
              <strong>Company Priority range:</strong> The configured
              Priority limit is {settings.company_priority_ads_limit} ads.
            </p>

            <p>
              <strong>Company Top Priority:</strong> GH₵
              {settings.company_top_priority_monthly_price.toFixed(2)} per
              month under the configured package price.
            </p>

            <p>
              <strong>Promotion duration:</strong>{" "}
              {settings.promotion_duration_days} days.
            </p>
          </div>
        </section>

        <footer className="pb-6 text-center text-xs text-slate-500">
          BestSalesGH · All Prominent Ghana Limited
        </footer>
      </div>
    </main>
  );
}
