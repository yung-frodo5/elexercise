import { EQUIPMENT_TYPE_OPTIONS } from "./equipmentPresets";
import { LOCATION_OPTIONS } from "./locationPresets";
import { USAGE_RATE_OPTIONS } from "./usageRates";
import { cumulativeCashCostAtYears } from "./cashFlow";
import type { CalculatorColumn, CalculatorInputs, CalculatorResult } from "./types";
import type { ResultMetricSection } from "./resultMetrics";
import { RESULT_METRIC_SECTIONS } from "./resultMetrics";

function optionLabel<T extends string>(options: { value: T; label: string }[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

interface CsvSettingsRow {
  label: string;
  value: (inputs: CalculatorInputs) => string | number;
}

// Parallel to EQUIPMENT_SETTINGS (equipmentSettings.ts), but for CSV export raw numbers are wanted instead
// of display-formatted strings (per explicit request) — units move into the label instead (e.g. "Capital
// cost ($)") rather than being baked into a formatted value string. Categorical rows (preset/usage
// rate/location) have no numeric unit to extract, so they keep their descriptive text label as-is.
const CSV_SETTINGS_ROWS: CsvSettingsRow[] = [
  {
    label: "Equipment preset",
    value: (inputs) => (inputs.customizeEconomics ? "Custom" : optionLabel(EQUIPMENT_TYPE_OPTIONS, inputs.equipmentType)),
  },
  { label: "Usage rate", value: (inputs) => optionLabel(USAGE_RATE_OPTIONS, inputs.usageRate) },
  { label: "Lifespan (years)", value: (inputs) => inputs.lifespanYears },
  { label: "Capital cost ($)", value: (inputs) => inputs.capitalCost },
  { label: "Subscription fee ($/month)", value: (inputs) => inputs.subscriptionFeeMonthly },
  { label: "Discount factor (%)", value: (inputs) => inputs.discountFactor * 100 },
  {
    label: "Location",
    value: (inputs) => (inputs.customizeEnergy ? "Custom" : optionLabel(LOCATION_OPTIONS, inputs.location)),
  },
  { label: "Power generation (net, Wh/workout)", value: (inputs) => inputs.powerGenWh },
  { label: "Electricity price ($/kWh)", value: (inputs) => inputs.electricityPricePerKwh },
  { label: "Carbon price ($/ton CO2e)", value: (inputs) => inputs.carbonPricePerTon },
  { label: "Grid carbon intensity (gCO2e/kWh)", value: (inputs) => inputs.gridCarbonIntensityGPerKwh },
];

interface CsvResultRow {
  section: ResultMetricSection;
  label: string;
  value: (result: CalculatorResult) => number;
}

// Parallel to RESULT_METRICS (resultMetrics.ts) — same rows/grouping, raw numbers with unit-suffixed
// labels instead of formatted strings. Percent-based results are exported as 0-100 (matching formatPercent's
// own *100 convention) rather than the raw 0-1 fraction, so the unit suffix in the label stays accurate.
const CSV_RESULT_ROWS: CsvResultRow[] = [
  { section: "Cost per workout", label: "Exercise cost ($/workout)", value: (r) => r.costPerWorkoutExercise },
  { section: "Cost per workout", label: "Electricity cost ($/workout)", value: (r) => r.costPerWorkoutElectricity },
  { section: "Cost per workout", label: "Carbon cost ($/workout)", value: (r) => r.costPerWorkoutCarbon },
  { section: "Cost per workout", label: "Total ($/workout)", value: (r) => r.totalCostPerWorkout },
  { section: "Value ratios", label: "Electricity vs. exercise (%)", value: (r) => r.valueRatioElectricityToExercise * 100 },
  { section: "Value ratios", label: "Carbon vs. exercise (%)", value: (r) => r.valueRatioCarbonToExercise * 100 },
  { section: "Lifetime impact", label: "Electricity generated (net, kWh)", value: (r) => r.electricityGeneratedLifetimeKwh },
  { section: "Lifetime impact", label: "Electricity cost ($)", value: (r) => r.lifetimeElectricityValueUsd },
  { section: "Lifetime impact", label: "Carbon offset (net, kg CO2e)", value: (r) => r.carbonOffsetLifetimeKg },
  { section: "Lifetime impact", label: "Carbon offset per workout (net, g CO2e)", value: (r) => r.carbonOffsetPerWorkoutGrams },
  { section: "Lifetime impact", label: "Carbon cost ($)", value: (r) => r.lifetimeCarbonValueUsd },
];

// A field starting with =, +, -, @, tab, or CR is interpreted as a formula by Excel/Sheets when the CSV
// is opened — equipment names are free text, so without this a name like `=HYPERLINK(...)` would let
// someone execute a formula (or exfiltrate data) on whoever later opens the exported file. A leading
// apostrophe forces text interpretation without changing the visible content. Only applied to strings —
// never to numbers, since several numeric columns (e.g. Power generation, per-workout costs) can be
// legitimately negative and a leading "-" there is just a minus sign, not a formula trigger.
const CSV_FORMULA_TRIGGER = /^[=+\-@\t\r]/;

// Wraps in quotes (doubling any embedded quotes) whenever the field contains a comma, quote, or newline —
// equipment names are free text and can contain any of those.
function csvField(value: string | number): string {
  if (typeof value === "number") return String(value);
  const text = CSV_FORMULA_TRIGGER.test(value) ? `'${value}` : value;
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function csvRow(fields: (string | number)[]): string {
  return fields.map(csvField).join(",");
}

export function buildResultsCsv(equipment: CalculatorColumn[], results: CalculatorResult[]): string {
  const lines: string[] = [];

  lines.push(csvRow(["", ...equipment.map((item, i) => item.name + (i === 0 ? " (baseline)" : ""))]));

  lines.push(csvRow(["Settings"]));
  for (const setting of CSV_SETTINGS_ROWS) {
    lines.push(csvRow([setting.label, ...equipment.map((item) => setting.value(item.inputs))]));
  }

  for (const section of RESULT_METRIC_SECTIONS) {
    lines.push("");
    lines.push(csvRow([section]));
    for (const row of CSV_RESULT_ROWS.filter((r) => r.section === section)) {
      lines.push(csvRow([row.label, ...results.map((result) => row.value(result))]));
    }
  }

  // Same underlying data as CashFlowChart's "Cost over time" plot, but sampled at every whole year
  // (rather than just the 0/lifespan breakpoints the chart itself uses) since a spreadsheet user
  // recreating this plot wants a row per point, not two points and an implied straight line. Blank once an
  // item is past its own lifespanYears, matching the chart's connectNulls={false} (lines stop rather than
  // extrapolate).
  const maxLifespanYears = Math.max(0, ...equipment.map((item) => item.inputs.lifespanYears));
  lines.push("");
  lines.push(csvRow(["Cost over time"]));
  lines.push(csvRow(["Year", ...equipment.map((item, i) => item.name + (i === 0 ? " (baseline)" : ""))]));
  for (let year = 0; year <= Math.ceil(maxLifespanYears); year++) {
    lines.push(
      csvRow([
        year,
        ...equipment.map((item, i) =>
          year <= item.inputs.lifespanYears ? cumulativeCashCostAtYears(item.inputs, results[i]!, year) : "",
        ),
      ]),
    );
  }

  return lines.join("\n");
}
