import { describe, it, expect } from "vitest";
import {
  buildCashFlowTimeSeries,
  cashFlowSlopePerWorkout,
  cumulativeCashCost,
  cumulativeCashCostAtYears,
  findBreakEven,
  lifetimeWorkoutCount,
} from "./cashFlow";
import { computeCostPerWorkout } from "./computeCostPerWorkout";
import { DEFAULT_CALCULATOR_INPUTS } from "./defaults";
import type { CalculatorInputs } from "./types";

function point(inputs: Partial<CalculatorInputs>) {
  const merged: CalculatorInputs = { ...DEFAULT_CALCULATOR_INPUTS, ...inputs };
  return { inputs: merged, result: computeCostPerWorkout(merged) };
}

describe("cashFlowSlopePerWorkout / cumulativeCashCost", () => {
  it("with no subscription, the slope is just the (negative) per-workout energy credit", () => {
    const { inputs, result } = point({ subscriptionFeeMonthly: 0 });
    expect(cashFlowSlopePerWorkout(inputs, result)).toBeCloseTo(
      result.costPerWorkoutElectricity + result.costPerWorkoutCarbon,
      10,
    );
  });

  it("includes the annualized-then-per-workout subscription fee in the slope", () => {
    const { inputs, result } = point({ subscriptionFeeMonthly: 50, usageRate: "regular" });
    const expectedSlope =
      (50 * 12) / result.yearlyWorkouts + result.costPerWorkoutElectricity + result.costPerWorkoutCarbon;
    expect(cashFlowSlopePerWorkout(inputs, result)).toBeCloseTo(expectedSlope, 10);
  });

  it("cumulativeCashCost(0) is exactly the capital cost", () => {
    const { inputs, result } = point({ capitalCost: 1234 });
    expect(cumulativeCashCost(inputs, result, 0)).toBe(1234);
  });

  it("is affine in workout count — value at N equals value at 0 plus twice the increment to N/2", () => {
    const { inputs, result } = point({ capitalCost: 900, subscriptionFeeMonthly: 20 });
    const at0 = cumulativeCashCost(inputs, result, 0);
    const atHalf = cumulativeCashCost(inputs, result, 50);
    const atFull = cumulativeCashCost(inputs, result, 100);
    expect(atFull - at0).toBeCloseTo(2 * (atHalf - at0), 10);
  });

  it("lifetimeWorkoutCount multiplies lifespan by yearly workouts", () => {
    const { inputs, result } = point({ lifespanYears: 10, usageRate: "committed" });
    expect(lifetimeWorkoutCount(inputs, result)).toBe(10 * result.yearlyWorkouts);
  });
});

describe("findBreakEven", () => {
  it("finds a crossing when a cheaper-upfront, higher-recurring-cost baseline is eventually overtaken", () => {
    // Baseline: no capital cost, but a subscription (positive slope). Other: capital cost, no subscription
    // (much flatter/negative slope from energy credits alone) — the lines must cross exactly once.
    const baseline = point({ capitalCost: 0, subscriptionFeeMonthly: 20, lifespanYears: 20, usageRate: "regular" });
    const other = point({ capitalCost: 500, subscriptionFeeMonthly: 0, lifespanYears: 20, usageRate: "regular" });
    const result = findBreakEven(baseline, other);
    expect(result.status).toBe("found");
    expect(result.workoutCount).not.toBeNull();
    const n = result.workoutCount!;
    expect(cumulativeCashCost(baseline.inputs, baseline.result, n)).toBeCloseTo(
      cumulativeCashCost(other.inputs, other.result, n),
      6,
    );
  });

  it("reports alwaysEqual for identical inputs", () => {
    const a = point({ capitalCost: 800 });
    const b = point({ capitalCost: 800 });
    const result = findBreakEven(a, b);
    expect(result.status).toBe("alwaysEqual");
    expect(result.workoutCount).toBe(0);
  });

  it("reports neverWithinHorizon for equal slopes but different capital cost (parallel lines)", () => {
    const a = point({ capitalCost: 500, subscriptionFeeMonthly: 10 });
    const b = point({ capitalCost: 900, subscriptionFeeMonthly: 10 });
    const result = findBreakEven(a, b);
    expect(result.status).toBe("neverWithinHorizon");
    expect(result.workoutCount).toBeNull();
  });

  it("reports neverWithinHorizon when the algebraic crossing point is negative", () => {
    // Other is cheaper both upfront and per-workout — no future crossing exists.
    const baseline = point({ capitalCost: 900, subscriptionFeeMonthly: 20 });
    const other = point({ capitalCost: 500, subscriptionFeeMonthly: 5 });
    const result = findBreakEven(baseline, other);
    expect(result.status).toBe("neverWithinHorizon");
    expect(result.workoutCount).toBeNull();
  });

  it("reports neverWithinHorizon when the crossing point exists but exceeds the shorter lifespan", () => {
    const baseline = point({ capitalCost: 0, subscriptionFeeMonthly: 1, lifespanYears: 1, usageRate: "sporadic" });
    const other = point({ capitalCost: 100000, subscriptionFeeMonthly: 0, lifespanYears: 1, usageRate: "sporadic" });
    const result = findBreakEven(baseline, other);
    expect(result.status).toBe("neverWithinHorizon");
  });
});

describe("buildCashFlowTimeSeries", () => {
  it("returns an empty array for no items", () => {
    expect(buildCashFlowTimeSeries([])).toEqual([]);
  });

  it("includes a breakpoint at 0 and at each item's own lifespanYears, matching cumulativeCashCostAtYears", () => {
    const a = point({ capitalCost: 500, lifespanYears: 5, usageRate: "regular" });
    const b = point({ capitalCost: 900, lifespanYears: 3, usageRate: "committed" });
    const series = buildCashFlowTimeSeries([
      { id: "a", inputs: a.inputs, result: a.result },
      { id: "b", inputs: b.inputs, result: b.result },
    ]);

    expect(series[0]!.years).toBe(0);
    for (const p of series) {
      if (p.years <= a.inputs.lifespanYears) {
        expect(p.a).toBeCloseTo(cumulativeCashCostAtYears(a.inputs, a.result, p.years), 6);
      } else {
        expect(p.a).toBeUndefined();
      }
      if (p.years <= b.inputs.lifespanYears) {
        expect(p.b).toBeCloseTo(cumulativeCashCostAtYears(b.inputs, b.result, p.years), 6);
      } else {
        expect(p.b).toBeUndefined();
      }
    }
  });

  it("is consistent with the per-workout model at years = lifespanYears (i.e. the full lifetime cash cost)", () => {
    const a = point({ capitalCost: 700, lifespanYears: 4, usageRate: "shared" });
    const series = buildCashFlowTimeSeries([{ id: "a", inputs: a.inputs, result: a.result }]);
    const lastPoint = series[series.length - 1]!;
    expect(lastPoint.years).toBe(4);
    expect(lastPoint.a).toBeCloseTo(cumulativeCashCost(a.inputs, a.result, lifetimeWorkoutCount(a.inputs, a.result)), 6);
  });
});
