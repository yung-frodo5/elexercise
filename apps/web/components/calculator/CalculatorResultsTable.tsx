"use client";

import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import { EQUIPMENT_SETTINGS, RESULT_METRIC_SECTIONS, RESULT_METRICS } from "../../lib/calculator";
import type { CalculatorColumn, CalculatorResult } from "../../lib/calculator";
import { BrandedEquipmentLabel } from "./BrandedEquipmentLabel";
import { newsreader } from "../../lib/fonts";

const dividerStyle = `1px solid ${withAlpha(theme.colors.border, 0.35)}`;
const LABEL_COLUMN_MIN_WIDTH = 280;

function GridCell({
  children,
  bold,
  header,
  divider,
  sticky,
}: {
  children: ReactNode;
  bold?: boolean;
  header?: boolean;
  divider?: boolean;
  sticky?: boolean;
}) {
  return (
    <div
      style={{
        padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
        fontSize: theme.typography.size.sm,
        // Header cells are Clash Display, capped at Semibold (not Bold,
        // like `bold` rows below get in Newsreader -- that cap only
        // applies to Clash Display text).
        fontWeight: header
          ? theme.typography.weight.semibold
          : bold
            ? theme.typography.weight.bold
            : theme.typography.weight.regular,
        color: theme.colors.navyStatic,
        // This is the header row of a div-based grid, not a real <th> --
        // the global `th { ... }` rule (layout.tsx) can't reach it, so set
        // explicitly to match every other table header on the site.
        ...(header ? { fontFamily: "'Clash Display', sans-serif" } : {}),
        wordBreak: "break-word",
        borderRight: divider ? dividerStyle : undefined,
        // Keeps the row name in view while scrolling the equipment columns horizontally. The background
        // has to be opaque and match the Results panel's own (Calculator.tsx's hardcoded "#D6E9FF" -- the
        // same one-off hex this codebase already repeats at each of its call sites, e.g. app/page.tsx),
        // since scrolled-under column content would otherwise show through a sticky box with no fill.
        ...(sticky ? { position: "sticky" as const, left: 0, zIndex: 1, backgroundColor: "#D6E9FF" } : {}),
      }}
    >
      {children}
    </div>
  );
}

// One label cell + one cell per equipment column, with a vertical divider between the label column and
// the first equipment column, and between each subsequent pair of equipment columns. The label cell is
// sticky so row names stay visible while the equipment columns scroll horizontally underneath.
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
      <GridCell bold={bold} header={header} divider sticky>
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
        // The parent "Results" h2 moved from lg(24) to md(16) in the site-
        // wide heading-size pass, which would have tied it with this
        // subheading. Dropped to sm(14) to stay one tier below its parent
        // -- now ties with GridCell's body text instead, differentiated by
        // font-weight (semibold here vs regular there).
        fontSize: theme.typography.size.sm,
        fontWeight: theme.typography.weight.semibold,
        color: theme.colors.navyStatic,
        fontFamily: newsreader.style.fontFamily,
        marginTop: theme.spacing.md,
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span aria-hidden style={{ fontSize: theme.typography.size.sm, lineHeight: 1 }}>
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
      <p style={{ color: theme.colors.navyStatic, fontSize: theme.typography.size.sm }}>
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
    // minmax(...)'s explicit lower bound keeps each column readable — once that pushes the grid wider
    // than this wrapper, overflowX turns it into a horizontal scrollbar instead of squishing columns.
    <div style={{ overflowX: "auto", width: "100%" }}>
      {/* The flex row (not the grid itself) is what actually overflows and scrolls -- the trailing spacer
          sibling is unfilled space, not an extra grid column, so it can't disturb the grid's implicit
          row-wrapping (which depends on exactly (1 label + equipment.length value) cells per logical row).
          It exists so the sticky row-name column (below) has room to stay stuck for the entire real
          scroll range: position: sticky naturally detaches once the remaining scroll distance drops below
          the sticky item's own width, so without this trailing space it would let go right as the last
          equipment column scrolled into view. */}
      <div style={{ display: "flex" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `minmax(${LABEL_COLUMN_MIN_WIDTH}px, auto) repeat(${equipment.length}, minmax(180px, 1fr))`,
            columnGap: theme.spacing.md,
            rowGap: theme.spacing.xs,
            flex: "1 0 auto",
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
        <div aria-hidden style={{ flex: `0 0 ${LABEL_COLUMN_MIN_WIDTH}px` }} />
      </div>
    </div>
  );
}
