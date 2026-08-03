"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type ThemeName = "light" | "dark";

const STORAGE_KEY = "elexercise-theme";

const ThemeContext = createContext<{ theme: ThemeName; toggleTheme: () => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>("light");

  // Read the saved preference after mount, not during the initial render --
  // the server always renders "light", so doing this in an effect (not
  // useState's initializer) keeps the client's first render matching the
  // server's and avoids a hydration mismatch. Returning dark-mode users get
  // a brief light-mode flash before this runs; an accepted tradeoff.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
