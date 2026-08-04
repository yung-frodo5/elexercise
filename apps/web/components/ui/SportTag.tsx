"use client";

import { theme } from "@exercise-tracker/design-tokens";
import { sportTagColors } from "../../lib/activityColors";
import { familjenGrotesk } from "../../lib/fonts";

/** Read-only sport pill for table cells (Datadog-style tags). */
export function SportTag({ label }: { label: string }) {
  const { fg, bg } = sportTagColors(label);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: `3px ${theme.spacing.sm}px`,
        borderRadius: theme.radii.pill,
        background: bg,
        color: fg,
        fontSize: theme.typography.size.sm,
        fontWeight: theme.typography.weight.semibold,
        fontFamily: familjenGrotesk.style.fontFamily,
        lineHeight: 1.3,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
