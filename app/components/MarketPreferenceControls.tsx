
"use client";

import { useMarketPreferences } from "./MarketPreferencesProvider";

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a2 2 0 0 0 2-2v-3" />
      <path d="M2 7h16a2 2 0 0 1 2 2v2h-5a2 2 0 0 0 0 4h5v-4" />
      <path d="M15 13h.01" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 7 5 5 5-5" />
    </svg>
  );
}

export default function MarketPreferenceControls() {
  const {
    currency,
    language,
    setCurrency,
    setLanguage,
    ratesLoading,
    ratesError,
  } = useMarketPreferences();

  const languages = [
    { value: "en", label: "English" },
    { value: "fr", label: "Français" },
    { value: "zh", label: "Chinese (Simplified)" },
    { value: "es", label: "Español" },
    { value: "pt", label: "Português" },
    { value: "ar", label: "العربية" },
    { value: "de", label: "Deutsch" },
    { value: "it", label: "Italiano" },
    { value: "ja", label: "日本語" },
    { value: "ko", label: "한국어" },
  ];

  const currencies = [
    { value: "GHS", label: "GHS ₵", full: "Ghana Cedi" },
    { value: "USD", label: "USD $", full: "US Dollar" },
    { value: "CNY", label: "CNY ¥", full: "Chinese Yuan" },
    { value: "EUR", label: "EUR €", full: "Euro" },
    { value: "GBP", label: "GBP £", full: "British Pound" },
  ];

  const selectedLanguage =
    languages.find((item) => item.value === language)?.label ??
    "English";

  const selectedCurrency =
    currencies.find((item) => item.value === currency);

  return (
    <section
      aria-label="Marketplace preferences"
      className="w-full bg-white px-3 py-2 sm:px-5 sm:py-3"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-2 sm:gap-3">

        {/* Language selector */}
        <div className="relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-colors hover:border-blue-300 hover:bg-blue-50/40">
          <div className="pointer-events-none flex min-h-[76px] flex-col justify-center gap-1.5 px-3 py-2.5 sm:px-4">
            <div className="flex items-center gap-1.5 text-slate-500">
              <GlobeIcon />
              <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">
                Language
              </span>
              <span className="ml-auto text-slate-400">
                <ChevronIcon />
              </span>
            </div>

            <span className="truncate text-sm font-bold text-slate-900 sm:text-base">
              {selectedLanguage}
            </span>
          </div>

          <select
            aria-label="Choose language"
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value as typeof language)
            }
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          >
            {languages.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Currency selector */}
        <div className="relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-colors hover:border-blue-300 hover:bg-blue-50/40">
          <div className="pointer-events-none flex min-h-[76px] flex-col justify-center gap-1.5 px-3 py-2.5 sm:px-4">
            <div className="flex items-center gap-1.5 text-slate-500">
              <WalletIcon />
              <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">
                Currency
              </span>
              <span className="ml-auto text-slate-400">
                <ChevronIcon />
              </span>
            </div>

            <span className="truncate text-sm font-bold text-slate-900 sm:text-base">
              {selectedCurrency?.label ?? "GHS ₵"}
            </span>
          </div>

          <select
            aria-label="Choose currency"
            value={currency}
            onChange={(event) =>
              setCurrency(event.target.value as typeof currency)
            }
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          >
            {currencies.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label} — {item.full}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Discreet exchange-rate feedback */}
      {(ratesLoading || ratesError) && (
        <div
          role="status"
          aria-live="polite"
          className="mx-auto mt-1.5 max-w-7xl px-1 text-[10px] sm:text-xs"
        >
          {ratesLoading && (
            <span className="text-slate-400">
              Updating exchange rates...
            </span>
          )}

          {!ratesLoading && ratesError && (
            <span className="text-amber-700">
              {ratesError}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
