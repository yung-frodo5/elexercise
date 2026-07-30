import { useMemo, useState } from "react";
import { StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import type { Session } from "@exercise-tracker/shared-types";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import type { PowerSamplePoint } from "@exercise-tracker/workout-history";
import {
  downsamplePowerSamples,
  formatDuration,
  powerAxisMaxW,
} from "@exercise-tracker/workout-history";

type SeriesInput = {
  session: Session;
  timelineSamples: PowerSamplePoint[];
  color: string;
};

type ScrubReading = {
  id: string;
  label: string;
  color: string;
  powerW: number;
};

type ScrubState = {
  x: number;
  tMs: number;
  readings: ScrubReading[];
};

const MAX_POINTS = 120;
const TICK_W = 36;
const PAD = { top: 10, right: 8, bottom: 22, left: TICK_W };
const CHART_H = 168;
const INK = theme.colors.navy;

/** Sample on the line at tMs, or null when tMs is outside this series' span (no line). */
function sampleAtTime(samples: PowerSamplePoint[], tMs: number): PowerSamplePoint | null {
  if (samples.length === 0) return null;
  const first = samples[0]!;
  const last = samples[samples.length - 1]!;
  if (tMs < first.tMs || tMs > last.tMs) return null;

  // Exact / single-point hit.
  if (samples.length === 1 || tMs === first.tMs) return first;
  if (tMs === last.tMs) return last;

  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i]!;
    const b = samples[i + 1]!;
    if (tMs < a.tMs || tMs > b.tMs) continue;
    if (b.tMs === a.tMs) return a;
    const u = (tMs - a.tMs) / (b.tMs - a.tMs);
    return { tMs, powerW: a.powerW + (b.powerW - a.powerW) * u };
  }
  return null;
}

