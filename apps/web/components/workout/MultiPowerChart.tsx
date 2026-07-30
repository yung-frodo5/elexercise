"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Session } from "@exercise-tracker/shared-types";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import { downsamplePowerSamples, powerAxisMaxW } from "../../lib/downsamplePowerSamples";
import { formatDuration } from "../../lib/format";
import { overlineStyle } from "../../lib/uiStyles";
import type { PowerSamplePoint } from "../../lib/usePowerSamples";

type SeriesInput = {
  session: Session;
  /** Samples on the shared workout timeline. */
  timelineSamples: PowerSamplePoint[];
  color: string;
};

/** Multi-activity power chart on a shared workout timeline. */
export function MultiPowerChart({
  series,
  selectedIds,
}: {
  series: SeriesInput[];
  selectedIds: ReadonlySet<string>;
}) {
  // Stable membership key so Set identity changes don't force recompute.
  const selectedKey = [...selectedIds].sort().join("|");

  const { data, yMax, xMin, xMax, active } = useMemo(() => {
    const idSet = new Set(selectedKey ? selectedKey.split("|") : []);
    const activeSeries = series.filter((s) => idSet.has(s.session.id));
    // One activity: keep workout-timeline clocks, but zoom domain to that series
    // so it fills the plot (a late activity still starts at e.g. 45:00, not 0).
    const solo = activeSeries.length === 1;
    const times = new Set<number>();
    const byId = new Map<string, Map<number, number>>();
    let peak = 100;
    let minT = Number.POSITIVE_INFINITY;
    let maxT = 0;

    for (const s of activeSeries) {
      const map = new Map<number, number>();
      const samples = downsamplePowerSamples(s.timelineSamples);
      for (const p of samples) {
        times.add(p.tMs);
        map.set(p.tMs, p.powerW);
        peak = Math.max(peak, p.powerW);
        minT = Math.min(minT, p.tMs);
        maxT = Math.max(maxT, p.tMs);
      }
      // Multi-activity: anchor session bounds so rest gaps keep wall-clock width.
      if (!solo && samples.length > 0) {
        times.add(samples[0]!.tMs);
        times.add(samples[samples.length - 1]!.tMs);
        minT = Math.min(minT, samples[0]!.tMs);
        maxT = Math.max(maxT, samples[samples.length - 1]!.tMs);
      }
      byId.set(s.session.id, map);
    }

    if (!Number.isFinite(minT)) minT = 0;

    const sortedTimes = [...times].sort((a, b) => a - b);
    const rows = sortedTimes.map((tMs) => {
      const row: Record<string, number | null> = { tMs };
      for (const s of activeSeries) {
        row[s.session.id] = byId.get(s.session.id)?.get(tMs) ?? null;
      }
      return row;
    });

    return {
      active: activeSeries,
      data: rows,
      yMax: powerAxisMaxW(peak),
      // Multi: always from workout start; solo: zoom to the activity window.
      xMin: solo ? minT : 0,
      xMax: maxT,
    };
  }, [series, selectedKey]);

  if (active.length === 0) {
    return (
      <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: theme.typography.size.sm }}>
        Select an activity to show power output.
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: theme.typography.size.sm }}>
        No power data recorded for these activities.
      </p>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <p style={{ ...overlineStyle, marginBottom: theme.spacing.xs, textAlign: "center" }}>
        Power Output
      </p>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 18, bottom: 16 }}>
            <CartesianGrid vertical={false} stroke={theme.colors.border} strokeOpacity={0.3} />
            <XAxis
              type="number"
              dataKey="tMs"
              domain={[xMin, xMax || "auto"]}
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
                  fontSize: theme.typography.size.xxs,
                  fontFamily: theme.typography.fontFamily.web,
                },
              }}
            />
            <YAxis
              domain={[0, yMax]}
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
                  fontSize: theme.typography.size.xxs,
                  fontFamily: theme.typography.fontFamily.web,
                  textAnchor: "middle",
                },
              }}
            />
            <Tooltip
              isAnimationActive={false}
              content={({ active: tipActive, payload, label }) => {
                if (!tipActive || !payload?.length) return null;
                return (
                  <div
                    style={{
                      background: theme.colors.background,
                      border: `1px solid ${withAlpha(theme.colors.border, 0.28)}`,
                      borderRadius: theme.radii.md,
                      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
                      fontFamily: theme.typography.fontFamily.web,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div
                      style={{
                        fontSize: theme.typography.size.xs,
                        color: theme.colors.textMuted,
                        marginBottom: 4,
                      }}
                    >
                      {formatDuration(Number(label) / 1000)}
                    </div>
                    {payload.map((entry) => {
                      if (entry.value == null) return null;
                      const session = active.find((s) => s.session.id === entry.dataKey)?.session;
                      return (
                        <div
                          key={String(entry.dataKey)}
                          style={{
                            color: String(entry.color),
                            fontFamily: theme.typography.fontFamily.mono,
                            fontWeight: theme.typography.weight.semibold,
                            fontSize: theme.typography.size.sm,
                          }}
                        >
                          {session?.activityType ?? "Activity"}: {Math.round(Number(entry.value))} W
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
            {active.map((s) => (
              <Line
                key={s.session.id}
                type="monotone"
                dataKey={s.session.id}
                name={s.session.activityType}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
                activeDot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
