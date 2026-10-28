
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type CurrencyCode = "CNY" | "USD" | "EUR" | "GBP";

type Currency = {
  code: string;
  name: string | null;
  symbol: string | null;
  manual_rate_from_ghs: number;
  rate_source: string | null;
};

const CURRENCIES: {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
}[] = [
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
];

export default function CurrencySettingsPage() {
  const [currencies, setCurrencies] = useState<Record<string, Currency>>({});
  const [rates, setRates] = useState<Record<CurrencyCode, string>>({
    CNY: "",
    USD: "",
    EUR: "",
    GBP: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<CurrencyCode | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadCurrencies = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/currencies", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Could not load currency settings. Please sign in again."
        );
      }

      const rows = (data.currencies ?? []) as Currency[];
      const currencyMap: Record<string, Currency> = {};

      for (const currency of rows) {
        currencyMap[currency.code] = currency;
      }

      setCurrencies(currencyMap);

      setRates({
        CNY: currencyMap.CNY
          ? String(currencyMap.CNY.manual_rate_from_ghs)
          : "",
        USD: currencyMap.USD
          ? String(currencyMap.USD.manual_rate_from_ghs)
          : "",
        EUR: currencyMap.EUR
          ? String(currencyMap.EUR.manual_rate_from_ghs)
          : "",
        GBP: currencyMap.GBP
          ? String(currencyMap.GBP.manual_rate_from_ghs)
          : "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load currency settings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCurrencies();
  }, [loadCurrencies]);

  async function saveRate(code: CurrencyCode) {
    setSaving(code);
    setMessage("");
    setError("");

    const rawRate = rates[code].trim();
    const rate = Number(rawRate);

    if (!rawRate || !Number.isFinite(rate) || rate <= 0) {
      setError("Enter a valid exchange rate greater than zero.");
      setSaving(null);
      return;
    }

    try {
      const response = await fetch("/api/admin/currencies", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-rate",
          currencyCode: code,
          rate,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Could not save this exchange rate.");
      }

      setMessage(
        data.message || `${code} exchange rate saved successfully.`
      );

      if (data.historyWarning) {
        setMessage((previous) => `${previous} ${data.historyWarning}`);
      }

      await loadCurrencies();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save the exchange rate."
      );
    } finally {
      setSaving(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-5 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/settings"
          className="inline-flex min-h-10 items-center rounded-lg border border-blue-700 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-700 hover:text-white"
        >
          ← Back to Settings
        </Link>

        <header className="mt-4 rounded-2xl bg-gradient-to-r from-blue-800 to-cyan-600 p-5 text-white sm:rounded-3xl sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-100">
            Best Sales Ghana · Administrator
          </p>

          <h1 className="mt-2 text-2xl font-black sm:text-4xl">
            Currency Settings
          </h1>

          <p className="mt-2 text-sm leading-6 text-white/90 sm:mt-3 sm:text-base sm:leading-7">
            Set the manual exchange rates used to display marketplace listing
            prices in different currencies.
          </p>
        </header>

        <section className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:mt-5 sm:rounded-2xl sm:p-5">
          <h2 className="font-black text-blue-950">
            How to enter an exchange rate
          </h2>

          <p className="mt-2 text-sm leading-6 text-blue-900">
            Enter how many units of foreign currency equal GH₵1. For example,
            if GH₵1 equals ¥0.543, enter <strong>0.543</strong> for CNY.
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-900">
            Rates are entered manually. Saving a rate changes the conversion
            used for displayed prices, not the original prices stored on
            listings.
          </p>
        </section>

        {loading && (
          <div className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-600 shadow-sm">
            Loading saved exchange rates...
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void loadCurrencies()}
              className="mt-2 font-bold underline"
            >
              Try again
            </button>
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {message}
          </div>
        )}

        {!loading && (
          <section className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4">
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Base currency
              </p>

              <div className="mt-3 flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">
                  🇬🇭
                </span>
                <div>
                  <h2 className="text-lg font-black">Ghana Cedi</h2>
                  <p className="text-sm text-slate-600">GHS · GH₵</p>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
                GH₵1 = GH₵1
              </div>
            </article>

            {CURRENCIES.map((currency) => {
              const current = currencies[currency.code];
              const value = rates[currency.code];
              const numericRate = Number(value);

              const validRate =
                value.trim() !== "" &&
                Number.isFinite(numericRate) &&
                numericRate > 0;

              return (
                <article
                  key={currency.code}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl" aria-hidden="true">
                      {currency.flag}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-black">
                        {currency.name}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {currency.code} · {currency.symbol}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                      {current?.rate_source || "Not set"}
                    </span>
                  </div>

                  <label
                    htmlFor={`rate-${currency.code}`}
                    className="mt-4 block text-sm font-bold text-slate-800"
                  >
                    Foreign currency per GH₵1
                  </label>

                  <input
                    id={`rate-${currency.code}`}
                    type="number"
                    inputMode="decimal"
                    min="0.00000001"
                    step="any"
                    value={value}
                    onChange={(event) =>
                      setRates((previous) => ({
                        ...previous,
                        [currency.code]: event.target.value,
                      }))
                    }
                    placeholder="Enter manual rate"
                    className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 px-3 py-3 text-base font-bold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />

                  <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
                    <p className="text-slate-500">Conversion example</p>
                    <p className="mt-1 font-bold text-slate-900">
                      GH₵100 ={" "}
                      {validRate
                        ? `${currency.symbol}${(100 * numericRate).toLocaleString(
                            "en-GH",
                            { maximumFractionDigits: 4 }
                          )}`
                        : "Enter a valid rate"}
                    </p>
                  </div>

                  <p className="mt-3 break-words text-xs text-slate-500">
                    Saved rate:{" "}
                    {current
                      ? `${current.manual_rate_from_ghs} ${currency.code} per GH₵1`
                      : "No rate returned from the database"}
                  </p>

                  <button
                    type="button"
                    onClick={() => void saveRate(currency.code)}
                    disabled={saving !== null || !validRate}
                    className="mt-4 min-h-11 w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving === currency.code
                      ? "Saving..."
                      : saving !== null
                        ? "Please wait..."
                        : `Save ${currency.code} Rate`}
                  </button>
                </article>
              );
            })}
          </section>
        )}

        <section className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:rounded-2xl sm:p-5">
          <h2 className="font-black text-amber-950">Important</h2>

          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-900">
            <li>Use manually verified exchange rates.</li>
            <li>Rates must be greater than zero.</li>
            <li>Check the public currency selector after saving.</li>
            <li>This page does not edit listing prices or order records.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
