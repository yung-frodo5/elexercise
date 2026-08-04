export type UsageRate = "sporadic" | "regular" | "committed" | "shared" | "public";

// "Custom" isn't a member here — it's not a preset, it's the absence of one. Whether custom economics/
// energy inputs are in effect is tracked separately via customizeEconomics/customizeEnergy below, so
// this type only ever names a real, appliable preset.
export type EquipmentType =
  | "rackBarbellPlates"
  | "powerRack"
  | "dumbbellFreeWeights"
  | "stationaryBikeBasic"
  | "stationaryBikeSmart"
  | "homeGymBasic"
  | "homeGymSmart"
  | "stationaryBikeElexercise"
  | "strengthTrainingElexercise";

// Named `LocationPreset` (not `Location`) so it doesn't shadow the DOM `Location` type. Like
// EquipmentType, has no "custom" member — see the comment there.
export type LocationPreset = "california" | "hawaii";

export interface CalculatorInputs {
  equipmentType: EquipmentType; // drives capitalCost/subscriptionFeeMonthly/lifespanYears — see equipmentPresets.ts
  location: LocationPreset; // drives electricityPricePerKwh/gridCarbonIntensityGPerKwh — see locationPresets.ts
  customizeEconomics: boolean; // reveals Lifespan (Exercise) + Capital cost/Subscription fee/Discount factor (Cost); swaps the Usage rate select for an Annual workouts number input
  customizeEnergy: boolean; // reveals Power generation/Electricity price/Carbon price/Grid carbon intensity + the Discount future electricity/carbon value checkbox (Energy)
  capitalCost: number;
  subscriptionFeeMonthly: number;
  lifespanYears: number;
  usageRate: UsageRate;
  // Only used when customizeEconomics is true (overrides the usageRate → YEARLY_WORKOUTS lookup). Kept in
  // sync with usageRate while in preset mode, so it starts pre-filled correctly on switching to custom.
  annualWorkouts: number;
  powerGenWh: number;
  electricityPricePerKwh: number;
  discountFactor: number;
  carbonPricePerTon: number;
  gridCarbonIntensityGPerKwh: number;
  // Editable only via "Specify custom energy inputs", but (like the other custom-energy fields) always in
  // effect regardless of customizeEnergy's current value — see computeCostPerWorkout.ts.
  discountEnergyValue: boolean;
}

export interface CalculatorResult {
  annuityFactor: number;
  costPerWorkoutExercise: number;
  costPerWorkoutElectricity: number;
  costPerWorkoutCarbon: number;
  totalCostPerWorkout: number;
  valueRatioElectricityToExercise: number;
  valueRatioCarbonToExercise: number;
  yearlyWorkouts: number;
  electricityGeneratedLifetimeKwh: number;
  carbonOffsetPerWorkoutGrams: number;
  carbonOffsetLifetimeKg: number;
  lifetimeElectricityValueUsd: number;
  lifetimeCarbonValueUsd: number;
}

// One piece of equipment as it appears in the roster/results — `name`/`color` are display concerns, not
// math inputs, so they live here rather than on `CalculatorInputs`. `id` is "" for an unsaved draft.
export interface CalculatorColumn {
  id: string;
  name: string;
  // Always a 6-digit lowercase hex string (e.g. "#386641") -- both the preset swatches and the native
  // <input type="color"> that make up the Color field (formFields.tsx's ColorField) only ever produce that
  // shape, so there's nothing for validation.ts to check. Chart line stroke / roster pill border color; see
  // CashFlowChart.tsx / EquipmentRoster.tsx.
  color: string;
  inputs: CalculatorInputs;
}
