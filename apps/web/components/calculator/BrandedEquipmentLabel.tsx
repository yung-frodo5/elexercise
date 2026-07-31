"use client";

import type { ReactNode } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { isElexerciseEquipment } from "../../lib/calculator";
import type { CalculatorInputs } from "../../lib/calculator";
import logo from "../../assets/images/logo.png";

// Wraps `children` in bold green + the brand logo icon whenever `inputs` is currently running one of the
// elexercise-branded presets, uncustomized (see isElexerciseEquipment) -- passes `children` through
// unstyled otherwise. Single source of truth for the three call sites that need this treatment: the
// results table's "Equipment preset" row, EquipmentEditor's preset caption, and roster pills/column
// headers (see CalculatorResultsTable.tsx, EquipmentEditor.tsx, EquipmentRoster.tsx).
export function BrandedEquipmentLabel({ inputs, children }: { inputs: CalculatorInputs; children: ReactNode }) {
  if (!isElexerciseEquipment(inputs)) return <>{children}</>;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: theme.spacing.xs,
        color: theme.colors.primaryGreen,
        fontWeight: theme.typography.weight.bold,
      }}
    >
      <img src={logo.src} alt="" width={14} height={14} style={{ display: "inline-block", flexShrink: 0 }} />
      {children}
    </span>
  );
}
