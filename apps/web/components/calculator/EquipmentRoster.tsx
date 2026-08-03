"use client";

import { theme } from "@exercise-tracker/design-tokens";
import type { CalculatorColumn, CalculatorInputs } from "../../lib/calculator";
import { BrandedEquipmentLabel } from "./BrandedEquipmentLabel";

// Light, warm fill for pills -- distinct from the app's usual light-blue panel background, chosen so
// dark text/borders read clearly against it regardless of which accent color a given pill's border uses.
const PILL_FILL = "#FAF3E0";
// The currently-selected pill instead gets the app's usual light-blue panel fill (the same "#D6E9FF" the
// Editor/Results panels use), so it's visually tied to "this is what's loaded below" rather than just
// relying on the border-width bump.
const ACTIVE_PILL_FILL = "#D6E9FF";

// The dark-navy-backdrop version of this (accent-colored border AND fill, white text) that these pills
// used to have read poorly -- some of the per-equipment accent colors didn't have enough contrast against
// navy. Solid light fill + black text sidesteps that regardless of which accent color a given pill lands
// on; only the border still carries that color.
function RosterPill({
  name,
  inputs,
  color,
  active,
  onSelect,
  onRemove,
}: {
  name: string;
  inputs?: CalculatorInputs;
  color?: string;
  active: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}) {
  // Saved equipment gets a border in its own stored color (the Equipment Editor's Color field) -- makes it
  // easy to match a pill to its line in the results graph at a glance. The "+ New equipment" pill has no
  // equipment/color of its own, so its border is just the app's usual green accent.
  const borderColor = color ?? theme.colors.primaryGreen;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: theme.spacing.xs,
        maxWidth: 220,
        padding: `5px ${theme.spacing.sm}px`,
        borderRadius: theme.radii.pill,
        border: `${active ? 2 : 1}px solid ${borderColor}`,
        background: active ? ACTIVE_PILL_FILL : PILL_FILL,
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
          color: "#000000",
          fontSize: theme.typography.size.sm,
          fontWeight: active ? theme.typography.weight.semibold : theme.typography.weight.medium,
          fontFamily: "'Clash Display', sans-serif",
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
            color: "#000000",
            fontSize: theme.typography.size.sm,
            lineHeight: 1,
            opacity: 0.6,
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
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: theme.spacing.sm,
        alignItems: "center",
        backgroundColor: theme.colors.navyStatic,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.md,
      }}
    >
      {equipment.map((item) => (
        <RosterPill
          key={item.id}
          name={item.name}
          inputs={item.inputs}
          color={item.color}
          active={selectedId === item.id}
          onSelect={() => onRequestSelect(item.id)}
          onRemove={() => onRemove(item.id)}
        />
      ))}
      <RosterPill name="+ New equipment" active={selectedId === "new"} onSelect={onRequestNew} />
    </div>
  );
}
