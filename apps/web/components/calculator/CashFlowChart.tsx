"use client";

import { useMemo } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { theme } from "@exercise-tracker/design-tokens";
import { buildCashFlowTimeSeries } from "../../lib/calculator";
import type { CalculatorColumn, CalculatorResult } from "../../lib/calculator";

// `results` is passed in (rather than recomputed here) so it stays a single computeCostPerWorkout pass
// per equipment item, shared with CalculatorResultsTable — see Calculator.tsx.
export function CashFlowChart({
  equipment,
  results,
}: {
  equipment: CalculatorColumn[];
  results: CalculatorResult[];
}) {
  const data = useMemo(
    () =>
      buildCashFlowTimeSeries(
        equipment.map((item, i) => ({ id: item.id, inputs: item.inputs, result: results[i]! })),
      ),
    [equipment, results],
  );

  if (equipment.length === 0) return null;

  return (
    <div>
      <p
        style={{
          margin: 0,
          textAlign: "center",
          fontSize: theme.typography.size.md,
          fontWeight: theme.typography.weight.bold,
          color: theme.colors.navyStatic,
        }}
      >
        Cost over time
      </p>
      <p
        style={{
          margin: 0,
          marginBottom: theme.spacing.sm,
          textAlign: "center",
          fontSize: theme.typography.size.sm,
          color: theme.colors.navyStatic,
          opacity: 0.75,
        }}
      >
        Cumulative cash cost for each piece of equipment, from purchase through the end of its modeled lifespan.
      </p>
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
