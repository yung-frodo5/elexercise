import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import type { Session, WorkoutWithSessions } from "@exercise-tracker/shared-types";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import {
  activityColorForSport,
  formatDuration,
  formatEnergy,
  formatPowerW,
  formatWorkoutDate,
  workoutAvgPowerW,
  workoutDurationS,
  workoutEnergyJ,
  workoutPeakPowerW,
  workoutSports,
  workoutTitle,
} from "@exercise-tracker/workout-history";
import { useWorkoutPowerSeries } from "../../lib/useWorkoutPowerSeries";
import { SportTag } from "../ui/SportTag";
import { MultiPowerChart } from "./MultiPowerChart";

/** Match web history ink after design overhaul (navy on white). */
const INK = theme.colors.navy;

const METRICS = [
  { key: "time", label: "Time" },
  { key: "energy", label: "Energy" },
  { key: "avg", label: "Avg power" },
  { key: "peak", label: "Peak power" },
] as const;

function rowPadX(width: number): number {
  if (width < 360) return theme.spacing.md;
  if (width < 400) return theme.spacing.lg;
  if (width < 768) return theme.spacing.xl;
  return theme.spacing.xxl;
}

function ActivityToggle({
  color,
  on,
  onToggle,
  label,
}: {
  color: string;
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel={on ? `Hide ${label} on chart` : `Show ${label} on chart`}
      hitSlop={4}
      style={[styles.activityChip, { opacity: on ? 1 : 0.45 }]}
    >
      <View
        style={[
          styles.toggle,
          {
            backgroundColor: on ? color : "transparent",
            borderColor: color,
          },
        ]}
      />
      <Text style={styles.activityChipLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCell}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function WorkoutHistoryRow({
  workout,
  loading,
  open,
  onToggle,
}: {
  workout: WorkoutWithSessions;
  loading: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const { width } = useWindowDimensions();
  const padX = rowPadX(width);
  const sessionMetaKey = workout.sessions
    .map((s) => `${s.id}:${s.activityType ?? ""}`)
    .join("|");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(workout.sessions.map((s) => s.id))
  );

  const title = workoutTitle(workout);
  const sports = workoutSports(workout);
  const durationS = workoutDurationS(workout);
  const energyJ = workoutEnergyJ(workout);
  const avgPowerW = workoutAvgPowerW(workout);
  const peakPowerW = workoutPeakPowerW(workout);
  const statusLabel = workout.status === "completed" ? null : "In progress";

  const values = {
    time: formatDuration(durationS),
    energy: energyJ !== undefined ? formatEnergy(energyJ) : "—",
    avg: formatPowerW(avgPowerW),
    peak: formatPowerW(peakPowerW),
  };

  const colorBySessionId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of workout.sessions) {
      map[s.id] = activityColorForSport(s.activityType || "Activity");
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by sessionMetaKey
  }, [sessionMetaKey]);

  const { series, loading: powerLoading, error: powerError } = useWorkoutPowerSeries(
    open ? workout : null
  );

  const chartSeries = useMemo(
    () =>
      series.map((s) => ({
        session: s.session,
        timelineSamples: s.timelineSamples,
        color: colorBySessionId[s.session.id] ?? theme.colors.secondaryGreen,
      })),
    [series, colorBySessionId]
  );

  useEffect(() => {
    setSelectedIds(new Set(workout.sessions.map((s) => s.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by sessionMetaKey
  }, [workout.id, sessionMetaKey]);

  function toggleActivity(sessionId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.75}
        style={[styles.item, { paddingHorizontal: padX }]}
      >
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {/* Date + full sport word tags */}
        <View style={styles.metaRow}>
          <Text style={styles.metaDate}>{formatWorkoutDate(workout.startedAt)}</Text>
          {sports.map((s) => (
            <SportTag key={s} label={s} compact />
          ))}
          {statusLabel || loading ? (
            <Text style={styles.metaStatus}>
              {statusLabel}
              {loading ? " · Loading…" : null}
            </Text>
          ) : null}
        </View>

        <View style={styles.metrics}>
          {METRICS.map(({ key, label }) => (
            <MetricCell key={key} label={label} value={values[key]} />
          ))}
        </View>
      </TouchableOpacity>

      {/* One expand panel: activity toggles + chart (no nested metric boxes). */}
      {open && (
        <View style={[styles.expand, { paddingHorizontal: padX }]}>
          {workout.sessions.length > 0 && (
            <View style={styles.activityRow}>
              {workout.sessions.map((session: Session) => (
                <ActivityToggle
                  key={session.id}
                  color={colorBySessionId[session.id] ?? theme.colors.secondaryGreen}
                  on={selectedIds.has(session.id)}
                  label={session.activityType || "Activity"}
                  onToggle={() => toggleActivity(session.id)}
                />
              ))}
            </View>
          )}
          {powerError ? (
            <Text style={styles.chartMsg}>Couldn't load power: {powerError}</Text>
          ) : powerLoading ? (
            <Text style={styles.chartMsg}>Loading power profile…</Text>
          ) : (
            <MultiPowerChart series={chartSeries} selectedIds={selectedIds} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: withAlpha(INK, 0.12),
  },
  item: {
    width: "100%",
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: INK,
    letterSpacing: -0.02,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  metaDate: {
    fontSize: theme.typography.size.xs,
    color: withAlpha(INK, 0.7),
  },
  metaStatus: {
    fontSize: 10,
    color: withAlpha(INK, 0.65),
  },
  metrics: {
    flexDirection: "row",
    marginTop: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  metricCell: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: withAlpha(INK, 0.6),
  },
  metricValue: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: INK,
    fontVariant: ["tabular-nums"],
  },
  expand: {
    width: "100%",
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  activityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  activityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activityChipLabel: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.medium,
    color: INK,
  },
  toggle: {
    width: 12,
    height: 12,
    borderRadius: theme.radii.sm,
    borderWidth: 2,
  },
  chartMsg: {
    color: INK,
    textAlign: "center",
    fontSize: theme.typography.size.xs,
    paddingVertical: theme.spacing.sm,
  },
});
