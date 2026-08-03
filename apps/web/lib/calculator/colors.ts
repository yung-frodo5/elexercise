import { theme } from "@exercise-tracker/design-tokens";

// Curated, on-brand set for the Equipment Editor's Color field. A new, calculator-scoped palette -- not a
// reuse of activityColors.ts's TAG_PALETTE (unexported, and shared with unrelated real sport-tag UI:
// SportTag.tsx / WorkoutHistoryRow.tsx on both web and mobile). Swaps that palette's accentBlue for
// accentBlueMuted, since accentBlue clashed with this feature's own navy chrome when used verbatim as a
// chart-line/roster-pill-border color (the old id-hashed colorForEquipment in CashFlowChart.tsx worked
// around this with a one-off remap to `error` -- no longer needed now that color is explicit and this
// palette sidesteps the clash up front). navy/navyStatic/border are excluded -- reserved for chrome and
// app-wide text, not per-item accents.
export const EQUIPMENT_COLOR_PALETTE = [
  theme.colors.secondaryGreen,
  theme.colors.accentBlueMuted,
  theme.colors.colorContrast,
  theme.colors.accentBrick,
  theme.colors.primaryGreen,
] as const;

// Round-robins through EQUIPMENT_COLOR_PALETTE by creation order rather than hashing an id -- an unsaved
// draft has no id yet (CalculatorColumn.id is "" until Save). Callers pass a monotonically increasing
// counter (Calculator.tsx's nextId.current) so each newly-created draft's default color is one step further
// around the palette than the last. Doesn't scan the current equipment list for an actual collision -- with
// 5 on-brand colors, only the 6th+ piece of equipment ever repeats one, and the Color field always lets the
// user override it anyway.
export function defaultEquipmentColor(index: number): string {
  return EQUIPMENT_COLOR_PALETTE[index % EQUIPMENT_COLOR_PALETTE.length]!;
}
