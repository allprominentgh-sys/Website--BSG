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
  { code: "GHS", label: "GHS — Ghana Cedi" },
  { code: "USD", label: "USD — US Dollar" },
  { code: "CNY", label: "CNY — Chinese Yuan" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
] as const;

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "zh", label: "Chinese (Simplified)" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
] as const;

export type CurrencyCode =
  (typeof SUPPORTED_CURRENCIES)[number]["code"];

export type LanguageCode =
  (typeof SUPPORTED_LANGUAGES)[number]["code"];

export type CurrencyRates = Partial<Record<CurrencyCode, number>>;

type MarketPreferencesContextValue = {
  currency: CurrencyCode;
  language: LanguageCode;
  rates: CurrencyRates;
  ratesLoading: boolean;
  ratesError: string;
  setCurrency: (value: CurrencyCode) => void;
  setLanguage: (value: LanguageCode) => void;
  refreshRates: () => Promise<void>;
  hydrated: boolean;
};

const MarketPreferencesContext =
  createContext<MarketPreferencesContextValue | null>(null);

const CURRENCY_STORAGE_KEY = "bsg_display_currency";
const LANGUAGE_STORAGE_KEY = "bsg_display_language";

function isCurrencyCode(value: string): value is CurrencyCode {
  return SUPPORTED_CURRENCIES.some((item) => item.code === value);
}

function isLanguageCode(value: string): value is LanguageCode {
  return SUPPORTED_LANGUAGES.some((item) => item.code === value);
}

export function MarketPreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currency, setCurrencyState] =
    useState<CurrencyCode>("GHS");

  const [language, setLanguageState] =
    useState<LanguageCode>("en");

  const [rates, setRates] = useState<CurrencyRates>({
    GHS: 1,
  });

  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem(
        CURRENCY_STORAGE_KEY
      );

      const savedLanguage = localStorage.getItem(
        LANGUAGE_STORAGE_KEY
      );

      if (savedCurrency && isCurrencyCode(savedCurrency)) {
        setCurrencyState(savedCurrency);
      }

      if (savedLanguage && isLanguageCode(savedLanguage)) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.warn(
        "Could not load saved marketplace preferences:",
        error
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  const setCurrency = useCallback((value: CurrencyCode) => {
    setCurrencyState(value);

    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, value);
    } catch (error) {
      console.warn(
        "Could not save currency preference:",
        error
      );
    }
  }, []);

  const setLanguage = useCallback((value: LanguageCode) => {
    setLanguageState(value);

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
    } catch (error) {
      console.warn(
        "Could not save language preference:",
        error
      );
    }
  }, []);

  const refreshRates = useCallback(async () => {
    setRatesLoading(true);
    setRatesError("");

    try {
      const response = await fetch("/api/currencies", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not retrieve exchange rates.");
      }

      const result: {
        rates?: Record<string, unknown>;
      } = await response.json();

      const receivedRates: CurrencyRates = {
        GHS: 1,
      };

      for (const item of SUPPORTED_CURRENCIES) {
        if (item.code === "GHS") continue;

        const value = Number(result.rates?.[item.code]);

        if (Number.isFinite(value) && value > 0) {
          receivedRates[item.code] = value;
        }
      }

      setRates(receivedRates);

      const missingCurrencies = SUPPORTED_CURRENCIES
        .filter(
          (item) =>
            item.code !== "GHS" &&
            receivedRates[item.code] === undefined
        )
        .map((item) => item.code);

      if (missingCurrencies.length > 0) {
        setRatesError(
          `Exchange rates are unavailable for: ${missingCurrencies.join(", ")}.`
        );
      }
    } catch (error) {
      console.error("Currency rate loading error:", error);

      setRatesError(
        "Exchange rates could not be loaded. Prices may remain in their original currency."
      );
    } finally {
      setRatesLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshRates();
  }, [refreshRates]);

  const contextValue = useMemo(
    () => ({
      currency,
      language,
      rates,
      ratesLoading,
      ratesError,
      setCurrency,
      setLanguage,
      refreshRates,
      hydrated,
    }),
    [
      currency,
      language,
      rates,
      ratesLoading,
      ratesError,
      setCurrency,
      setLanguage,
      refreshRates,
      hydrated,
    ]
  );

  return (
    <MarketPreferencesContext.Provider value={contextValue}>
      {children}
    </MarketPreferencesContext.Provider>
  );
}

export function useMarketPreferences() {
  const context = useContext(MarketPreferencesContext);

  if (!context) {
    throw new Error(
      "useMarketPreferences must be used inside MarketPreferencesProvider."
    );
  }

  return context;
}
