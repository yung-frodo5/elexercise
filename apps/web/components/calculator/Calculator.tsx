"use client";

import { useMemo, useState } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { CalculatorForm } from "./CalculatorForm";
import { CalculatorResults } from "./CalculatorResults";
import { DEFAULT_CALCULATOR_INPUTS, computeCostPerWorkout } from "../../lib/calculator";
import type { CalculatorInputs } from "../../lib/calculator";

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_CALCULATOR_INPUTS);
  const result = useMemo(() => computeCostPerWorkout(inputs), [inputs]);

  function patchInputs(patch: Partial<CalculatorInputs>) {
    setInputs((prev) => ({ ...prev, ...patch }));
  }

  return (
    <div style={{ display: "flex", gap: theme.spacing.xxl, flexWrap: "wrap", width: "100%" }}>
      <div style={{ flex: "1 1 320px", minWidth: 0 }}>
        <h2 style={{ textAlign: "center", marginTop: 0, textDecoration: "underline" }}>Inputs</h2>
        <CalculatorForm inputs={inputs} onChange={patchInputs} />
      </div>
      <div
        style={{
          flex: "1 1 280px",
          minWidth: 0,
          backgroundColor: "#D6E9FF",
          borderRadius: theme.radii.lg,
          padding: theme.spacing.xl,
          color: theme.colors.navy,
        }}
      >
        <h2 style={{ textAlign: "center", marginTop: 0, textDecoration: "underline" }}>Outputs</h2>
        <CalculatorResults result={result} />
      </div>
    </div>
  );
}
