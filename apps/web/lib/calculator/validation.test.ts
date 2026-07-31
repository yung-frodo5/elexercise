import { describe, it, expect } from "vitest";
import { validateEquipmentDraft } from "./validation";
import { DEFAULT_CALCULATOR_INPUTS } from "./defaults";
import type { CalculatorColumn } from "./types";

function draft(overrides: Partial<CalculatorColumn> = {}): CalculatorColumn {
  return { id: "eq-0", name: "Bike", inputs: { ...DEFAULT_CALCULATOR_INPUTS }, ...overrides };
}

describe("validateEquipmentDraft", () => {
  it("returns no errors for a fully valid draft", () => {
    expect(validateEquipmentDraft(draft())).toEqual({});
  });

  it("requires a non-empty name, keyed under 'name'", () => {
    expect(validateEquipmentDraft(draft({ name: "" })).name).toBe("Name is required.");
    expect(validateEquipmentDraft(draft({ name: "   " })).name).toBe("Name is required.");
  });

  it("rejects a negative capital cost, keyed under 'capitalCost'", () => {
    const errors = validateEquipmentDraft(draft({ inputs: { ...DEFAULT_CALCULATOR_INPUTS, capitalCost: -1 } }));
    expect(errors.capitalCost).toBe("Capital cost must be zero or greater.");
  });

  it("accepts a zero capital cost (blank-field equivalent, Number('') === 0)", () => {
    const errors = validateEquipmentDraft(draft({ inputs: { ...DEFAULT_CALCULATOR_INPUTS, capitalCost: 0 } }));
    expect(errors.capitalCost).toBeUndefined();
  });

  it("rejects a lifespan of zero, keyed under 'lifespanYears' — the motivating case for moving validation to Save time", () => {
    const errors = validateEquipmentDraft(draft({ inputs: { ...DEFAULT_CALCULATOR_INPUTS, lifespanYears: 0 } }));
    expect(errors.lifespanYears).toBe("Lifespan must be at least 1 year.");
  });

  it("accepts a lifespan of exactly 1", () => {
    const errors = validateEquipmentDraft(draft({ inputs: { ...DEFAULT_CALCULATOR_INPUTS, lifespanYears: 1 } }));
    expect(errors.lifespanYears).toBeUndefined();
  });

  it("treats NaN the same as an out-of-range value", () => {
    const errors = validateEquipmentDraft(draft({ inputs: { ...DEFAULT_CALCULATOR_INPUTS, lifespanYears: NaN } }));
    expect(errors.lifespanYears).toBe("Lifespan must be at least 1 year.");
  });

  it("rejects negative subscription fee, power generation, electricity price, discount factor, carbon price, and grid carbon intensity, each keyed under its own field", () => {
    const errors = validateEquipmentDraft(
      draft({
        inputs: {
          ...DEFAULT_CALCULATOR_INPUTS,
          subscriptionFeeMonthly: -1,
          powerGenWh: -1,
          electricityPricePerKwh: -1,
          discountFactor: -1,
          carbonPricePerTon: -1,
          gridCarbonIntensityGPerKwh: -1,
        },
      }),
    );
    expect(errors).toEqual({
      subscriptionFeeMonthly: "Subscription fee must be zero or greater.",
      powerGenWh: "Power generation must be zero or greater.",
      electricityPricePerKwh: "Electricity price must be zero or greater.",
      discountFactor: "Discount factor must be zero or greater.",
      carbonPricePerTon: "Carbon price must be zero or greater.",
      gridCarbonIntensityGPerKwh: "Grid carbon intensity must be zero or greater.",
    });
  });
});
