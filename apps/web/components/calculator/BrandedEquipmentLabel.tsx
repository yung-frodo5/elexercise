"use client";

import type { ReactNode } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { isElexerciseEquipment } from "../../lib/calculator";
import type { CalculatorInputs } from "../../lib/calculator";

// Wraps `children` in bold + a lightning bolt whenever `inputs` is currently running one of the
// elexercise-branded presets, uncustomized (see isElexerciseEquipment) -- passes `children` through
// unstyled otherwise. Single source of truth for the three call sites that need this treatment: the
// results table's "Equipment preset" row, EquipmentEditor's preset caption, and roster pills/column
// headers (see CalculatorResultsTable.tsx, EquipmentEditor.tsx, EquipmentRoster.tsx). Uses a plain ⚡
// glyph rather than the brand logo image -- at the small size this renders inline, the logo (a lightbulb)
// was too small to read as anything recognizable; the same ⚡ already marks these presets in
// EquipmentEditor's dropdown (EQUIPMENT_TYPE_OPTIONS_WITH_BRAND_MARKER).
//
// `textColor` defaults to the brand green, which reads fine against this app's light backgrounds -- but
// EquipmentRoster's pills sit on a dark navy backdrop where that green is hard to read, so it overrides
// this to white there while keeping the bolt and bold weight.
export function BrandedEquipmentLabel({
  inputs,
  children,
  textColor = theme.colors.primaryGreen,
}: {
  inputs: CalculatorInputs;
  children: ReactNode;
  textColor?: string;
}) {
  if (!isElexerciseEquipment(inputs)) return <>{children}</>;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: theme.spacing.xs,
        color: textColor,
        fontWeight: theme.typography.weight.bold,
      }}
    >
      {/* U+FE0F forces the emoji (color) presentation of U+26A1 -- without it, browsers default to the
          plain black-and-white text-style glyph for this particular character. */}
      <span aria-hidden style={{ flexShrink: 0 }}>
        {"⚡️"}
      </span>
      {children}
    </span>
  );
}
