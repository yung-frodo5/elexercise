"use client";

import type { ReactNode } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import {
  applyEquipmentType,
  applyLocation,
  EQUIPMENT_TYPE_OPTIONS,
  formatPowerGenWh,
  isElexerciseEquipmentType,
  LOCATION_OPTIONS,
  NAME_PLACEHOLDER,
  USAGE_RATE_OPTIONS,
} from "../../lib/calculator";
import type {
  CalculatorColumn,
  CalculatorInputs,
  EquipmentDraftFieldErrors,
  EquipmentType,
  LocationPreset,
  UsageRate,
} from "../../lib/calculator";
import { ExternalLink } from "../ui/ExternalLink";
import { FieldWithNote, NumberField, RadioOption, SelectField, TextField } from "./formFields";

function CategoryHeading({ children }: { children: string }) {
  return (
    <p style={{ fontWeight: theme.typography.weight.bold, margin: 0, marginTop: theme.spacing.sm, color: theme.colors.navy }}>
      {children}
    </p>
  );
}

function PresetCaption({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: theme.typography.size.xs, color: theme.colors.navy, margin: 0, opacity: 0.75 }}>
      {children}
    </p>
  );
}

function RadioRow({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xs }}>{children}</div>;
}

// Native <option> elements can't reliably take color/bold styling across browsers (same reason
// InfoTooltip in formFields.tsx rolls its own tooltip instead of relying on the browser's) -- a plain-text
// ⚡ prefix is the one way to make the elexercise-branded presets stand out while still scanning the closed
// dropdown's options list, ahead of picking one (BrandedEquipmentLabel's icon+bold-green only shows up
// once a preset is already selected).
const EQUIPMENT_TYPE_OPTIONS_WITH_BRAND_MARKER = EQUIPMENT_TYPE_OPTIONS.map((option) => ({
  ...option,
  label: isElexerciseEquipmentType(option.value) ? `⚡ ${option.label}` : option.label,
}));

