"use client";

import { useMarketPreferences } from "./MarketPreferencesProvider";

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
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm">
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:min-w-40">
        <label
          htmlFor="bsg-language"
          className="text-xs font-bold uppercase tracking-wide text-slate-500"
        >
          Language
        </label>

        <select
          id="bsg-language"
          value={language}
          onChange={(event) =>
            setLanguage(
              event.target.value as typeof language
            )
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="zh">Chinese (Simplified)</option>
          <option value="es">Español</option>
          <option value="pt">Português</option>
          <option value="ar">العربية</option>
          <option value="de">Deutsch</option>
          <option value="it">Italiano</option>
          <option value="ja">日本語</option>
          <option value="ko">한국어</option>
        </select>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:min-w-40">
        <label
          htmlFor="bsg-currency"
          className="text-xs font-bold uppercase tracking-wide text-slate-500"
        >
          Currency
        </label>

        <select
          id="bsg-currency"
          value={currency}
          onChange={(event) =>
            setCurrency(
              event.target.value as typeof currency
            )
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        >
          <option value="GHS">GHS — Ghana Cedi</option>
          <option value="USD">USD — US Dollar</option>
          <option value="CNY">CNY — Chinese Yuan</option>
          <option value="EUR">EUR — Euro</option>
          <option value="GBP">GBP — British Pound</option>
        </select>
      </div>

      {ratesLoading && (
        <p className="w-full text-xs text-slate-500">
          Loading exchange rates…
        </p>
      )}

      {!ratesLoading && ratesError && (
        <p
          role="status"
          className="w-full text-xs text-amber-700"
        >
          {ratesError}
        </p>
      )}
    </div>
  );
}
