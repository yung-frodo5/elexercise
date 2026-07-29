import type { CalculatorInputs } from "./types";

export const DEFAULT_CALCULATOR_INPUTS: CalculatorInputs = {
  capitalCost: 1800,
  subscriptionFeeMonthly: 0,
  lifespanYears: 10,
  usageRate: "regular",
  powerGenWh: 150,
  electricityPricePerKwh: 0.38,
  discountFactor: 0.07,
  carbonPricePerTon: 40,
  gridCarbonIntensityGPerKwh: 195,
};
