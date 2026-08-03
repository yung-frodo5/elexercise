"use client";

import { useState } from "react";
import { theme } from "@exercise-tracker/design-tokens";

export function StartMachineForm({ onStart, busy }: { onStart: (scanToken: string) => void; busy: boolean }) {
  const [machineId, setMachineId] = useState("");

  return (
    <div style={{ display: "flex", gap: theme.spacing.sm, alignItems: "center", marginTop: theme.spacing.xs }}>
      <input
        placeholder="Machine ID"
        value={machineId}
        onChange={(e) => setMachineId(e.target.value)}
        style={{ width: 160 }}
      />
      <button
        onClick={() => {
          if (!machineId.trim()) return;
          onStart(machineId.trim());
          setMachineId("");
        }}
        disabled={busy || !machineId.trim()}
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
        Connect
      </button>
    </div>
  );
}
