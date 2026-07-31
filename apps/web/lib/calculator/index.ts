export type { UsageRate, CalculatorInputs, CalculatorResult, CalculatorColumn, EquipmentType, LocationPreset } from "./types";
export { YEARLY_WORKOUTS, USAGE_RATE_OPTIONS } from "./usageRates";
export { DEFAULT_CALCULATOR_INPUTS, NAME_PLACEHOLDER } from "./defaults";
export { annuityFactor, computeCostPerWorkout } from "./computeCostPerWorkout";
export { formatUsdPerWorkout, formatKwh, formatKg, formatGrams, formatPercent } from "./format";
export type { EquipmentPresetValues } from "./equipmentPresets";
export { EQUIPMENT_PRESETS, EQUIPMENT_TYPE_OPTIONS, applyEquipmentType } from "./equipmentPresets";
export type { LocationPresetValues } from "./locationPresets";
export { LOCATION_PRESETS, LOCATION_OPTIONS, applyLocation } from "./locationPresets";
export type { EquipmentDraftField, EquipmentDraftFieldErrors } from "./validation";
export { validateEquipmentDraft } from "./validation";
export type { BreakEvenStatus, BreakEvenResult, CashFlowSeriesItem, CashFlowTimeSeriesPoint } from "./cashFlow";
export {
  cashFlowSlopePerWorkout,
  cumulativeCashCost,
  lifetimeWorkoutCount,
  cashFlowSlopePerYear,
  cumulativeCashCostAtYears,
  findBreakEven,
  buildCashFlowTimeSeries,
} from "./cashFlow";
export type { ResultMetric, ResultMetricSection } from "./resultMetrics";
export { RESULT_METRICS, RESULT_METRIC_SECTIONS } from "./resultMetrics";
export type { EquipmentSetting } from "./equipmentSettings";
export { EQUIPMENT_SETTINGS } from "./equipmentSettings";
