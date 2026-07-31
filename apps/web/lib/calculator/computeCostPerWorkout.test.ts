import { describe, it, expect } from "vitest";
import { annuityFactor, computeCostPerWorkout } from "./computeCostPerWorkout";
import { DEFAULT_CALCULATOR_INPUTS } from "./defaults";
import type { CalculatorInputs } from "./types";

describe("annuityFactor", () => {
  it("matches the spreadsheet's A(r,L) = (1-(1+r)^-L)/r formula", () => {
    expect(annuityFactor(0.07, 15)).toBeCloseTo(9.107914005, 6);
  });

  it("takes the limit A(0,L) = L rather than dividing by zero", () => {
    expect(annuityFactor(0, 8)).toBe(8);
  });
});

describe("computeCostPerWorkout", () => {
  it("matches hand-computed values at the default inputs (Stationary bike - basic + California)", () => {
    const result = computeCostPerWorkout(DEFAULT_CALCULATOR_INPUTS);
    expect(result.annuityFactor).toBeCloseTo(5.389289402, 6);
    expect(result.costPerWorkoutExercise).toBeCloseTo(1.427332459, 6);
    // Stationary bike - basic isn't elexercise-branded gear, so its powerGenWh default is 0 — every
    // electricity/carbon-derived figure below is correspondingly zero, not negative. toBeCloseTo (rather
    // than toBe) since `0 * -something` can produce a floating-point -0, which Object.is treats as
    // distinct from +0.
    expect(result.costPerWorkoutElectricity).toBeCloseTo(0, 6);
    expect(result.costPerWorkoutCarbon).toBeCloseTo(0, 6);
    expect(result.totalCostPerWorkout).toBeCloseTo(1.427332459, 6);
    expect(result.valueRatioElectricityToExercise).toBeCloseTo(0, 6);
    expect(result.valueRatioCarbonToExercise).toBeCloseTo(0, 6);
    expect(result.yearlyWorkouts).toBe(156);
    expect(result.electricityGeneratedLifetimeKwh).toBeCloseTo(0, 6);
    expect(result.carbonOffsetPerWorkoutGrams).toBeCloseTo(0, 6);
    expect(result.carbonOffsetLifetimeKg).toBeCloseTo(0, 6);
    expect(result.lifetimeElectricityValueUsd).toBeCloseTo(0, 6);
    expect(result.lifetimeCarbonValueUsd).toBeCloseTo(0, 6);
  });

  it("reproduces the spreadsheet's 'Rack + barbell + plates' row (capital=1800, sub=0, lifespan=15) across every usage rate", () => {
    const base: CalculatorInputs = {
      ...DEFAULT_CALCULATOR_INPUTS,
      capitalCost: 1800,
      subscriptionFeeMonthly: 0,
      lifespanYears: 15,
      discountFactor: 0.07,
    };
    const expected: Record<CalculatorInputs["usageRate"], number> = {
      sporadic: 3.800583163,
      regular: 1.266861054,
      committed: 0.760116633,
      shared: 0.253372211,
      public: 0.076011663,
    };
    for (const usageRate of Object.keys(expected) as CalculatorInputs["usageRate"][]) {
      const result = computeCostPerWorkout({ ...base, usageRate });
      expect(result.costPerWorkoutExercise).toBeCloseTo(expected[usageRate], 6);
    }
  });

  it("computes a zero-capital, pure-subscription scenario", () => {
    const result = computeCostPerWorkout({
      ...DEFAULT_CALCULATOR_INPUTS,
      capitalCost: 0,
      subscriptionFeeMonthly: 50,
      lifespanYears: 5,
      discountFactor: 0.05,
      usageRate: "committed",
    });
    expect(result.costPerWorkoutExercise).toBeCloseTo(2.307692308, 6);
  });

  it("uses the discount-factor-zero limit when computing cost per workout", () => {
    const result = computeCostPerWorkout({
      ...DEFAULT_CALCULATOR_INPUTS,
      capitalCost: 1000,
      subscriptionFeeMonthly: 0,
      lifespanYears: 8,
      discountFactor: 0,
      usageRate: "sporadic",
    });
    expect(result.annuityFactor).toBe(8);
    expect(result.costPerWorkoutExercise).toBeCloseTo(2.403846154, 6);
  });

  it("keeps electricity and carbon cost-per-workout negative (they represent savings/credits)", () => {
    // Defaults to 0 power generation now (see the elexercise-branding comment above) — use an
    // elexercise-branded preset's power generation to exercise the actual credit calculation.
    const result = computeCostPerWorkout({ ...DEFAULT_CALCULATOR_INPUTS, powerGenWh: 150 });
    expect(result.costPerWorkoutElectricity).toBeLessThan(0);
    expect(result.costPerWorkoutCarbon).toBeLessThan(0);
  });

  it("scales lifetime electricity and carbon offset with usage rate", () => {
    const sporadic = computeCostPerWorkout({ ...DEFAULT_CALCULATOR_INPUTS, powerGenWh: 150, usageRate: "sporadic" });
    const publicRate = computeCostPerWorkout({ ...DEFAULT_CALCULATOR_INPUTS, powerGenWh: 150, usageRate: "public" });
    expect(publicRate.electricityGeneratedLifetimeKwh).toBeGreaterThan(sporadic.electricityGeneratedLifetimeKwh);
    expect(publicRate.carbonOffsetLifetimeKg).toBeGreaterThan(sporadic.carbonOffsetLifetimeKg);
    // Carbon offset per workout doesn't depend on usage rate or lifespan.
    expect(publicRate.carbonOffsetPerWorkoutGrams).toBe(sporadic.carbonOffsetPerWorkoutGrams);
  });

  it("returns zero value ratios instead of Infinity/NaN when there's no equipment/subscription cost", () => {
    const freeAndSilent = computeCostPerWorkout({
      ...DEFAULT_CALCULATOR_INPUTS,
      capitalCost: 0,
      subscriptionFeeMonthly: 0,
      powerGenWh: 0,
    });
    expect(freeAndSilent.costPerWorkoutExercise).toBe(0);
    expect(freeAndSilent.valueRatioElectricityToExercise).toBe(0);
    expect(freeAndSilent.valueRatioCarbonToExercise).toBe(0);

    // Distinct from the case above: exercise cost is still 0, but a nonzero powerGenWh gives a nonzero
    // electricity/carbon credit — this exercises the guard clause (would otherwise divide by zero).
    const freeWithPower = computeCostPerWorkout({
      ...DEFAULT_CALCULATOR_INPUTS,
      capitalCost: 0,
      subscriptionFeeMonthly: 0,
      powerGenWh: 150,
    });
    expect(freeWithPower.costPerWorkoutExercise).toBe(0);
    expect(freeWithPower.costPerWorkoutElectricity).toBeLessThan(0);
    expect(freeWithPower.valueRatioElectricityToExercise).toBe(0);
    expect(freeWithPower.valueRatioCarbonToExercise).toBe(0);
  });
});
