import { describe, it, expect } from "vitest";
import { buildResultsCsv } from "./csv";
import { computeCostPerWorkout } from "./computeCostPerWorkout";
import { DEFAULT_CALCULATOR_INPUTS } from "./defaults";
import type { CalculatorColumn, CalculatorInputs } from "./types";

function equipment(name: string, overrides: Partial<CalculatorInputs> = {}): CalculatorColumn {
  return { id: name, name, inputs: { ...DEFAULT_CALCULATOR_INPUTS, ...overrides } };
}

function buildFor(items: CalculatorColumn[]): string {
  return buildResultsCsv(
    items,
    items.map((item) => computeCostPerWorkout(item.inputs)),
  );
}

describe("buildResultsCsv", () => {
  it("wraps and escapes equipment names containing commas, quotes, or newlines", () => {
    const csv = buildFor([equipment('Model, "V2"\nSpecial')]);
    expect(csv).toContain('"Model, ""V2""\nSpecial (baseline)"');
  });

  it.each(["=1+1", "+42", "-42", "@SUM(A1:A2)"])(
    "prefixes a leading %s with an apostrophe to neutralize CSV/formula injection",
    (name) => {
      const csv = buildFor([equipment(name)]);
      expect(csv).toContain(`'${name} (baseline)`);
    },
  );

  it("does not sanitize legitimately negative numeric values (e.g. Power generation)", () => {
    const csv = buildFor([equipment("Treadmill", { customizeEnergy: true, powerGenWh: -150 })]);
    const powerRow = csv.split("\n").find((line) => line.includes("Power generation"));
    // The label itself contains a comma ("(net, Wh/workout)"), so it's quoted -- but the numeric value
    // is untouched: no leading apostrophe defusing its "-", unlike a string field would get.
    expect(powerRow).toBe('"Power generation (net, Wh/workout)",-150');
  });

  it("keeps settings/result sections and rows in the documented order", () => {
    const lines = buildFor([equipment("Bike")]).split("\n");
    expect(lines[1]).toBe("Settings");
    expect(lines[2].startsWith("Equipment preset,")).toBe(true);
    expect(lines).toContain("Cost per workout");
    expect(lines).toContain("Value ratios");
    expect(lines).toContain("Lifetime impact");
    expect(lines.indexOf("Cost per workout")).toBeLessThan(lines.indexOf("Value ratios"));
    expect(lines.indexOf("Value ratios")).toBeLessThan(lines.indexOf("Lifetime impact"));
  });

  it("samples cost-over-time at every whole year up to each item's own lifespan, blank past it", () => {
    const items = [equipment("Short", { lifespanYears: 2 }), equipment("Long", { lifespanYears: 4 })];
    const lines = buildFor(items).split("\n");
    const yearRows = lines.slice(lines.indexOf("Cost over time") + 2);

    expect(yearRows).toHaveLength(5); // years 0..4 inclusive, sampled to the longer-lived item's lifespan
    expect(yearRows[0]!.split(",")[0]).toBe("0");
    expect(yearRows[4]!.split(",")[0]).toBe("4");

    const year3Fields = yearRows[3]!.split(",");
    expect(year3Fields[1]).toBe(""); // Short is past its own 2-year lifespan by year 3
    expect(year3Fields[2]).not.toBe(""); // Long is still within its 4-year lifespan
  });
});
