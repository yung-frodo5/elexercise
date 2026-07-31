import { describe, it, expect } from "vitest";
import { applyEquipmentType, EQUIPMENT_PRESETS, EQUIPMENT_TYPE_OPTIONS } from "./equipmentPresets";
import { DEFAULT_CALCULATOR_INPUTS } from "./defaults";
import type { EquipmentType } from "./types";

describe("EQUIPMENT_PRESETS", () => {
  it("matches the spec'd numbers exactly", () => {
    expect(EQUIPMENT_PRESETS).toEqual({
      rackBarbellPlates: { capitalCost: 1800, subscriptionFeeMonthly: 0, lifespanYears: 15, powerGenWh: 0 },
      powerRack: { capitalCost: 2500, subscriptionFeeMonthly: 0, lifespanYears: 15, powerGenWh: 0 },
      dumbbellFreeWeights: { capitalCost: 400, subscriptionFeeMonthly: 0, lifespanYears: 10, powerGenWh: 0 },
      stationaryBikeBasic: { capitalCost: 1200, subscriptionFeeMonthly: 0, lifespanYears: 7, powerGenWh: 0 },
      stationaryBikeSmart: { capitalCost: 1445, subscriptionFeeMonthly: 50, lifespanYears: 7, powerGenWh: 0 },
      homeGymBasic: { capitalCost: 2000, subscriptionFeeMonthly: 0, lifespanYears: 7, powerGenWh: 0 },
      homeGymSmart: { capitalCost: 4295, subscriptionFeeMonthly: 59.95, lifespanYears: 7, powerGenWh: 0 },
      stationaryBikeElexercise: { capitalCost: 1600, subscriptionFeeMonthly: 0, lifespanYears: 7, powerGenWh: 150 },
      strengthTrainingElexercise: { capitalCost: 2000, subscriptionFeeMonthly: 0, lifespanYears: 7, powerGenWh: 150 },
    });
  });

  it("has no entry for 'custom'", () => {
    expect(EQUIPMENT_PRESETS.custom).toBeUndefined();
  });

  it("zeroes out power generation for every preset except the two elexercise ones", () => {
    for (const [equipmentType, preset] of Object.entries(EQUIPMENT_PRESETS)) {
      if (equipmentType === "stationaryBikeElexercise" || equipmentType === "strengthTrainingElexercise") {
        expect(preset!.powerGenWh).toBe(150);
      } else {
        expect(preset!.powerGenWh).toBe(0);
      }
    }
  });

  it("has an option in EQUIPMENT_TYPE_OPTIONS for every preset key plus 'custom'", () => {
    const optionValues = EQUIPMENT_TYPE_OPTIONS.map((o) => o.value).sort();
    const expectedValues: EquipmentType[] = [
      "custom",
      ...(Object.keys(EQUIPMENT_PRESETS) as EquipmentType[]),
    ].sort();
    expect(optionValues).toEqual(expectedValues);
  });
});

describe("applyEquipmentType", () => {
  it("overwrites capitalCost/subscriptionFeeMonthly/lifespanYears/powerGenWh for a named preset", () => {
    const result = applyEquipmentType(DEFAULT_CALCULATOR_INPUTS, "powerRack");
    expect(result.equipmentType).toBe("powerRack");
    expect(result.capitalCost).toBe(2500);
    expect(result.subscriptionFeeMonthly).toBe(0);
    expect(result.lifespanYears).toBe(15);
    expect(result.powerGenWh).toBe(0);
  });

  it("sets a nonzero powerGenWh for the elexercise-branded presets", () => {
    const bike = applyEquipmentType(DEFAULT_CALCULATOR_INPUTS, "stationaryBikeElexercise");
    expect(bike.capitalCost).toBe(1600);
    expect(bike.subscriptionFeeMonthly).toBe(0);
    expect(bike.lifespanYears).toBe(7);
    expect(bike.powerGenWh).toBe(150);

    const strength = applyEquipmentType(DEFAULT_CALCULATOR_INPUTS, "strengthTrainingElexercise");
    expect(strength.capitalCost).toBe(2000);
    expect(strength.subscriptionFeeMonthly).toBe(0);
    expect(strength.lifespanYears).toBe(7);
    expect(strength.powerGenWh).toBe(150);
  });

  it("overwrites even when the input was previously hand-customized", () => {
    const customized = {
      ...DEFAULT_CALCULATOR_INPUTS,
      capitalCost: 99999,
      lifespanYears: 1,
      powerGenWh: 999,
      customizeEconomics: true,
      customizeEnergy: true,
    };
    const result = applyEquipmentType(customized, "dumbbellFreeWeights");
    expect(result.capitalCost).toBe(400);
    expect(result.lifespanYears).toBe(10);
    expect(result.powerGenWh).toBe(0);
  });

  it("never overwrites anything when selecting 'custom'", () => {
    const customized = {
      ...DEFAULT_CALCULATOR_INPUTS,
      capitalCost: 12345,
      subscriptionFeeMonthly: 67,
      lifespanYears: 3,
      powerGenWh: 42,
    };
    const result = applyEquipmentType(customized, "custom");
    expect(result.equipmentType).toBe("custom");
    expect(result.capitalCost).toBe(12345);
    expect(result.subscriptionFeeMonthly).toBe(67);
    expect(result.lifespanYears).toBe(3);
    expect(result.powerGenWh).toBe(42);
  });

  it("leaves fields outside the preset (location, usage rate, electricity price) untouched", () => {
    const result = applyEquipmentType(DEFAULT_CALCULATOR_INPUTS, "powerRack");
    expect(result.location).toBe(DEFAULT_CALCULATOR_INPUTS.location);
    expect(result.usageRate).toBe(DEFAULT_CALCULATOR_INPUTS.usageRate);
    expect(result.electricityPricePerKwh).toBe(DEFAULT_CALCULATOR_INPUTS.electricityPricePerKwh);
  });
});