export function MultiPowerChart({
  series,
  selectedIds,
}: {
  series: SeriesInput[];
  selectedIds: ReadonlySet<string>;
}) {
  const [width, setWidth] = useState(0);
  const [scrub, setScrub] = useState<ScrubState | null>(null);
  const selectedKey = [...selectedIds].sort().join("|");

  const model = useMemo(() => {
    const idSet = new Set(selectedKey ? selectedKey.split("|") : []);
    const active = series.filter((s) => idSet.has(s.session.id));
    const solo = active.length === 1;
    let peak = 100;
    let minT = Number.POSITIVE_INFINITY;
    let maxT = 0;
    const prepared: {
      id: string;
      label: string;
      color: string;
      samples: PowerSamplePoint[];
    }[] = [];

    for (const s of active) {
      const samples = downsamplePowerSamples(s.timelineSamples, MAX_POINTS);
      for (const p of samples) {
        peak = Math.max(peak, p.powerW);
        minT = Math.min(minT, p.tMs);
        maxT = Math.max(maxT, p.tMs);
      }
      prepared.push({
        id: s.session.id,
        label: s.session.activityType || "Activity",
        color: s.color,
        samples,
      });
    }

    if (!Number.isFinite(minT)) minT = 0;
    return {
      active,
      prepared,
      yMax: powerAxisMaxW(peak),
      xMin: solo ? minT : 0,
      xMax: maxT,
    };
  }, [series, selectedKey]);

  if (model.active.length === 0) {
    return <Text style={styles.empty}>Select an activity to show power output.</Text>;
  }
  if (model.prepared.every((s) => s.samples.length === 0)) {
    return <Text style={styles.empty}>No power data recorded for these activities.</Text>;
  }

  const plotW = Math.max(10, width - PAD.left - PAD.right);
  const plotH = Math.max(10, CHART_H - PAD.top - PAD.bottom);
  const xRange = Math.max(1, model.xMax - model.xMin);
  const yTicks = [0, 0.5, 1].map((f) => Math.round(f * model.yMax));
  const xTickCount = Math.max(2, Math.min(5, Math.floor(plotW / 64)));
  const xTicks = Array.from({ length: xTickCount }, (_, i) =>
    model.xMin + (i / (xTickCount - 1)) * xRange
  );

  function scrubAt(locationX: number, locationY: number) {
    const plotX = Math.min(plotW, Math.max(0, locationX - PAD.left));
    const tMs = model.xMin + (plotX / plotW) * xRange;

    // Only series with a real line at this time; pick the closest to the finger in Y.
    let best: ScrubReading | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const s of model.prepared) {
      const p = sampleAtTime(s.samples, tMs);
      if (!p) continue;
      const y = PAD.top + (1 - p.powerW / model.yMax) * plotH;
      const dist = Math.abs(y - locationY);
      if (dist < bestDist) {
        bestDist = dist;
        best = {
          id: s.id,
          label: s.label,
          color: s.color,
          powerW: Math.round(p.powerW),
        };
      }
    }
    if (!best) {
      setScrub(null);
      return;
    }
    setScrub({ x: PAD.left + plotX, tMs, readings: [best] });
  }

  function onTouch(e: GestureResponderEvent) {
    scrubAt(e.nativeEvent.locationX, e.nativeEvent.locationY);
  }

  // Keep the callout on-screen beside the scrub line (flip near edges / bottom).
  const tipW = 132;
  const tipH = scrub ? 28 + scrub.readings.length * 18 : 0;
  const tipLeft =
    scrub == null
      ? 0
      : scrub.x + 10 + tipW > width - 4
        ? Math.max(4, scrub.x - tipW - 10)
        : scrub.x + 10;
  let tipTop = PAD.top + 4;
  if (scrub) {
    const ys = scrub.readings
      .map((r) => {
        const s = model.prepared.find((p) => p.id === r.id);
        const p = s ? sampleAtTime(s.samples, scrub.tMs) : null;
        return p ? PAD.top + (1 - p.powerW / model.yMax) * plotH : null;
      })
      .filter((y): y is number => y != null);
    if (ys.length > 0) {
      const avgY = ys.reduce((a, b) => a + b, 0) / ys.length;
      tipTop = Math.min(
        PAD.top + plotH - tipH - 4,
        Math.max(PAD.top + 4, avgY - tipH / 2)
      );
    }
  }

  return (
    <View style={styles.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Text style={styles.title}>Power Output (W)</Text>
      {!scrub && <Text style={styles.hint}>Tap or drag the chart to read watts</Text>}
      <View
        style={{ height: CHART_H, width: "100%" }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={onTouch}
        onResponderMove={onTouch}
      >
        {width > 0 &&
          yTicks.map((w) => {
            const y = PAD.top + (1 - w / model.yMax) * plotH;
            return (
              <View key={w} style={[styles.gridRow, { top: y }]} pointerEvents="none">
                <Text style={styles.tick}>{w}</Text>
                <View style={[styles.gridLine, { width: plotW }]} />
              </View>
            );
          })}

        {width > 0 &&
          xTicks.map((tMs) => {
            const x = PAD.left + ((tMs - model.xMin) / xRange) * plotW;
            return (
              <Text
                key={tMs}
                style={[styles.xLabel, { left: x - 22 }]}
                pointerEvents="none"
              >
                {formatDuration(tMs / 1000)}
              </Text>
            );
          })}

        {width > 0 &&
          model.prepared.map((s) =>
            s.samples.slice(0, -1).map((p, i) => {
              const next = s.samples[i + 1]!;
              const x1 = PAD.left + ((p.tMs - model.xMin) / xRange) * plotW;
              const y1 = PAD.top + (1 - p.powerW / model.yMax) * plotH;
              const x2 = PAD.left + ((next.tMs - model.xMin) / xRange) * plotW;
              const y2 = PAD.top + (1 - next.powerW / model.yMax) * plotH;
              const dx = x2 - x1;
              const dy = y2 - y1;
              const len = Math.hypot(dx, dy);
              if (len < 0.5) return null;
              const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
              return (
                <View
                  key={`${s.id}-${i}`}
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: (x1 + x2) / 2 - len / 2,
                    top: (y1 + y2) / 2 - 1,
                    width: len,
                    height: 2,
                    backgroundColor: s.color,
                    transform: [{ rotate: `${angle}deg` }],
                  }}
                />
              );
            })
          )}

        {scrub && (
          <>
            <View
              pointerEvents="none"
              style={[styles.scrubLine, { left: scrub.x, height: plotH, top: PAD.top }]}
            />
            {scrub.readings.map((r) => {
              const s = model.prepared.find((p) => p.id === r.id);
              const p = s ? sampleAtTime(s.samples, scrub.tMs) : null;
              if (!p) return null;
              const y = PAD.top + (1 - p.powerW / model.yMax) * plotH;
              return (
                <View
                  key={`dot-${r.id}`}
                  pointerEvents="none"
                  style={[
                    styles.scrubDot,
                    {
                      left: scrub.x - 4,
                      top: y - 4,
                      backgroundColor: r.color,
                    },
                  ]}
                />
              );
            })}
            <View pointerEvents="none" style={[styles.tooltip, { left: tipLeft, top: tipTop }]}>
              <Text style={styles.tooltipTime}>{formatDuration(scrub.tMs / 1000)}</Text>
              {scrub.readings.map((r) => (
                <Text key={r.id} style={[styles.tooltipReading, { color: r.color }]}>
                  {r.label}: {r.powerW} W
                </Text>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    backgroundColor: withAlpha(theme.colors.navy, 0.04),
    borderRadius: theme.radii.md,
    paddingTop: theme.spacing.xs,
    overflow: "hidden",
  },
  title: {
    marginBottom: 2,
    fontSize: 10,
    fontWeight: theme.typography.weight.semibold,
    letterSpacing: 0.07,
    textTransform: "uppercase",
    color: INK,
    textAlign: "center",
  },
  hint: {
    fontSize: 10,
    color: withAlpha(INK, 0.5),
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  tooltip: {
    position: "absolute",
    zIndex: 2,
    width: 132,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: theme.radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: withAlpha(INK, 0.2),
    shadowColor: theme.colors.navy,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  tooltipTime: {
    fontSize: 10,
    color: withAlpha(INK, 0.7),
    marginBottom: 2,
  },
  tooltipReading: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold,
    fontVariant: ["tabular-nums"],
  },
  empty: {
    color: INK,
    fontSize: theme.typography.size.sm,
    textAlign: "center",
    paddingVertical: theme.spacing.md,
  },
  gridRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  tick: {
    width: TICK_W,
    paddingRight: 4,
    fontSize: 9,
    color: INK,
    textAlign: "right",
  },
  gridLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: withAlpha(INK, 0.2),
  },
  xLabel: {
    position: "absolute",
    top: CHART_H - 16,
    width: 44,
    textAlign: "center",
    fontSize: 9,
    color: INK,
  },
  scrubLine: {
    position: "absolute",
    width: StyleSheet.hairlineWidth,
    backgroundColor: withAlpha(INK, 0.55),
  },
  scrubDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});
