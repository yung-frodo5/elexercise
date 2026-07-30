"use client";

import { theme } from "@exercise-tracker/design-tokens";

export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: theme.typography.size.xs,
          fontWeight: theme.typography.weight.semibold,
          color: theme.colors.textMuted,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 2,
          fontSize: theme.typography.size.lg,
          fontWeight: theme.typography.weight.semibold,
          color: theme.colors.textPrimary,
        }}
      >
        {value}
      </div>
    </div>
  );
}
