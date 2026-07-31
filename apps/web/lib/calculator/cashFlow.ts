import type { CalculatorInputs, CalculatorResult } from "./types";

// Cumulative cash cost is exactly affine (a straight line) in workout count N: capitalCost is a constant
// intercept paid upfront, and everything else (subscription, electricity, carbon) is proportional to N.
// Two equipment's cost lines therefore cross at most once — break-even is closed-form algebra below, not
// a numeric search.
export function cashFlowSlopePerWorkout(inputs: CalculatorInputs, result: CalculatorResult): number {
  return (
    (inputs.subscriptionFeeMonthly * 12) / result.yearlyWorkouts +
    result.costPerWorkoutElectricity +
    result.costPerWorkoutCarbon
  );
}

export function cumulativeCashCost(inputs: CalculatorInputs, result: CalculatorResult, workoutCount: number): number {
  return inputs.capitalCost + cashFlowSlopePerWorkout(inputs, result) * workoutCount;
}

export function lifetimeWorkoutCount(inputs: CalculatorInputs, result: CalculatorResult): number {
  return inputs.lifespanYears * result.yearlyWorkouts;
}

// Same affine line, rescaled to elapsed calendar time instead of workout count (workoutCount = years *
// yearlyWorkouts), for the cost-over-time chart's time-based x-axis.
export function cashFlowSlopePerYear(inputs: CalculatorInputs, result: CalculatorResult): number {
  return cashFlowSlopePerWorkout(inputs, result) * result.yearlyWorkouts;
}

export function cumulativeCashCostAtYears(inputs: CalculatorInputs, result: CalculatorResult, years: number): number {
  return inputs.capitalCost + cashFlowSlopePerYear(inputs, result) * years;
}

export type BreakEvenStatus = "found" | "neverWithinHorizon" | "alwaysEqual";

export interface BreakEvenResult {
  workoutCount: number | null;
  horizonWorkoutCount: number;
  status: BreakEvenStatus;
}

interface EquipmentPoint {
  inputs: CalculatorInputs;
  result: CalculatorResult;
}

// horizon = min(each item's own lifetimeWorkoutCount) — each item's own usage-rate-implied lifetime,
// even though the two items' usage rates (and thus elapsed calendar time per N) may differ.
export function findBreakEven(baseline: EquipmentPoint, other: EquipmentPoint): BreakEvenResult {
  const horizonWorkoutCount = Math.min(
    lifetimeWorkoutCount(baseline.inputs, baseline.result),
    lifetimeWorkoutCount(other.inputs, other.result),
  );
  const slopeBaseline = cashFlowSlopePerWorkout(baseline.inputs, baseline.result);
  const slopeOther = cashFlowSlopePerWorkout(other.inputs, other.result);

  if (slopeBaseline === slopeOther) {
    return baseline.inputs.capitalCost === other.inputs.capitalCost
      ? { workoutCount: 0, horizonWorkoutCount, status: "alwaysEqual" }
      : { workoutCount: null, horizonWorkoutCount, status: "neverWithinHorizon" };
  }

  const crossingWorkoutCount =
    (other.inputs.capitalCost - baseline.inputs.capitalCost) / (slopeBaseline - slopeOther);

  if (crossingWorkoutCount < 0 || crossingWorkoutCount > horizonWorkoutCount) {
    return { workoutCount: null, horizonWorkoutCount, status: "neverWithinHorizon" };
  }
  return { workoutCount: crossingWorkoutCount, horizonWorkoutCount, status: "found" };
}

export interface CashFlowSeriesItem {
  id: string;
  inputs: CalculatorInputs;
  result: CalculatorResult;
}

export type CashFlowTimeSeriesPoint = { years: number } & Record<string, number>;

// Breakpoints only (0 and each item's own lifespanYears) — no dense sampling needed since every line is
// exactly straight, so a straight segment between two breakpoints is already exactly correct, including
// wherever it visually crosses another item's line. An item's key is omitted at any breakpoint past its
// own lifespanYears, so recharts simply stops drawing that line once the equipment is past its modeled
// lifespan, rather than extrapolating.
export function buildCashFlowTimeSeries(items: CashFlowSeriesItem[]): CashFlowTimeSeriesPoint[] {
  if (items.length === 0) return [];

  const breakpoints = new Set<number>([0, ...items.map((item) => item.inputs.lifespanYears)]);

  return [...breakpoints]
    .sort((a, b) => a - b)
    .map((years) => {
      const point: CashFlowTimeSeriesPoint = { years };
      for (const item of items) {
        if (years <= item.inputs.lifespanYears) {
          point[item.id] = cumulativeCashCostAtYears(item.inputs, item.result, years);
        }
      }
      return point;
    });
}
