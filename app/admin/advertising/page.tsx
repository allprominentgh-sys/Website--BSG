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
  individual_free_ads_limit: 3,
  company_free_ads_limit: 3,
  company_priority_ads_limit: 12,
  promotion_duration_days: 30,
};
const settingLabels: {
  key: keyof AdvertisingSettings;
  label: string;
  description: string;
  step?: string;
  max?: number;
}[] = [
  {
    key: "individual_premium_price",
    label: "Individual Premium advertisement",
    description: "Price per individual advertisement.",
  },
  {
    key: "individual_priority_price",
    label: "Individual Priority advertisement",
    description: "Price per individual advertisement.",
  },
  {
    key: "individual_top_priority_price",
    label: "Individual Top Priority advertisement",
    description: "Price per individual advertisement.",
  },
  {
    key: "company_top_priority_monthly_price",
    label: "Company Top Priority monthly package",
    description: "Monthly price for the company advertising package.",
  },
  {
    key: "business_transaction_fee_percent",
    label: "Business transaction fee",
    description:
      "Percentage deducted from eligible business transactions processed through BestSalesGH.",
    step: "0.01",
    max: 100,
  },
  {
    key: "individual_free_ads_limit",
    label: "Individual free advertisements",
    description: "Number of free advertisements per individual seller.",
    step: "1",
  },
  {
    key: "company_free_ads_limit",
    label: "Company free advertisements",
    description: "Number of free advertisements before company requirements apply.",
    step: "1",
  },
  {
    key: "company_priority_ads_limit",
    label: "Company Priority advertisement limit",
    description: "Company advertisements covered by the Priority arrangement.",
    step: "1",
  },
  {
    key: "promotion_duration_days",
    label: "Promotion duration",
    description: "Duration of an individual paid promotion in days.",
    step: "1",
  },
];
export default function AdvertisingSettingsPage() {
  const [settings, setSettings] =
    useState<AdvertisingSettings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function loadSettings() {
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
        if (!cancelled && result.settings) {
          setSettings({
            ...initialSettings,
            ...result.settings,
          });
        }
      } catch (err) {
        if (!cancelled) {
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
    value: string
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value === "" ? 0 : Number(value),
    }));
  }
  async function saveSettings() {
    setMessage("");
    setError(false);
    for (const item of settingLabels) {
      const value = settings[item.key];
      if (!Number.isFinite(value) || value < 0) {
        setError(true);
        setMessage(`${item.label} must be zero or greater.`);
        return;
      }
      if (
        item.key === "business_transaction_fee_percent" &&
        value > 100
      ) {
        setError(true);
        setMessage("The transaction fee cannot exceed 100%.");
        return;
      }
      if (
        [
          "individual_free_ads_limit",
          "company_free_ads_limit",
          "company_priority_ads_limit",
          "promotion_duration_days",
        ].includes(item.key) &&
        !Number.isInteger(value)
      ) {
        setError(true);
        setMessage(`${item.label} must be a whole number.`);
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
      if (result.settings) {
        setSettings({
          ...initialSettings,
          ...result.settings,
        });
      }
      setMessage("Advertising settings saved successfully.");
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
  const feeExample = settings.business_transaction_fee_percent;
  const exampleAmount = 1000;
  const feeAmount = (exampleAmount * feeExample) / 100;
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
              Control promotion prices, free advertisement limits, and
              business transaction fees.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold transition hover:bg-slate-50"
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
            Buying Top Priority advertising does not cancel a company’s
            eligible transaction fee. Individual sellers collect payments
            independently and are excluded from the BestSalesGH platform
            transaction fee under the current business rules.
          </p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">
                Pricing and limits
              </h2>
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
                  {item.key !== "business_transaction_fee_percent" &&
                    ![
                      "individual_free_ads_limit",
                      "company_free_ads_limit",
                      "company_priority_ads_limit",
                      "promotion_duration_days",
                    ].includes(item.key) && (
                      <span className="pl-4 font-black text-slate-500">
                        GH₵
                      </span>
                    )}
                  <input
                    id={item.key}
                    type="number"
                    min="0"
                    max={item.max}
                    step={item.step || "0.01"}
                    value={settings[item.key]}
                    disabled={loading || saving}
                    onChange={(event) =>
                      updateSetting(item.key, event.target.value)
                    }
                    className="w-full rounded-xl border-0 bg-transparent px-4 py-3 font-black outline-none disabled:opacity-60"
                  />
                  {item.key === "business_transaction_fee_percent" && (
                    <span className="pr-4 font-black text-slate-500">
                      %
                    </span>
                  )}
                  {[
                    "individual_free_ads_limit",
                    "company_free_ads_limit",
                    "company_priority_ads_limit",
                    "promotion_duration_days",
                  ].includes(item.key) && (
                    <span className="whitespace-nowrap pr-4 text-sm font-bold text-slate-500">
                      {item.key === "promotion_duration_days"
                        ? "days"
                        : "ads"}
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
              disabled={loading || saving}
              className="rounded-xl bg-blue-700 px-6 py-3 font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
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
          <h2 className="text-xl font-black">
            Transaction fee example
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Illustration for an eligible GH₵1,000 business transaction
            processed through BestSalesGH. Actual settlement may also
            depend on processor fees, refunds, and other adjustments.
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
                Platform fee ({feeExample}%)
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
          <h2 className="text-xl font-black">
            Current advertising rules
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>
              <strong>Individual sellers:</strong> The first{" "}
              {settings.individual_free_ads_limit} advertisements are free.
              Additional advertisements require a paid promotion.
            </p>
            <p>
              <strong>Company accounts:</strong> The first{" "}
              {settings.company_free_ads_limit} advertisements are free.
              Company details must be completed before the applicable
              paid advertising requirements continue.
            </p>
            <p>
              <strong>Company Priority range:</strong> Advertisements 4
              through {settings.company_priority_ads_limit} follow the
              Priority arrangement, based on the configured limit.
            </p>
            <p>
              <strong>Company Top Priority:</strong> The configured monthly
              package price is GH₵
              {settings.company_top_priority_monthly_price.toFixed(2)}.
              Top Priority advertising does not itself include delivery,
              tracking, or a transaction-fee exemption.
            </p>
            <p>
              <strong>Promotion duration:</strong> Individual paid
              promotions are configured for{" "}
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
