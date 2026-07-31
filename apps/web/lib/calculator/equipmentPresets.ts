import type { CalculatorInputs, EquipmentType } from "./types";

export interface EquipmentPresetValues {
  capitalCost: number;
  subscriptionFeeMonthly: number;
  lifespanYears: number;
  powerGenWh: number;
}

// Sourced from the repo-root "cost per workout calculator.xlsx" spreadsheet's "Equipment Per-Workout
// Value" tab (Peloton/Tonal abstracted to generic category names), plus two user-supplied "basic" tiers.
// Every preset besides the two "- elexercise" ones has powerGenWh: 0 — they're ordinary (non-power-
// generating) exercise equipment, not actual elexercise gear. "custom" is intentionally absent —
// selecting it never overwrites capitalCost/subscriptionFeeMonthly/lifespanYears/powerGenWh.
export const EQUIPMENT_PRESETS: Partial<Record<EquipmentType, EquipmentPresetValues>> = {
  rackBarbellPlates: { capitalCost: 1800, subscriptionFeeMonthly: 0, lifespanYears: 15, powerGenWh: 0 },
  powerRack: { capitalCost: 2500, subscriptionFeeMonthly: 0, lifespanYears: 15, powerGenWh: 0 },
  dumbbellFreeWeights: { capitalCost: 400, subscriptionFeeMonthly: 0, lifespanYears: 10, powerGenWh: 0 },
  stationaryBikeBasic: { capitalCost: 1200, subscriptionFeeMonthly: 0, lifespanYears: 7, powerGenWh: 0 },
  stationaryBikeSmart: { capitalCost: 1445, subscriptionFeeMonthly: 50, lifespanYears: 7, powerGenWh: 0 },
  homeGymBasic: { capitalCost: 2000, subscriptionFeeMonthly: 0, lifespanYears: 7, powerGenWh: 0 },
  homeGymSmart: { capitalCost: 4295, subscriptionFeeMonthly: 59.95, lifespanYears: 7, powerGenWh: 0 },
  stationaryBikeElexercise: { capitalCost: 1600, subscriptionFeeMonthly: 0, lifespanYears: 7, powerGenWh: 150 },
  strengthTrainingElexercise: { capitalCost: 2000, subscriptionFeeMonthly: 0, lifespanYears: 7, powerGenWh: 150 },
};

export const EQUIPMENT_TYPE_OPTIONS: { value: EquipmentType; label: string }[] = [
  { value: "custom", label: "Custom" },
  { value: "stationaryBikeBasic", label: "Stationary bike - basic" },
  { value: "stationaryBikeSmart", label: "Stationary bike - smart" },
  { value: "stationaryBikeElexercise", label: "Stationary bike - elexercise" },
  { value: "rackBarbellPlates", label: "Rack + barbell + plates" },
  { value: "powerRack", label: "Power rack" },
  { value: "dumbbellFreeWeights", label: "Dumbbell free weights" },
  { value: "homeGymBasic", label: "At-home multifunctional gym - basic" },
  { value: "homeGymSmart", label: "At-home multifunctional gym - smart" },
  { value: "strengthTrainingElexercise", label: "Strength training - elexercise" },
];

export function applyEquipmentType(inputs: CalculatorInputs, equipmentType: EquipmentType): CalculatorInputs {
  return { ...inputs, equipmentType, ...(EQUIPMENT_PRESETS[equipmentType] ?? {}) };
}
