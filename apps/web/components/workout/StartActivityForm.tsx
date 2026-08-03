"use client";

import { useState } from "react";
import { theme } from "@exercise-tracker/design-tokens";

const ACTIVITY_PRESETS = ["Run", "Bike", "Row", "Strength", "Walk"];

export function StartActivityForm({
  onStart,
  busy,
}: {
  onStart: (activityType: string) => void;
  busy: boolean;
}) {
  const [other, setOther] = useState("");

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.sm, alignItems: "center" }}>
      {ACTIVITY_PRESETS.map((preset) => (
        <button
          key={preset}
          onClick={() => onStart(preset)}
          disabled={busy}
          style={{ fontSize: theme.typography.size.sm }}
        >
          {preset}
        </button>
      ))}
      {/* Grouped so the input and its "Add" button wrap together as one
          unit -- otherwise the outer row's own wrap could split them onto
          separate lines once the preset buttons ahead of it fill the row. */}
      <div style={{ display: "flex", gap: theme.spacing.sm, alignItems: "center" }}>
        <input placeholder="Other…" value={other} onChange={(e) => setOther(e.target.value)} style={{ width: 120 }} />
        <button
          onClick={() => {
            if (!other.trim()) return;
            onStart(other.trim());
            setOther("");
          }}
          disabled={busy || !other.trim()}
          style={{
            padding: `${theme.spacing.xs}px ${theme.spacing.lg}px`,
            borderRadius: theme.radii.pill,
            border: "none",
            background: theme.colors.primaryGreen,
            color: "#FFFFFF",
            fontWeight: theme.typography.weight.semibold,
            fontFamily: "'Clash Display', sans-serif",
            fontSize: theme.typography.size.sm,
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
