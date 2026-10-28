
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
  { code: "GHS", label: "GHS — Ghana Cedi", symbol: "GH₵" },
  { code: "USD", label: "USD — US Dollar", symbol: "$" },
  { code: "CNY", label: "CNY — Chinese Yuan", symbol: "¥" },
  { code: "EUR", label: "EUR — Euro", symbol: "€" },
  { code: "GBP", label: "GBP — British Pound", symbol: "£" },
  { code: "NGN", label: "NGN — Nigerian Naira", symbol: "₦" },
  { code: "ZAR", label: "ZAR — South African Rand", symbol: "R" },
  { code: "CAD", label: "CAD — Canadian Dollar", symbol: "C$" },
  { code: "AED", label: "AED — UAE Dirham", symbol: "د.إ" },
] as const;

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "tw", label: "Twi" },
] as const;

export type CurrencyCode =
  (typeof SUPPORTED_CURRENCIES)[number]["code"];

export type LanguageCode =
  (typeof SUPPORTED_LANGUAGES)[number]["code"];

type MarketPreferencesContextValue = {
  currency: CurrencyCode;
  language: LanguageCode;
  setCurrency: (value: CurrencyCode) => void;
  setLanguage: (value: LanguageCode) => void;
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
  const [currency, setCurrencyState] = useState<CurrencyCode>("GHS");
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

      if (savedCurrency && isCurrencyCode(savedCurrency)) {
        setCurrencyState(savedCurrency);
      }

      if (savedLanguage && isLanguageCode(savedLanguage)) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.warn("Could not load saved marketplace preferences:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  const setCurrency = useCallback((value: CurrencyCode) => {
    setCurrencyState(value);

    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, value);
    } catch (error) {
      console.warn("Could not save currency preference:", error);
    }
  }, []);

  const setLanguage = useCallback((value: LanguageCode) => {
    setLanguageState(value);

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
    } catch (error) {
      console.warn("Could not save language preference:", error);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      currency,
      language,
      setCurrency,
      setLanguage,
      hydrated,
    }),
    [currency, language, setCurrency, setLanguage, hydrated]
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
