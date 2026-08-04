"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { theme } from "@exercise-tracker/design-tokens";
import { buildCashFlowTimeSeries, DEFAULT_CHART_TITLE } from "../../lib/calculator";
import type { CalculatorColumn, CalculatorResult } from "../../lib/calculator";
import { pillButtonStyle } from "./pillButtonStyle";

// `results` is passed in (rather than recomputed here) so it stays a single computeCostPerWorkout pass
// per equipment item, shared with CalculatorResultsTable — see Calculator.tsx.
//
// `title`/`onTitleChange` are lifted to Calculator.tsx (like EquipmentEditor's onChange/onSave) rather
// than kept as local state here, since Calculator.tsx also needs the current title text to build the
// SVG export. `onExportSvg` is likewise implemented in Calculator.tsx, which owns the ref reaching this
// component's rendered <svg> and the equipment list needed for the exported legend.
export function CashFlowChart({
  equipment,
  results,
  title,
  onTitleChange,
  onExportSvg,
}: {
  equipment: CalculatorColumn[];
  results: CalculatorResult[];
  title: string;
  onTitleChange: (next: string) => void;
  onExportSvg: () => void;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const data = useMemo(
    () =>
      buildCashFlowTimeSeries(
        equipment.map((item, i) => ({ id: item.id, inputs: item.inputs, result: results[i]! })),
      ),
    [equipment, results],
  );

  if (equipment.length === 0) return null;

  const titleTextStyle = {
    margin: 0,
    textAlign: "center" as const,
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.navyStatic,
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.md, marginBottom: theme.spacing.sm }}>
        {/* Two equal-flex spacers straddling the centered title (same pattern as the Results heading in
            Calculator.tsx) so the button's width can't pull the title off-center. */}
        <div style={{ flex: 1 }} />
        <div style={{ flex: 1 }}>
          {isEditingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={() => {
                if (!title.trim()) onTitleChange(DEFAULT_CHART_TITLE);
                setIsEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              style={{
                ...titleTextStyle,
                display: "block",
                width: "min(100%, 360px)",
                margin: "0 auto",
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii.sm,
                padding: `2px ${theme.spacing.xs}px`,
                background: "transparent",
              }}
            />
          ) : (
            <p
              role="button"
              tabIndex={0}
              onClick={() => setIsEditingTitle(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setIsEditingTitle(true);
              }}
              title="Click to edit chart title"
              style={{ ...titleTextStyle, cursor: "pointer" }}
            >
              {title} <span style={{ opacity: 0.5, fontSize: theme.typography.size.sm }}>✎</span>
            </p>
          )}
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <button type="button" onClick={onExportSvg} style={pillButtonStyle}>
            Export to SVG
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
          <CartesianGrid vertical={false} stroke={theme.colors.border} strokeOpacity={0.3} />
          <XAxis
            dataKey="years"
            type="number"
            domain={[0, "dataMax"]}
            allowDecimals={false}
            tickFormatter={(value: number) => `${Math.round(value)}`}
            stroke={theme.colors.navyStatic}
            tickLine={false}
            axisLine={false}
            fontSize={theme.typography.size.sm}
            label={{ value: "Years", position: "insideBottom", offset: -8, fill: theme.colors.navyStatic }}
          />
          <YAxis
            tickFormatter={(value: number) => `$${Math.round(value)}`}
            stroke={theme.colors.navyStatic}
            tickLine={false}
            axisLine={false}
            fontSize={theme.typography.size.sm}
            width={56}
          />
          <Tooltip
            isAnimationActive={false}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div
                  style={{
                    background: "#FFFFFF",
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.radii.md,
                    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
                  }}
                >
                  <div style={{ fontSize: theme.typography.size.sm, color: theme.colors.navyStatic, marginBottom: 4 }}>
                    {Math.round(Number(label))} {Math.round(Number(label)) === 1 ? "year" : "years"}
                  </div>
                  {payload.map((entry) => {
                    const item = equipment.find((e) => e.id === entry.dataKey);
                    if (entry.value == null || !item) return null;
                    return (
                      <div
                        key={String(entry.dataKey)}
                        style={{
                          color: String(entry.color),
                          fontWeight: theme.typography.weight.semibold,
                          fontSize: theme.typography.size.sm,
                        }}
                      >
                        {item.name}: ${Math.round(Number(entry.value))}
                      </div>
                    );
                  })}
                </div>
              );
            }}
          />
          {/* Placed above the plot (not the recharts default of below/overlapping the x-axis label). */}
          <Legend verticalAlign="top" align="center" height={36} />
          {equipment.map((item) => (
            <Line
              key={item.id}
              type="monotone"
              dataKey={item.id}
              name={item.name}
              stroke={item.color}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
