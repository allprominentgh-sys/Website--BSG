
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const SUPPORTED_CURRENCIES = [
  { code: "GHS", label: "Ghana Cedi", symbol: "GH₵" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "CNY", label: "Chinese Yuan", symbol: "¥" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
] as const;

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "zh", label: "Chinese (Simplified)" },
  { code: "es", label: "Spanish" },
  { code: "pt", label: "Portuguese" },
  { code: "ar", label: "Arabic" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
] as const;

export type CurrencyCode =
  (typeof SUPPORTED_CURRENCIES)[number]["code"];

export type LanguageCode =
  (typeof SUPPORTED_LANGUAGES)[number]["code"];

type CurrencyRates = Partial<Record<CurrencyCode, number>>;

type PreferencesContextValue = {
  currency: CurrencyCode;
  language: LanguageCode;
  rates: CurrencyRates;
  ratesLoading: boolean;
  ratesError: string;
  setCurrency: (value: CurrencyCode) => void;
  setLanguage: (value: LanguageCode) => void;
  formatPrice: (amountInGhs: number) => string;
};

const PreferencesContext =
  createContext<PreferencesContextValue | null>(null);

const CURRENCY_KEY = "bsg_display_currency";
const LANGUAGE_KEY = "bsg_display_language";

function isCurrency(value: string): value is CurrencyCode {
  return SUPPORTED_CURRENCIES.some((item) => item.code === value);
}

function isLanguage(value: string): value is LanguageCode {
  return SUPPORTED_LANGUAGES.some((item) => item.code === value);
}

export function MarketPreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("GHS");
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [rates, setRates] = useState<CurrencyRates>({ GHS: 1 });
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState("");

  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem(CURRENCY_KEY);
      const savedLanguage = localStorage.getItem(LANGUAGE_KEY);

      if (savedCurrency && isCurrency(savedCurrency)) {
        setCurrencyState(savedCurrency);
      }

      if (savedLanguage && isLanguage(savedLanguage)) {
        setLanguageState(savedLanguage);
      }
    } catch {
      // Preferences can still work for this visit if storage is unavailable.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRates() {
      try {
        const response = await fetch("/api/currencies", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load exchange rates.");
        }

        const nextRates: CurrencyRates = { GHS: 1 };

        for (const item of SUPPORTED_CURRENCIES) {
          const value = Number(data.rates?.[item.code]);

          if (
            item.code !== "GHS" &&
            Number.isFinite(value) &&
            value > 0
          ) {
            nextRates[item.code] = value;
          }
        }

        if (!cancelled) {
          setRates(nextRates);
          setRatesError("");
        }
      } catch (error) {
        if (!cancelled) {
          setRatesError(
            error instanceof Error
              ? error.message
              : "Could not load exchange rates."
          );
        }
      } finally {
        if (!cancelled) setRatesLoading(false);
      }
    }

    loadRates();

    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((value: CurrencyCode) => {
    setCurrencyState(value);

    try {
      localStorage.setItem(CURRENCY_KEY, value);
    } catch {
      // The selection still works for the current visit.
    }
  }, []);

  const setLanguage = useCallback((value: LanguageCode) => {
    setLanguageState(value);

    try {
      localStorage.setItem(LANGUAGE_KEY, value);
    } catch {
      // The selection still works for the current visit.
    }

    if (typeof document !== "undefined") {
      document.documentElement.lang = value;
      document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
    }
  }, []);

  const formatPrice = useCallback(
    (amountInGhs: number) => {
      const rate = rates[currency];

      if (
        !Number.isFinite(amountInGhs) ||
        typeof rate !== "number" ||
        !Number.isFinite(rate) ||
        rate <= 0
      ) {
        return currency === "GHS"
          ? `GH₵ ${Number(amountInGhs || 0).toFixed(2)}`
          : `${currency} — rate unavailable`;
      }

      // IMPORTANT: assumes the rate means foreign currency per GH₵1.
      const converted = amountInGhs * rate;

      try {
        return new Intl.NumberFormat(
          language === "zh" ? "zh-CN" : language,
          {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
          }
        ).format(converted);
      } catch {
        return `${currency} ${converted.toFixed(2)}`;
      }
    },
    [currency, language, rates]
  );

  const value = useMemo(
    () => ({
      currency,
      language,
      rates,
      ratesLoading,
      ratesError,
      setCurrency,
      setLanguage,
      formatPrice,
    }),
    [
      currency,
      language,
      rates,
      ratesLoading,
      ratesError,
      setCurrency,
      setLanguage,
      formatPrice,
    ]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function useMarketPreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error(
      "useMarketPreferences must be used inside MarketPreferencesProvider."
    );
  }

  return context;
}
