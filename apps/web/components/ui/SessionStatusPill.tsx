"use client";

import type { SessionStatus } from "@exercise-tracker/shared-types";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import { familjenGrotesk } from "../../lib/fonts";

// Same fg/bg pairs as two entries in workout-history's TAG_PALETTE
// (packages/workout-history/src/activityColors.ts), reused here instead of
// inventing new colors -- colorContrast is the palette's existing
// amber/gold tone, standing in for "yellow" since there's no dedicated
// yellow token.
const STATUS_COLORS: Record<SessionStatus, { fg: string; bg: string; label: string }> = {
  in_progress: { fg: theme.colors.colorContrast, bg: withAlpha(theme.colors.colorContrast, 0.18), label: "In progress" },
  completed: { fg: theme.colors.secondaryGreen, bg: withAlpha(theme.colors.primaryGreen, 0.22), label: "Completed" },
};

/** Read-only status pill for a session -- low-emphasis, so it uses the design system's small pill sizing rather than SportTag's default. */
export function SessionStatusPill({ status }: { status: SessionStatus }) {
  const { fg, bg, label } = STATUS_COLORS[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: `${theme.pill.small.paddingVertical}px ${theme.pill.small.paddingHorizontal}px`,
        borderRadius: theme.radii.pill,
        background: bg,
        color: fg,
        fontSize: theme.pill.small.fontSize,
        fontWeight: theme.pill.small.fontWeight,
        fontFamily: familjenGrotesk.style.fontFamily,
        lineHeight: 1.3,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
