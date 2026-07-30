"use client";

import type { CSSProperties } from "react";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";

/** Additive filter pill — reusable across list screens. */
export function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const style: CSSProperties = {
    padding: `5px ${theme.spacing.md}px`,
    borderRadius: theme.radii.pill,
    border: `1px solid ${
      active ? withAlpha(theme.colors.primaryGreen, 0.45) : withAlpha(theme.colors.border, 0.28)
    }`,
    background: active ? withAlpha(theme.colors.primaryGreen, 0.2) : "transparent",
    color: active ? theme.colors.secondaryGreen : theme.colors.textMuted,
    fontSize: theme.typography.size.xs,
    fontWeight: active ? theme.typography.weight.semibold : theme.typography.weight.medium,
    fontFamily: theme.typography.fontFamily.web,
    cursor: "pointer",
    transition: "background-color 140ms ease, color 140ms ease, border-color 140ms ease",
  };

  return (
    <button type="button" onClick={onClick} aria-pressed={active} style={style}>
      {label}
    </button>
  );
}
