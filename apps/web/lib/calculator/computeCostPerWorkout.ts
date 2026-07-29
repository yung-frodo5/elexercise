import type { CalculatorInputs, CalculatorResult } from "./types";
import { YEARLY_WORKOUTS } from "./usageRates";

// Annuity factor A(r, L) = (1 - (1+r)^-L) / r, from the spreadsheet's
// "Equipment Per-Workout Value" tab (E6:E10). As r -> 0 this is undefined
// (division by zero) but has a well-defined limit of L, so that case is
// special-cased rather than left to blow up or return NaN/Infinity.
export function annuityFactor(discountFactor: number, lifespanYears: number): number {
  if (discountFactor === 0) return lifespanYears;
  return (1 - Math.pow(1 + discountFactor, -lifespanYears)) / discountFactor;
}

export function computeCostPerWorkout(inputs: CalculatorInputs): CalculatorResult {
  const yearlyWorkouts = YEARLY_WORKOUTS[inputs.usageRate];
  const factor = annuityFactor(inputs.discountFactor, inputs.lifespanYears);

  // Equipment Per-Workout Value tab, A1: Capital / (freq * A(r,L)) + Sub / freq
  // (Sub is annualized — the sheet's own "$C3*12" pattern — since the
  // subscription input here is a monthly fee.)
  const costPerWorkoutExercise =
    inputs.capitalCost / (yearlyWorkouts * factor) + (inputs.subscriptionFeeMonthly * 12) / yearlyWorkouts;

  const costPerWorkoutElectricity = -(inputs.powerGenWh * inputs.electricityPricePerKwh) / 1000;
  const costPerWorkoutCarbon =
    (-((inputs.gridCarbonIntensityGPerKwh * inputs.powerGenWh) / 1000) * inputs.carbonPricePerTon) / 1_000_000;

  const totalCostPerWorkout = costPerWorkoutExercise + costPerWorkoutElectricity + costPerWorkoutCarbon;

  // Guard against division by zero when there's no equipment/subscription
  // cost to compare against (e.g. free equipment) — the ratio is undefined,
  // so show 0 rather than Infinity/NaN.
  const valueRatioElectricityToExercise =
    costPerWorkoutExercise === 0 ? 0 : -costPerWorkoutElectricity / costPerWorkoutExercise;
  const valueRatioCarbonToExercise =
    costPerWorkoutExercise === 0 ? 0 : -costPerWorkoutCarbon / costPerWorkoutExercise;

  const electricityGeneratedLifetimeKwh = inputs.lifespanYears * (inputs.powerGenWh / 1000) * yearlyWorkouts;
  const carbonOffsetPerWorkoutGrams = (inputs.powerGenWh / 1000) * inputs.gridCarbonIntensityGPerKwh;
  const carbonOffsetLifetimeKg = (carbonOffsetPerWorkoutGrams * yearlyWorkouts * inputs.lifespanYears) / 1000;

  return {
    annuityFactor: factor,
    costPerWorkoutExercise,
    costPerWorkoutElectricity,
    costPerWorkoutCarbon,
    totalCostPerWorkout,
    valueRatioElectricityToExercise,
    valueRatioCarbonToExercise,
    yearlyWorkouts,
    electricityGeneratedLifetimeKwh,
    carbonOffsetPerWorkoutGrams,
    carbonOffsetLifetimeKg,
  };
}
