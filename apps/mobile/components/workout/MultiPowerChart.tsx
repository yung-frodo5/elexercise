import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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

const MAX_POINTS = 120;
const TICK_W = 36;
const PAD = { top: 10, right: 8, bottom: 22, left: TICK_W };
const CHART_H = 168;
const INK = theme.colors.navy;

export function MultiPowerChart({
  series,
  selectedIds,
}: {
  series: SeriesInput[];
  selectedIds: ReadonlySet<string>;
}) {
  const [width, setWidth] = useState(0);
  const selectedKey = [...selectedIds].sort().join("|");

  const model = useMemo(() => {
    const idSet = new Set(selectedKey ? selectedKey.split("|") : []);
    const active = series.filter((s) => idSet.has(s.session.id));
    const solo = active.length === 1;
    let peak = 100;
    let minT = Number.POSITIVE_INFINITY;
    let maxT = 0;
    const prepared: { id: string; color: string; samples: PowerSamplePoint[] }[] = [];

    for (const s of active) {
      const samples = downsamplePowerSamples(s.timelineSamples, MAX_POINTS);
      for (const p of samples) {
        peak = Math.max(peak, p.powerW);
        minT = Math.min(minT, p.tMs);
        maxT = Math.max(maxT, p.tMs);
      }
      prepared.push({ id: s.session.id, color: s.color, samples });
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

  return (
    <View style={styles.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Text style={styles.title}>Power Output (W)</Text>
      <View style={{ height: CHART_H, width: "100%" }}>
        {width > 0 &&
          yTicks.map((w) => {
            const y = PAD.top + (1 - w / model.yMax) * plotH;
            return (
              <View key={w} style={[styles.gridRow, { top: y }]}>
                <Text style={styles.tick}>{w}</Text>
                <View style={[styles.gridLine, { width: plotW }]} />
              </View>
            );
          })}

        {width > 0 &&
          xTicks.map((tMs) => {
            const x = PAD.left + ((tMs - model.xMin) / xRange) * plotW;
            return (
              <Text key={tMs} style={[styles.xLabel, { left: x - 22 }]}>
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
    marginBottom: theme.spacing.xs,
    fontSize: 10,
    fontWeight: theme.typography.weight.semibold,
    letterSpacing: 0.07,
    textTransform: "uppercase",
    color: INK,
    textAlign: "center",
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
});
