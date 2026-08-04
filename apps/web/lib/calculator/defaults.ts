import type { CalculatorInputs } from "./types";

// Defaults are Stationary bike - basic + California, matching EQUIPMENT_PRESETS.stationaryBikeBasic /
// LOCATION_PRESETS.california (equipmentPresets.ts / locationPresets.ts) — kept as literals here (this
// file's existing convention) rather than calling applyEquipmentType/applyLocation, but the two numeric
// groups below must stay in sync with those presets if either one ever changes.
export const DEFAULT_CALCULATOR_INPUTS: CalculatorInputs = {
  equipmentType: "stationaryBikeBasic",
  location: "california",
  customizeEconomics: false,
  customizeEnergy: false,
  usageRate: "regular",
  capitalCost: 1200, // = EQUIPMENT_PRESETS.stationaryBikeBasic.capitalCost
  subscriptionFeeMonthly: 0, // = EQUIPMENT_PRESETS.stationaryBikeBasic.subscriptionFeeMonthly
  lifespanYears: 7, // = EQUIPMENT_PRESETS.stationaryBikeBasic.lifespanYears
  powerGenWh: 0, // = EQUIPMENT_PRESETS.stationaryBikeBasic.powerGenWh — it isn't elexercise-branded gear
  electricityPricePerKwh: 0.27, // = LOCATION_PRESETS.california.electricityPricePerKwh
  discountFactor: 0.07,
  carbonPricePerTon: 300,
  gridCarbonIntensityGPerKwh: 195, // = LOCATION_PRESETS.california.gridCarbonIntensityGPerKwh
};

// Placeholder text (not a real value) shown in the Name field for a fresh/unsaved draft — the field
// itself starts empty, and Save is rejected with "Name is required." until the user types a real name.
export const NAME_PLACEHOLDER = "Name this equipment";

// Initial chart title, and the fallback it reverts to if a user clears the (editable) title entirely.
export const DEFAULT_CHART_TITLE = "Cost over time";
