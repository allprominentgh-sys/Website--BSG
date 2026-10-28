
"use client";

import {
  SUPPORTED_CURRENCIES,
  SUPPORTED_LANGUAGES,
  useMarketPreferences,
} from "./MarketPreferencesProvider";

export default function MarketPreferenceControls() {
  const {
    currency,
    language,
    setCurrency,
    setLanguage,
    ratesLoading,
    ratesError,
  } = useMarketPreferences();

  return (
    <section
      aria-label="Language and currency preferences"
      className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2"
    >
      <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
        Display currency
        <select
          value={currency}
          onChange={(event) =>
            setCurrency(event.target.value as typeof currency)
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900"
        >
          {SUPPORTED_CURRENCIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.code} — {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
        Website language
        <select
          value={language}
          onChange={(event) =>
            setLanguage(event.target.value as typeof language)
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900"
        >
          {SUPPORTED_LANGUAGES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      {ratesLoading && (
        <p className="text-xs text-slate-500 sm:col-span-2">
          Loading currency rates…
        </p>
      )}

      {!ratesLoading && ratesError && (
        <p role="status" className="text-xs text-amber-700 sm:col-span-2">
          Currency rates are temporarily unavailable.
        </p>
      )}
    </section>
  );
}
