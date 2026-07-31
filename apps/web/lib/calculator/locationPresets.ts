import type { CalculatorInputs, LocationPreset } from "./types";

export interface LocationPresetValues {
  electricityPricePerKwh: number;
  gridCarbonIntensityGPerKwh: number;
}

// State-average reference values from the same spreadsheet's own notes (EIA 2024 electricity prices,
// eGRID grid carbon intensity). Every LocationPreset has an entry here (there's no "custom" member to
// omit — see the comment on LocationPreset in types.ts). Does not touch powerGenWh or carbonPricePerTon.
export const LOCATION_PRESETS: Record<LocationPreset, LocationPresetValues> = {
  california: { electricityPricePerKwh: 0.27, gridCarbonIntensityGPerKwh: 195 },
  hawaii: { electricityPricePerKwh: 0.38, gridCarbonIntensityGPerKwh: 680 },
};

export const LOCATION_OPTIONS: { value: LocationPreset; label: string }[] = [
  { value: "california", label: "California" },
  { value: "hawaii", label: "Hawaii" },
];

export function applyLocation(inputs: CalculatorInputs, location: LocationPreset): CalculatorInputs {
  return { ...inputs, location, ...LOCATION_PRESETS[location] };
}
