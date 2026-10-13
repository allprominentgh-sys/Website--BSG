"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextType = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

const STORAGE_KEY = "bestsalesgh-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [ready, setReady] = useState(false);

  const applyTheme = useCallback((mode: ThemeMode) => {
    const dark =
      mode === "dark" ||
      (mode === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, []);

  useEffect(() => {
    let initialTheme: ThemeMode = "system";

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (saved === "light" || saved === "dark" || saved === "system") {
        initialTheme = saved;
      }
    } catch {
      // Continue with System Default if storage is unavailable.
    }

    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setReady(true);
  }, [applyTheme]);

  useEffect(() => {
    if (!ready || theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const update = () => applyTheme("system");

    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, [theme, ready, applyTheme]);

  const setTheme = useCallback(
    (nextTheme: ThemeMode) => {
      setThemeState(nextTheme);
      applyTheme(nextTheme);

      try {
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch {
        // Theme still works for this page session.
      }
    },
    [applyTheme]
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
