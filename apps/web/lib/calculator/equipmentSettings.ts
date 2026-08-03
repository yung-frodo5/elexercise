import { EQUIPMENT_TYPE_OPTIONS } from "./equipmentPresets";
import { LOCATION_OPTIONS } from "./locationPresets";
import { USAGE_RATE_OPTIONS } from "./usageRates";
import { formatPowerGenWh } from "./format";
import type { CalculatorInputs } from "./types";

function optionLabel<T extends string>(options: { value: T; label: string }[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export interface EquipmentSetting {
  label: string;
  format: (inputs: CalculatorInputs) => string;
  // When true, the results table renders format(inputs) wrapped in BrandedEquipmentLabel instead of as
  // plain text -- set only on "Equipment preset", the one row that can show an elexercise-branded name.
  isEquipmentPreset?: boolean;
}

// The raw Equipment Editor fields, in the same top-to-bottom order they appear in the editor
// (Exercise, then Cost, then Energy) — shown as their own "Settings" section in the results table,
// above "Cost per workout", regardless of whether "customize economics"/"customize energy inputs" is toggled.
// "Equipment preset"/"Location" read customizeEconomics/customizeEnergy (not a stored "custom" enum value —
// EquipmentType/LocationPreset no longer have one) to decide whether to show "Custom" or the preset's label.
export const EQUIPMENT_SETTINGS: EquipmentSetting[] = [
  {
    label: "Equipment preset",
    isEquipmentPreset: true,
    format: (inputs) =>
      inputs.customizeEconomics ? "Custom" : optionLabel(EQUIPMENT_TYPE_OPTIONS, inputs.equipmentType),
  },
  { label: "Usage rate", format: (inputs) => optionLabel(USAGE_RATE_OPTIONS, inputs.usageRate) },
  { label: "Lifespan", format: (inputs) => `${inputs.lifespanYears} yr` },
  { label: "Capital cost", format: (inputs) => `$${inputs.capitalCost}` },
  { label: "Subscription fee", format: (inputs) => `$${inputs.subscriptionFeeMonthly}/mo` },
  { label: "Discount factor", format: (inputs) => `${Math.round(inputs.discountFactor * 1e8) / 1e6}%` },
  {
    label: "Location",
    format: (inputs) => (inputs.customizeEnergy ? "Custom" : optionLabel(LOCATION_OPTIONS, inputs.location)),
  },
  // "(net)" -- this can be negative for equipment that consumes power (e.g. a motorized treadmill)
  // rather than generates it.
  { label: "Power generation (net)", format: (inputs) => formatPowerGenWh(inputs.powerGenWh) },
  { label: "Electricity price", format: (inputs) => `$${inputs.electricityPricePerKwh}/kWh` },
  { label: "Carbon price", format: (inputs) => `$${inputs.carbonPricePerTon}/ton CO2e` },
  { label: "Grid carbon intensity", format: (inputs) => `${inputs.gridCarbonIntensityGPerKwh} gCO2e/kWh` },
];
