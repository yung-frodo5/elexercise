"use client";

import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import type { CalculatorColumn, CalculatorInputs } from "../../lib/calculator";
import { BrandedEquipmentLabel } from "./BrandedEquipmentLabel";

function RosterPill({
  name,
  inputs,
  active,
  onSelect,
  onRemove,
}: {
  name: string;
  inputs?: CalculatorInputs;
  active: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: theme.spacing.xs,
        maxWidth: 220,
        padding: `5px ${theme.spacing.sm}px`,
        borderRadius: theme.radii.pill,
        border: `1px solid ${active ? withAlpha(theme.colors.primaryGreen, 0.45) : withAlpha(theme.colors.border, 0.28)}`,
        background: active ? withAlpha(theme.colors.primaryGreen, 0.2) : "transparent",
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        style={{
          border: "none",
          background: "none",
          padding: 0,
          cursor: "pointer",
          color: active ? theme.colors.secondaryGreen : theme.colors.navy,
          fontSize: theme.typography.size.xs,
          fontWeight: active ? theme.typography.weight.semibold : theme.typography.weight.medium,
          fontFamily: theme.typography.fontFamily.web,
          textAlign: "left",
          whiteSpace: "normal",
          wordBreak: "break-word",
        }}
      >
        {inputs ? <BrandedEquipmentLabel inputs={inputs}>{name}</BrandedEquipmentLabel> : name}
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          style={{
            border: "none",
            background: "none",
            padding: 0,
            cursor: "pointer",
            color: theme.colors.navy,
            fontSize: theme.typography.size.xs,
            lineHeight: 1,
          }}
        >
          {theme.icons.close}
        </button>
      )}
    </span>
  );
}

export function EquipmentRoster({
  equipment,
  selectedId,
  onRequestSelect,
  onRequestNew,
  onRemove,
}: {
  equipment: CalculatorColumn[];
  selectedId: string | "new";
  onRequestSelect: (id: string) => void;
  onRequestNew: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.sm, alignItems: "center" }}>
      {equipment.map((item) => (
        <RosterPill
          key={item.id}
          name={item.name}
          inputs={item.inputs}
          active={selectedId === item.id}
          onSelect={() => onRequestSelect(item.id)}
          onRemove={() => onRemove(item.id)}
        />
      ))}
      <RosterPill name="+ New equipment" active={selectedId === "new"} onSelect={onRequestNew} />
    </div>
  );
}
