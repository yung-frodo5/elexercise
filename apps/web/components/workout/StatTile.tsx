"use client";

import { theme } from "@exercise-tracker/design-tokens";

export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: theme.typography.size.xs, color: theme.colors.textMuted }}>{label}</div>
      <div style={{ fontSize: theme.typography.size.lg, fontWeight: theme.typography.weight.semibold }}>
        {value}
      </div>
    </div>
  );
}
