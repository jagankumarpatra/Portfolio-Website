"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light";
type ThemeContextValue = { theme: Theme; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeShell");
  return value;
}

export default function ThemeShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("portfolio-theme");
    if (saved === "dark" || saved === "light") {
      if (saved !== theme) setTheme(saved);
    }
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => {
      const next = theme === "dark" ? "light" : "dark";
      localStorage.setItem("portfolio-theme", next);
      setTheme(next);
    },
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <div data-theme={theme} className="theme-shell flex min-h-screen flex-col bg-bg text-fg">{children}</div>
    </ThemeContext.Provider>
  );
}
