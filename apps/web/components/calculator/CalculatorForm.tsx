"use client";

import type { CSSProperties, ReactNode } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { USAGE_RATE_OPTIONS } from "../../lib/calculator";
import type { CalculatorInputs, UsageRate } from "../../lib/calculator";

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.xs,
  fontSize: theme.typography.size.sm,
  color: theme.colors.textPrimary,
};

const inputStyle: CSSProperties = {
  padding: theme.spacing.xs,
  border: `1px solid ${theme.colors.border}`,
  fontSize: theme.typography.size.md,
  width: "100%",
  boxSizing: "border-box",
};

function FieldNote({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontSize: theme.typography.size.xs,
        color: theme.colors.textMuted,
        margin: 0,
        // Grows faster than the field next to it, so extra horizontal space
        // goes to the descriptive text rather than the (fixed-content) input.
        flex: "3 1 200px",
        minWidth: 0,
      }}
    >
      {children}
    </p>
  );
}

function FieldWithNote({ field, note }: { field: ReactNode; note: ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.lg, alignItems: "center" }}>
      <div style={{ flex: "1 1 160px", minWidth: 0 }}>{field}</div>
      <FieldNote>{note}</FieldNote>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label style={labelStyle}>
      {label}
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        style={inputStyle}
      />
    </label>
  );
}

export function CalculatorForm({
  inputs,
  onChange,
}: {
  inputs: CalculatorInputs;
  onChange: (patch: Partial<CalculatorInputs>) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md, width: "100%" }}>
      <NumberField
        label="Capital cost ($)"
        value={inputs.capitalCost}
        min={0}
        onChange={(capitalCost) => onChange({ capitalCost })}
      />
      <NumberField
        label="Subscription fee ($/month)"
        value={inputs.subscriptionFeeMonthly}
        min={0}
        onChange={(subscriptionFeeMonthly) => onChange({ subscriptionFeeMonthly })}
      />
      <NumberField
        label="Lifespan (years)"
        value={inputs.lifespanYears}
        min={1}
        onChange={(lifespanYears) => onChange({ lifespanYears })}
      />

      <label style={labelStyle}>
        Usage rate
        <select
          value={inputs.usageRate}
          onChange={(e) => onChange({ usageRate: e.target.value as UsageRate })}
          style={inputStyle}
        >
          {USAGE_RATE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <p style={{ fontWeight: theme.typography.weight.bold, margin: 0, marginTop: theme.spacing.sm }}>
        Basic parameters
      </p>
      <NumberField
        label="Power generation per workout (Wh)"
        value={inputs.powerGenWh}
        min={0}
        onChange={(powerGenWh) => onChange({ powerGenWh })}
      />
      <NumberField
        label="Electricity price ($/kWh)"
        value={inputs.electricityPricePerKwh}
        min={0}
        step={0.01}
        onChange={(electricityPricePerKwh) => onChange({ electricityPricePerKwh })}
      />
      <NumberField
        label="Annualized discount factor (%)"
        value={Math.round(inputs.discountFactor * 1000) / 10}
        min={0}
        step={0.1}
        onChange={(percent) => onChange({ discountFactor: percent / 100 })}
      />

      <details>
        <summary style={{ fontWeight: theme.typography.weight.bold, cursor: "pointer" }}>
          Advanced parameters
        </summary>
        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md, marginTop: theme.spacing.sm }}>
          <FieldWithNote
            field={
              <NumberField
                label="Carbon price ($/ton CO2e)"
                value={inputs.carbonPricePerTon}
                min={0}
                onChange={(carbonPricePerTon) => onChange({ carbonPricePerTon })}
              />
            }
            note={
              <>
                Carbon prices help place an explicit value on carbon emissions, for making tradeoff decisions. For
                reference: Stanford&rsquo;s internal carbon price is $40/ton CO2e; a value of $300/ton CO2e has been
                suggested to accurately represent social costs.
              </>
            }
          />
          <FieldWithNote
            field={
              <NumberField
                label="Grid carbon intensity (gCO2e/kWh)"
                value={inputs.gridCarbonIntensityGPerKwh}
                min={0}
                onChange={(gridCarbonIntensityGPerKwh) => onChange({ gridCarbonIntensityGPerKwh })}
              />
            }
            note={
              <>
                Grid carbon intensity varies by time of day, season, regional grid makeup, and more. For reference (
                <a
                  href="https://www.epa.gov/egrid/summary-data"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: theme.colors.textMuted }}
                >
                  eGRID
                </a>
                ): CAMX (California) is 195 gCO2e/kWh; HIOA (Hawaii) is 680 gCO2e/kWh.
              </>
            }
          />
        </div>
      </details>
    </div>
  );
}
