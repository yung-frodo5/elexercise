"use client";

import type { CSSProperties, ReactNode } from "react";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";

/** Soft bordered surface for empty states and lightweight panels. */
export function SoftPanel({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        // Static -- this panel is always a light card, in both themes.
        // Consumers must pair it with theme.colors.static.* text, not a
        // flipping token (see history/page.tsx's empty state for why this
        // matters).
        backgroundColor: theme.colors.static.panelBg,
        border: `1px solid ${withAlpha(theme.colors.border, 0.28)}`,
        borderRadius: theme.radii.lg,
        boxShadow: `0 4px 16px ${withAlpha(theme.colors.static.ink, 0.06)}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
