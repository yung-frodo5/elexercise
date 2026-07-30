"use client";

import type { CSSProperties, ReactNode } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { withAlpha } from "../../lib/color";

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
        backgroundColor: theme.colors.background,
        border: `1px solid ${withAlpha(theme.colors.border, 0.28)}`,
        borderRadius: 10,
        boxShadow: `0 4px 16px ${withAlpha(theme.colors.textPrimary, 0.06)}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
