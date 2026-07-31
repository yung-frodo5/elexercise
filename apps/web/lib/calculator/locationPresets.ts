import type { CalculatorInputs, LocationPreset } from "./types";

export interface LocationPresetValues {
  electricityPricePerKwh: number;
  gridCarbonIntensityGPerKwh: number;
}

// State-average reference values from the same spreadsheet's own notes (EIA 2024 electricity prices,
// eGRID grid carbon intensity). "custom" is intentionally absent — selecting it never overwrites
// electricityPricePerKwh/gridCarbonIntensityGPerKwh. Does not touch powerGenWh or carbonPricePerTon.
export const LOCATION_PRESETS: Partial<Record<LocationPreset, LocationPresetValues>> = {
  california: { electricityPricePerKwh: 0.27, gridCarbonIntensityGPerKwh: 195 },
  hawaii: { electricityPricePerKwh: 0.38, gridCarbonIntensityGPerKwh: 680 },
};

export const LOCATION_OPTIONS: { value: LocationPreset; label: string }[] = [
  { value: "custom", label: "Custom" },
  { value: "california", label: "California" },
  { value: "hawaii", label: "Hawaii" },
];

export function applyLocation(inputs: CalculatorInputs, location: LocationPreset): CalculatorInputs {
  return { ...inputs, location, ...(LOCATION_PRESETS[location] ?? {}) };
}
