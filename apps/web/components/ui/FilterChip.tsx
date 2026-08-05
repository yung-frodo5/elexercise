"use client";

import type { CSSProperties } from "react";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import { familjenGrotesk } from "../../lib/fonts";

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
      active ? withAlpha(theme.colors.primaryGreen, 0.45) : theme.colors.themed.controlBorder
    }`,
    background: active ? withAlpha(theme.colors.primaryGreen, 0.2) : "transparent",
    // themed.link (not the static secondaryGreen) -- this chip has no
    // background of its own in the inactive case and a translucent tint in
    // the active case, both of which sit directly on the ambient/flipping
    // page background, so the text needs to flip too.
    color: active ? theme.colors.themed.link : theme.colors.themed.navy,
    fontSize: theme.typography.size.sm,
    fontWeight: active ? theme.typography.weight.semibold : theme.typography.weight.medium,
    fontFamily: familjenGrotesk.style.fontFamily,
    cursor: "pointer",
    transition: "background-color 140ms ease, color 140ms ease, border-color 140ms ease",
  };

  return (
    <button type="button" onClick={onClick} aria-pressed={active} style={style}>
      {label}
    </button>
  );
}
