"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipContentProps } from "recharts";
import { theme } from "@exercise-tracker/design-tokens";
import { formatDuration } from "../../lib/format";
import { withAlpha } from "../../lib/color";
import {
  downsamplePowerSamples,
  powerAxisMaxW,
} from "../../lib/downsamplePowerSamples";
import type { PowerSamplePoint } from "../../lib/usePowerSamples";

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as PowerSamplePoint;
  return (
    <div
      style={{
        background: theme.colors.background,
        border: `1px solid ${withAlpha(theme.colors.border, 0.28)}`,
        borderRadius: 8,
        padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
        boxShadow: `0 4px 12px ${withAlpha(theme.colors.textPrimary, 0.08)}`,
        fontFamily: theme.typography.fontFamily.web,
        whiteSpace: "nowrap",
      }}
    >
      <div
        style={{
          fontWeight: theme.typography.weight.semibold,
          color: theme.colors.textPrimary,
          fontFamily: theme.typography.fontFamily.mono,
        }}
      >
        {Math.round(point.powerW)} W
      </div>
      <div style={{ fontSize: theme.typography.size.xs, color: theme.colors.textMuted }}>
        {formatDuration(point.tMs / 1000)}
      </div>
    </div>
  );
}

export function PowerChart({ samples, peakPowerW }: { samples: PowerSamplePoint[]; peakPowerW: number }) {
  const plotted = useMemo(() => downsamplePowerSamples(samples), [samples]);
  const yMax = useMemo(() => powerAxisMaxW(peakPowerW), [peakPowerW]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <p
        style={{
          margin: 0,
          marginBottom: theme.spacing.xs,
          fontSize: 11,
          fontWeight: theme.typography.weight.semibold,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textAlign: "center",
          color: theme.colors.textMuted,
        }}
      >
        Power Output
      </p>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={plotted} margin={{ top: 4, right: 8, left: 18, bottom: 16 }}>
            <CartesianGrid vertical={false} stroke={theme.colors.border} strokeOpacity={0.3} />
            <XAxis
              dataKey="tMs"
              tickFormatter={(tMs: number) => formatDuration(tMs / 1000)}
              stroke={theme.colors.textMuted}
              tickLine={false}
              axisLine={false}
              fontSize={theme.typography.size.xs}
              minTickGap={40}
              label={{
                value: "Time",
                position: "insideBottom",
                offset: -8,
                style: {
                  fill: theme.colors.textMuted,
                  fontSize: 11,
                  fontFamily: theme.typography.fontFamily.web,
                },
              }}
            />
            <YAxis
              domain={[0, yMax]}
              tickFormatter={(value: number) => `${value}`}
              stroke={theme.colors.textMuted}
              tickLine={false}
              axisLine={false}
              fontSize={theme.typography.size.xs}
              width={52}
              label={{
                value: "Watts",
                angle: -90,
                position: "insideLeft",
                offset: -6,
                style: {
                  fill: theme.colors.textMuted,
                  fontSize: 11,
                  fontFamily: theme.typography.fontFamily.web,
                  textAnchor: "middle",
                },
              }}
            />
            <Tooltip
              content={ChartTooltip}
              cursor={{ stroke: theme.colors.border, strokeDasharray: "4 4" }}
              isAnimationActive={false}
              wrapperStyle={{ outline: "none" }}
            />
            <Area
              type="monotone"
              dataKey="powerW"
              stroke={theme.colors.secondaryGreen}
              strokeWidth={2}
              fill={theme.colors.secondaryGreen}
              fillOpacity={0.1}
              isAnimationActive={false}
              dot={false}
              activeDot={{
                r: 4,
                fill: theme.colors.secondaryGreen,
                stroke: theme.colors.background,
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
