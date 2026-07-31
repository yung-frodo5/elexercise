import { describe, it, expect } from "vitest";
import { applyLocation, LOCATION_OPTIONS, LOCATION_PRESETS } from "./locationPresets";
import { DEFAULT_CALCULATOR_INPUTS } from "./defaults";
import type { LocationPreset } from "./types";

describe("LOCATION_PRESETS", () => {
  it("matches the spec'd numbers exactly", () => {
    expect(LOCATION_PRESETS).toEqual({
      california: { electricityPricePerKwh: 0.27, gridCarbonIntensityGPerKwh: 195 },
      hawaii: { electricityPricePerKwh: 0.38, gridCarbonIntensityGPerKwh: 680 },
    });
  });

  it("has no entry for 'custom'", () => {
    expect(LOCATION_PRESETS.custom).toBeUndefined();
  });

  it("has an option in LOCATION_OPTIONS for every preset key plus 'custom'", () => {
    const optionValues = LOCATION_OPTIONS.map((o) => o.value).sort();
    const expectedValues: LocationPreset[] = ["custom", ...(Object.keys(LOCATION_PRESETS) as LocationPreset[])].sort();
    expect(optionValues).toEqual(expectedValues);
  });
});

describe("applyLocation", () => {
  it("overwrites electricityPricePerKwh/gridCarbonIntensityGPerKwh for a named preset", () => {
    const result = applyLocation(DEFAULT_CALCULATOR_INPUTS, "hawaii");
    expect(result.location).toBe("hawaii");
    expect(result.electricityPricePerKwh).toBe(0.38);
    expect(result.gridCarbonIntensityGPerKwh).toBe(680);
  });

  it("never touches powerGenWh or carbonPricePerTon", () => {
    const result = applyLocation({ ...DEFAULT_CALCULATOR_INPUTS, powerGenWh: 321, carbonPricePerTon: 77 }, "hawaii");
    expect(result.powerGenWh).toBe(321);
    expect(result.carbonPricePerTon).toBe(77);
  });

  it("never overwrites anything when selecting 'custom'", () => {
    const customized = {
      ...DEFAULT_CALCULATOR_INPUTS,
      electricityPricePerKwh: 0.99,
      gridCarbonIntensityGPerKwh: 42,
    };
    const result = applyLocation(customized, "custom");
    expect(result.location).toBe("custom");
    expect(result.electricityPricePerKwh).toBe(0.99);
    expect(result.gridCarbonIntensityGPerKwh).toBe(42);
  });
});
