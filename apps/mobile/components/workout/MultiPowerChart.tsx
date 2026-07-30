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

const MOBILE_MAX_POINTS = 120;
const Y_TITLE_W = 18;
const TICK_W = 36;
const PAD = { top: 10, right: 8, bottom: 28 };
const CHART_H = 180;
const INK = theme.colors.navy;

/** Multi-activity power chart — same domain rules as web MultiPowerChart. */
export function MultiPowerChart({
  series,
  selectedIds,
}: {
  series: SeriesInput[];
  selectedIds: ReadonlySet<string>;
}) {
  const [plotWidth, setPlotWidth] = useState(0);
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
      const samples = downsamplePowerSamples(s.timelineSamples, MOBILE_MAX_POINTS);
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

  const plotH = Math.max(10, CHART_H - PAD.top - PAD.bottom);
  const xRange = Math.max(1, model.xMax - model.xMin);
  const yTicks = [0, 0.5, 1].map((f) => Math.round(f * model.yMax));
  const xTickCount = Math.max(2, Math.min(5, Math.floor(plotWidth / 64)));
  const xTicks = Array.from({ length: xTickCount }, (_, i) =>
    model.xMin + (i / (xTickCount - 1)) * xRange
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Power Output</Text>
      <View style={[styles.chartRow, { height: CHART_H }]}>
        {/* Dedicated strip so "Watts" never shares space with tick numbers. */}
        <View style={styles.yTitleCol}>
          <Text style={styles.yTitle}>Watts</Text>
        </View>

        <View style={styles.tickCol}>
          {yTicks.map((w) => {
            const y = PAD.top + (1 - w / model.yMax) * plotH;
            return (
              <Text key={w} style={[styles.tickLabel, { top: y - 6 }]}>
                {w}
              </Text>
            );
          })}
        </View>

        <View
          style={styles.plot}
          onLayout={(e) => setPlotWidth(e.nativeEvent.layout.width)}
        >
          {plotWidth > 0 &&
            yTicks.map((w) => {
              const y = PAD.top + (1 - w / model.yMax) * plotH;
              return (
                <View
                  key={w}
                  style={[styles.gridLine, { top: y, width: plotWidth - PAD.right }]}
                />
              );
            })}

          {plotWidth > 0 &&
            xTicks.map((tMs) => {
              const x = ((tMs - model.xMin) / xRange) * (plotWidth - PAD.right);
              return (
                <Text key={tMs} style={[styles.xLabel, { left: x - 22 }]}>
                  {formatDuration(tMs / 1000)}
                </Text>
              );
            })}

          {plotWidth > 0 &&
            model.prepared.map((s) =>
              s.samples.slice(0, -1).map((p, i) => {
                const next = s.samples[i + 1]!;
                const usableW = plotWidth - PAD.right;
                const x1 = ((p.tMs - model.xMin) / xRange) * usableW;
                const y1 = PAD.top + (1 - p.powerW / model.yMax) * plotH;
                const x2 = ((next.tMs - model.xMin) / xRange) * usableW;
                const y2 = PAD.top + (1 - next.powerW / model.yMax) * plotH;
                const dx = x2 - x1;
                const dy = y2 - y1;
                const len = Math.sqrt(dx * dx + dy * dy);
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

          <Text style={styles.xTitle}>Time</Text>
        </View>
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
    paddingBottom: theme.spacing.xs,
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
  chartRow: {
    flexDirection: "row",
    width: "100%",
  },
  yTitleCol: {
    width: Y_TITLE_W,
    alignItems: "center",
    justifyContent: "center",
  },
  yTitle: {
    width: CHART_H - 40,
    fontSize: 9,
    color: withAlpha(INK, 0.75),
    textAlign: "center",
    transform: [{ rotate: "-90deg" }],
  },
  tickCol: {
    width: TICK_W,
    position: "relative",
  },
  tickLabel: {
    position: "absolute",
    right: 4,
    width: TICK_W - 4,
    fontSize: 9,
    color: INK,
    textAlign: "right",
  },
  plot: {
    flex: 1,
    minWidth: 0,
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: withAlpha(INK, 0.2),
  },
  xLabel: {
    position: "absolute",
    top: CHART_H - 18,
    width: 44,
    textAlign: "center",
    fontSize: 9,
    color: INK,
  },
  xTitle: {
    position: "absolute",
    left: 0,
    right: PAD.right,
    bottom: 2,
    textAlign: "center",
    fontSize: 9,
    color: withAlpha(INK, 0.75),
  },
});
