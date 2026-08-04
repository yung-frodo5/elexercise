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
// generating) exercise equipment, not actual elexercise gear. Every EquipmentType has an entry here
// (there's no "custom" member to omit — see the comment on EquipmentType in types.ts).
export const EQUIPMENT_PRESETS: Record<EquipmentType, EquipmentPresetValues> = {
  rackBarbellPlates: { capitalCost: 1800, subscriptionFeeMonthly: 0, lifespanYears: 15, powerGenWh: 0 },
  powerRack: { capitalCost: 2500, subscriptionFeeMonthly: 0, lifespanYears: 15, powerGenWh: 0 },
  dumbbellFreeWeights: { capitalCost: 400, subscriptionFeeMonthly: 0, lifespanYears: 10, powerGenWh: 0 },
  stationaryBikeBasic: { capitalCost: 1200, subscriptionFeeMonthly: 0, lifespanYears: 7, powerGenWh: 0 },
  stationaryBikeSmart: { capitalCost: 1400, subscriptionFeeMonthly: 50, lifespanYears: 7, powerGenWh: 0 },
  homeGymBasic: { capitalCost: 2000, subscriptionFeeMonthly: 0, lifespanYears: 7, powerGenWh: 0 },
  homeGymSmart: { capitalCost: 4295, subscriptionFeeMonthly: 59.95, lifespanYears: 7, powerGenWh: 0 },
  stationaryBikeElexercise: { capitalCost: 1400, subscriptionFeeMonthly: 0, lifespanYears: 7, powerGenWh: 150 },
  strengthTrainingElexercise: { capitalCost: 2000, subscriptionFeeMonthly: 0, lifespanYears: 7, powerGenWh: 150 },
};

export const EQUIPMENT_TYPE_OPTIONS: { value: EquipmentType; label: string }[] = [
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
  return { ...inputs, equipmentType, ...EQUIPMENT_PRESETS[equipmentType] };
}

const ELEXERCISE_EQUIPMENT_TYPES: EquipmentType[] = ["stationaryBikeElexercise", "strengthTrainingElexercise"];

export function isElexerciseEquipmentType(equipmentType: EquipmentType): boolean {
  return ELEXERCISE_EQUIPMENT_TYPES.includes(equipmentType);
}

// Branding tracks actual power generation, not preset identity -- any equipment generating power (whether
// from an elexercise preset or custom economics with a hand-entered Power generation value) counts.
export function isElexerciseEquipment(inputs: CalculatorInputs): boolean {
  return inputs.powerGenWh > 0;
}
