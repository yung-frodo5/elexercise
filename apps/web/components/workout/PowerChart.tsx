"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipContentProps } from "recharts";
import { theme } from "@exercise-tracker/design-tokens";
import { formatDuration } from "../../lib/format";
import type { PowerSamplePoint } from "../../lib/usePowerSamples";

const MAX_PLOTTED_POINTS = 500;

// Keeps the chart smooth for a long session (up to ~14,400 points at the
// simulator's 2-hour/500ms cap) without touching the stats shown alongside
// it, which are always computed from the full, non-downsampled sample set.
function downsampleForPlotting(points: PowerSamplePoint[], maxPoints: number): PowerSamplePoint[] {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  const sampled = points.filter((_, i) => i % step === 0);
  const last = points[points.length - 1];
  if (sampled[sampled.length - 1] !== last) sampled.push(last);
  return sampled;
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as PowerSamplePoint;
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 4,
        padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      }}
    >
      {/* Static -- this tooltip's own white background doesn't invert in
          dark mode. */}
      <div style={{ fontWeight: theme.typography.weight.semibold, color: theme.colors.static.ink }}>
        {Math.round(point.powerW)} W
      </div>
      <div style={{ fontSize: theme.typography.size.sm, color: theme.colors.static.ink }}>
        {formatDuration(point.tMs / 1000)}
      </div>
    </div>
  );
}

export function PowerChart({ samples, peakPowerW }: { samples: PowerSamplePoint[]; peakPowerW: number }) {
  const plotted = useMemo(() => downsampleForPlotting(samples, MAX_PLOTTED_POINTS), [samples]);
  const yMax = useMemo(() => Math.max(100, Math.ceil((peakPowerW + 20) / 50) * 50), [peakPowerW]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={plotted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={theme.colors.border} strokeOpacity={0.3} />
        <XAxis
          dataKey="tMs"
          tickFormatter={(tMs: number) => formatDuration(tMs / 1000)}
          stroke={theme.colors.navy}
          tickLine={false}
          axisLine={false}
          fontSize={theme.typography.size.sm}
          minTickGap={40}
        />
        <YAxis
          domain={[0, yMax]}
          tickFormatter={(value: number) => `${value}W`}
          stroke={theme.colors.navy}
          tickLine={false}
          axisLine={false}
          fontSize={theme.typography.size.sm}
          width={48}
        />
        <Tooltip content={ChartTooltip} cursor={{ stroke: theme.colors.border, strokeDasharray: "4 4" }} />
        <Area
          type="monotone"
          dataKey="powerW"
          stroke={theme.colors.secondaryGreen}
          strokeWidth={2}
          fill={theme.colors.secondaryGreen}
          fillOpacity={0.1}
          isAnimationActive={false}
          dot={false}
          activeDot={{ r: 4, fill: theme.colors.secondaryGreen, stroke: "#FFFFFF", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
