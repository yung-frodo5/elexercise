import type { CalculatorColumn } from "./types";

// Every field the Equipment Editor can show an inline error under.
export type EquipmentDraftField =
  | "name"
  | "capitalCost"
  | "subscriptionFeeMonthly"
  | "lifespanYears"
  | "powerGenWh"
  | "electricityPricePerKwh"
  | "discountFactor"
  | "carbonPricePerTon"
  | "gridCarbonIntensityGPerKwh";

export type EquipmentDraftFieldErrors = Partial<Record<EquipmentDraftField, string>>;

// Runs once, at Save time, against the full draft — replaces the old per-keystroke min-clamping that
// used to live in NumberField's onChange. Keyed by field so the Equipment Editor can render each message
// directly under the field it applies to, rather than in one generic list. `!(value >= constraint)`
// (rather than `value < constraint`) catches NaN (an emptied/invalid number field) in the same branch as
// an out-of-range value, so a blank field and a negative number get the same clear error instead of NaN
// silently reaching the formulas.
export function validateEquipmentDraft(draft: CalculatorColumn): EquipmentDraftFieldErrors {
  const errors: EquipmentDraftFieldErrors = {};
  if (draft.name.trim() === "") errors.name = "Name is required.";

  const { inputs } = draft;
  if (!(inputs.capitalCost >= 0)) errors.capitalCost = "Capital cost must be zero or greater.";
  if (!(inputs.subscriptionFeeMonthly >= 0)) errors.subscriptionFeeMonthly = "Subscription fee must be zero or greater.";
  if (!(inputs.lifespanYears >= 1)) errors.lifespanYears = "Lifespan must be at least 1 year.";
  if (!(inputs.powerGenWh >= 0)) errors.powerGenWh = "Power generation must be zero or greater.";
  if (!(inputs.electricityPricePerKwh >= 0)) errors.electricityPricePerKwh = "Electricity price must be zero or greater.";
  if (!(inputs.discountFactor >= 0)) errors.discountFactor = "Discount factor must be zero or greater.";
  if (!(inputs.carbonPricePerTon >= 0)) errors.carbonPricePerTon = "Carbon price must be zero or greater.";
  if (!(inputs.gridCarbonIntensityGPerKwh >= 0)) errors.gridCarbonIntensityGPerKwh = "Grid carbon intensity must be zero or greater.";

  return errors;
}