// Fully controlled — no state of its own. Calculator.tsx owns the draft, the dirty-check against a
// snapshot, and the discard-confirmation; this component just renders `draft` and calls `onChange`/`onSave`.
export function EquipmentEditor({
  draft,
  onChange,
  onSave,
  errors,
}: {
  draft: CalculatorColumn;
  onChange: (patch: Partial<CalculatorColumn>) => void;
  onSave: () => void;
  errors: EquipmentDraftFieldErrors;
}) {
  const { inputs } = draft;

  function patchInputs(patch: Partial<CalculatorInputs>) {
    onChange({ inputs: { ...inputs, ...patch } });
  }

  // "Use equipment preset" / "Specify custom economics" (and the Energy equivalent) are mutually
  // exclusive — exactly one is ever true. If a hidden field somehow has an error (e.g. the user specified
  // custom economics with an invalid Lifespan, then switched back to "Use equipment preset" without fixing
  // it), force the custom side open so the error has somewhere to render, rather than leaving it invisible.
  const hasHiddenEconomicsError = Boolean(
    errors.lifespanYears ||
      errors.powerGenWh ||
      errors.capitalCost ||
      errors.subscriptionFeeMonthly ||
      errors.discountFactor,
  );
  const hasHiddenEnergyError = Boolean(
    errors.electricityPricePerKwh || errors.carbonPricePerTon || errors.gridCarbonIntensityGPerKwh,
  );
  const showCustomEconomics = inputs.customizeEconomics || hasHiddenEconomicsError;
  const showCustomEnergy = inputs.customizeEnergy || hasHiddenEnergyError;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md, width: "100%" }}>
      <TextField
        label="Name (required)"
        value={draft.name}
        placeholder={NAME_PLACEHOLDER}
        onChange={(name) => onChange({ name })}
        error={errors.name}
      />

      <CategoryHeading>Exercise</CategoryHeading>
      <RadioRow>
        <RadioOption
          name="economics-mode"
          label="Use equipment preset"
          checked={!showCustomEconomics}
          onChange={() => patchInputs({ customizeEconomics: false })}
        />
        <RadioOption
          name="economics-mode"
          label="Specify custom economics"
          checked={showCustomEconomics}
          onChange={() => patchInputs({ customizeEconomics: true })}
        />
      </RadioRow>
      <SelectField<EquipmentType>
        label="Equipment preset"
        value={inputs.equipmentType}
        options={EQUIPMENT_TYPE_OPTIONS_WITH_BRAND_MARKER}
        onChange={(equipmentType) => patchInputs(applyEquipmentType(inputs, equipmentType))}
        tooltip="Changing this resets Capital cost, Subscription fee, Lifespan, and Power generation below."
        disabled={showCustomEconomics}
      />
      <SelectField<UsageRate>
        label="Usage rate"
        value={inputs.usageRate}
        options={USAGE_RATE_OPTIONS}
        onChange={(usageRate) => patchInputs({ usageRate })}
      />
      {showCustomEconomics && (
        <>
          <NumberField
            label="Lifespan (years)"
            value={inputs.lifespanYears}
            min={1}
            onChange={(lifespanYears) => patchInputs({ lifespanYears })}
            error={errors.lifespanYears}
          />
          <NumberField
            label="Power generation per workout (Wh)"
            value={inputs.powerGenWh}
            min={0}
            onChange={(powerGenWh) => patchInputs({ powerGenWh })}
            error={errors.powerGenWh}
          />
        </>
      )}

      <CategoryHeading>Cost</CategoryHeading>
      {showCustomEconomics ? (
        <>
          <NumberField
            label="Capital cost ($)"
            value={inputs.capitalCost}
            min={0}
            onChange={(capitalCost) => patchInputs({ capitalCost })}
            error={errors.capitalCost}
          />
          <NumberField
            label="Subscription fee ($/month)"
            value={inputs.subscriptionFeeMonthly}
            min={0}
            onChange={(subscriptionFeeMonthly) => patchInputs({ subscriptionFeeMonthly })}
            error={errors.subscriptionFeeMonthly}
          />
          <NumberField
            label={`Annualized discount factor: ${Math.round(inputs.discountFactor * 1e8) / 1e6}%`}
            value={inputs.discountFactor}
            min={0}
            step={0.01}
            onChange={(discountFactor) => patchInputs({ discountFactor })}
            error={errors.discountFactor}
          />
        </>
      ) : (
        <PresetCaption>
          {`$${inputs.capitalCost} upfront · $${inputs.subscriptionFeeMonthly}/mo · ${inputs.lifespanYears}-yr lifespan · `}
          <span
            style={
              inputs.powerGenWh > 0
                ? { color: theme.colors.primaryGreen, fontWeight: theme.typography.weight.bold }
                : undefined
            }
          >
            {formatPowerGenWh(inputs.powerGenWh)}
          </span>
        </PresetCaption>
      )}

      <CategoryHeading>Energy</CategoryHeading>
      <RadioRow>
        <RadioOption
          name="energy-mode"
          label="Use location preset"
          checked={!showCustomEnergy}
          onChange={() => patchInputs({ customizeEnergy: false })}
        />
        <RadioOption
          name="energy-mode"
          label="Specify custom energy inputs"
          checked={showCustomEnergy}
          onChange={() => patchInputs({ customizeEnergy: true })}
        />
      </RadioRow>
      <SelectField<LocationPreset>
        label="Location"
        value={inputs.location}
        options={LOCATION_OPTIONS}
        onChange={(location) => patchInputs(applyLocation(inputs, location))}
        tooltip="Changing this resets Electricity price and Grid carbon intensity below."
        disabled={showCustomEnergy}
      />

      {showCustomEnergy ? (
        <>
          <NumberField
            label="Electricity price ($/kWh)"
            value={inputs.electricityPricePerKwh}
            min={0}
            step={0.01}
            onChange={(electricityPricePerKwh) => patchInputs({ electricityPricePerKwh })}
            error={errors.electricityPricePerKwh}
          />
          <FieldWithNote
            field={
              <NumberField
                label="Carbon price ($/ton CO2e)"
                value={inputs.carbonPricePerTon}
                min={0}
                onChange={(carbonPricePerTon) => patchInputs({ carbonPricePerTon })}
                error={errors.carbonPricePerTon}
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
                onChange={(gridCarbonIntensityGPerKwh) => patchInputs({ gridCarbonIntensityGPerKwh })}
                error={errors.gridCarbonIntensityGPerKwh}
              />
            }
            note={
              <>
                Grid carbon intensity varies by time of day, season, regional grid makeup, and more. For reference (
                <ExternalLink href="https://www.epa.gov/egrid/summary-data" style={{ color: theme.colors.navy }}>
                  eGRID
                </ExternalLink>
                ): CAMX (California) is 195 gCO2e/kWh; HIOA (Hawaii) is 680 gCO2e/kWh.
              </>
            }
          />
        </>
      ) : (
        <PresetCaption>
          {`$${inputs.electricityPricePerKwh}/kWh · $${inputs.carbonPricePerTon}/ton CO2e · ${inputs.gridCarbonIntensityGPerKwh} gCO2e/kWh`}
        </PresetCaption>
      )}

      <button
        type="button"
        onClick={onSave}
        style={{
          alignSelf: "flex-start",
          padding: `${theme.spacing.xs}px ${theme.spacing.lg}px`,
          marginTop: theme.spacing.sm,
          borderRadius: theme.radii.pill,
          border: "none",
          background: theme.colors.primaryGreen,
          color: "#FFFFFF",
          fontWeight: theme.typography.weight.semibold,
          fontFamily: theme.typography.fontFamily.web,
          cursor: "pointer",
        }}
      >
        Save
      </button>
    </div>
  );
}
