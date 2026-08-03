"use client";

import { theme } from "@exercise-tracker/design-tokens";
import { useTheme } from "../../lib/ThemeContext";

export function ThemeToggle() {
  const { theme: mode, toggleTheme } = useTheme();
  const isDark = mode === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: theme.typography.size.md,
        flexShrink: 0,
      }}
    >
      <span aria-hidden>{isDark ? theme.icons.sun : theme.icons.moon}</span>
    </button>
  );
}
