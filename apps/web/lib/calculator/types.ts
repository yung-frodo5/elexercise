export type UsageRate = "sporadic" | "regular" | "committed" | "shared" | "public";

export interface CalculatorInputs {
  capitalCost: number;
  subscriptionFeeMonthly: number;
  lifespanYears: number;
  usageRate: UsageRate;
  powerGenWh: number;
  electricityPricePerKwh: number;
  discountFactor: number;
  carbonPricePerTon: number;
  gridCarbonIntensityGPerKwh: number;
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
}
