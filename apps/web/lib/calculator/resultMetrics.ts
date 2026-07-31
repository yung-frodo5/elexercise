import { formatGrams, formatKg, formatKwh, formatPercent, formatUsdPerWorkout } from "./format";
import type { CalculatorResult } from "./types";

export type ResultMetricSection = "Cost per workout" | "Value ratios" | "Lifetime impact";

export interface ResultMetric {
  section: ResultMetricSection;
  label: string;
  bold?: boolean;
  format: (result: CalculatorResult) => string;
}

// Single source of truth for "what output rows exist and how they're formatted" — used both by the
// results table (any equipment count) so the vocabulary can't drift. Break-even is deliberately excluded
// here (only shown at 2+ equipment) and rendered separately by CalculatorResultsTable.
export const RESULT_METRICS: ResultMetric[] = [
  {
    section: "Cost per workout",
    label: "Exercise cost",
    format: (r) => formatUsdPerWorkout(r.costPerWorkoutExercise),
  },
  {
    section: "Cost per workout",
    label: "Electricity cost",
    format: (r) => formatUsdPerWorkout(r.costPerWorkoutElectricity),
  },
  {
    section: "Cost per workout",
    label: "Carbon cost",
    format: (r) => formatUsdPerWorkout(r.costPerWorkoutCarbon),
  },
  {
    section: "Cost per workout",
    label: "Total",
    bold: true,
    format: (r) => formatUsdPerWorkout(r.totalCostPerWorkout),
  },
  {
    section: "Value ratios",
    label: "Electricity vs. exercise",
    format: (r) => formatPercent(r.valueRatioElectricityToExercise),
  },
  {
    section: "Value ratios",
    label: "Carbon vs. exercise",
    format: (r) => formatPercent(r.valueRatioCarbonToExercise),
  },
  {
    section: "Lifetime impact",
    label: "Electricity generated",
    format: (r) => formatKwh(r.electricityGeneratedLifetimeKwh),
  },
  {
    section: "Lifetime impact",
    label: "Electricity cost",
    format: (r) => formatUsdPerWorkout(r.lifetimeElectricityValueUsd),
  },
  {
    section: "Lifetime impact",
    label: "Carbon offset",
    format: (r) => formatKg(r.carbonOffsetLifetimeKg),
  },
  {
    section: "Lifetime impact",
    label: "Carbon offset per workout",
    format: (r) => formatGrams(r.carbonOffsetPerWorkoutGrams),
  },
  {
    section: "Lifetime impact",
    label: "Carbon cost",
    format: (r) => formatUsdPerWorkout(r.lifetimeCarbonValueUsd),
  },
];

export const RESULT_METRIC_SECTIONS: ResultMetricSection[] = ["Cost per workout", "Value ratios", "Lifetime impact"];
