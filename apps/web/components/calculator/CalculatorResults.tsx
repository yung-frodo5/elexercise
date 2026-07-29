import type { ReactNode } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { formatUsdPerWorkout, formatKwh, formatKg, formatGrams, formatPercent } from "../../lib/calculator";
import type { CalculatorResult } from "../../lib/calculator";

function ResultRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: theme.spacing.md,
        fontWeight: bold ? theme.typography.weight.bold : theme.typography.weight.regular,
      }}
    >
      <span>{label}</span>
      <span style={{ whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

function ResultSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 style={{ fontSize: theme.typography.size.lg, margin: 0, marginBottom: theme.spacing.sm }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xs }}>{children}</div>
    </section>
  );
}

export function CalculatorResults({ result }: { result: CalculatorResult }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xl, width: "100%" }}>
      <ResultSection title="Cost per workout">
        <ResultRow label="Exercise value" value={formatUsdPerWorkout(result.costPerWorkoutExercise)} />
        <ResultRow label="Electricity value" value={formatUsdPerWorkout(result.costPerWorkoutElectricity)} />
        <ResultRow label="Carbon value" value={formatUsdPerWorkout(result.costPerWorkoutCarbon)} />
        <ResultRow label="Total" value={formatUsdPerWorkout(result.totalCostPerWorkout)} bold />
      </ResultSection>

      <ResultSection title="Value ratios">
        <ResultRow label="Electricity vs. exercise" value={formatPercent(result.valueRatioElectricityToExercise)} />
        <ResultRow label="Carbon vs. exercise" value={formatPercent(result.valueRatioCarbonToExercise)} />
      </ResultSection>

      <ResultSection title="Lifetime impact">
        <ResultRow label="Electricity generated" value={formatKwh(result.electricityGeneratedLifetimeKwh)} />
        <ResultRow label="Carbon offset" value={formatKg(result.carbonOffsetLifetimeKg)} />
        <ResultRow label="Carbon offset per workout" value={formatGrams(result.carbonOffsetPerWorkoutGrams)} />
      </ResultSection>
    </div>
  );
}
