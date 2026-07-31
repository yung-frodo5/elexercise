"use client";

import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import { EQUIPMENT_SETTINGS, RESULT_METRIC_SECTIONS, RESULT_METRICS } from "../../lib/calculator";
import type { CalculatorColumn, CalculatorResult } from "../../lib/calculator";
import { BrandedEquipmentLabel } from "./BrandedEquipmentLabel";

const dividerStyle = `1px solid ${withAlpha(theme.colors.border, 0.35)}`;

function GridCell({
  children,
  bold,
  header,
  divider,
}: {
  children: ReactNode;
  bold?: boolean;
  header?: boolean;
  divider?: boolean;
}) {
  return (
    <div
      style={{
        padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
        fontWeight: bold || header ? theme.typography.weight.bold : theme.typography.weight.regular,
        color: theme.colors.navy,
        wordBreak: "break-word",
        borderRight: divider ? dividerStyle : undefined,
      }}
    >
      {children}
    </div>
  );
}

// One label cell + one cell per equipment column, with a vertical divider between the label column and
// the first equipment column, and between each subsequent pair of equipment columns.
function TableRow({
  label,
  values,
  bold,
  header,
}: {
  label: ReactNode;
  values: ReactNode[];
  bold?: boolean;
  header?: boolean;
}) {
  return (
    <>
      <GridCell bold={bold} header={header} divider>
        {label}
      </GridCell>
      {values.map((value, i) => (
        <GridCell key={i} bold={bold} header={header} divider={i < values.length - 1}>
          {value}
        </GridCell>
      ))}
    </>
  );
}

// Clickable section heading — the arrow (reusing the app's existing expand/collapse icon tokens)
// toggles whether the rows belonging to this section are rendered at all.
function SectionHeading({
  title,
  columnCount,
  collapsed,
  onToggle,
}: {
  title: string;
  columnCount: number;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!collapsed}
      style={{
        gridColumn: `1 / span ${columnCount + 1}`,
        display: "flex",
        alignItems: "center",
        gap: theme.spacing.xs,
        fontSize: theme.typography.size.lg,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.navy,
        fontFamily: theme.typography.fontFamily.web,
        marginTop: theme.spacing.md,
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span aria-hidden style={{ fontSize: theme.typography.size.lg, lineHeight: 1 }}>
        {collapsed ? theme.icons.expand : theme.icons.collapse}
      </span>
      {title}
    </button>
  );
}

export function CalculatorResultsTable({
  equipment,
  results,
}: {
  equipment: CalculatorColumn[];
  results: CalculatorResult[];
}) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  if (equipment.length === 0) {
    return (
      <p style={{ color: theme.colors.navy, fontSize: theme.typography.size.sm }}>
        Add equipment to see results.
      </p>
    );
  }

  function toggleSection(title: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `minmax(140px, auto) repeat(${equipment.length}, minmax(90px, 1fr))`,
        columnGap: theme.spacing.md,
        rowGap: theme.spacing.xs,
        width: "100%",
      }}
    >
      <TableRow
        header
        label=" "
        values={equipment.map((item, i) => (
          <BrandedEquipmentLabel key={item.id} inputs={item.inputs}>
            {item.name}
            {i === 0 ? " (baseline)" : ""}
          </BrandedEquipmentLabel>
        ))}
      />

      <SectionHeading
        title="Settings"
        columnCount={equipment.length}
        collapsed={collapsedSections.has("Settings")}
        onToggle={() => toggleSection("Settings")}
      />
      {!collapsedSections.has("Settings") &&
        EQUIPMENT_SETTINGS.map((setting) => (
          <TableRow
            key={setting.label}
            label={setting.label}
            values={equipment.map((item) =>
              setting.isEquipmentPreset ? (
                <BrandedEquipmentLabel key={item.id} inputs={item.inputs}>
                  {setting.format(item.inputs)}
                </BrandedEquipmentLabel>
              ) : (
                setting.format(item.inputs)
              ),
            )}
          />
        ))}

      {RESULT_METRIC_SECTIONS.map((section) => (
        <Fragment key={section}>
          <SectionHeading
            title={section}
            columnCount={equipment.length}
            collapsed={collapsedSections.has(section)}
            onToggle={() => toggleSection(section)}
          />
          {!collapsedSections.has(section) &&
            RESULT_METRICS.filter((metric) => metric.section === section).map((metric) => (
              <TableRow
                key={metric.label}
                bold={metric.bold}
                label={metric.label}
                values={results.map((result) => metric.format(result))}
              />
            ))}
        </Fragment>
      ))}
    </div>
  );
}
