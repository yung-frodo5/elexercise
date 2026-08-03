import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import type { Session, WorkoutWithSessions } from "@exercise-tracker/shared-types";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import {
  activityColorForSport,
  formatDuration,
  formatDurationHms,
  formatEnergy,
  formatPowerW,
  formatWorkoutDate,
  sessionDurationS,
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

function ActivitySubRow({
  session,
  color,
  selected,
  onToggle,
}: {
  session: Session;
  color: string;
  selected: boolean;
  onToggle: () => void;
}) {
  const label = session.activityType || "Activity";
  const energy =
    session.totalEnergyJoules !== undefined ? formatEnergy(session.totalEnergyJoules) : "—";

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={
        selected ? `Hide ${label} on chart` : `Show ${label} on chart`
      }
      style={[styles.subRow, { opacity: selected ? 1 : 0.45 }]}
    >
      <View style={styles.subHead}>
        <View style={[styles.toggle, { backgroundColor: selected ? color : "transparent", borderColor: color }]} />
        <Text style={styles.subLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <View style={styles.metrics}>
        <View style={styles.metricCell}>
          <Text style={styles.metricLabel}>Time</Text>
          <Text style={styles.subValue} numberOfLines={1}>
            {formatDurationHms(sessionDurationS(session))}
          </Text>
        </View>
        <View style={styles.metricCell}>
          <Text style={styles.metricLabel}>Energy</Text>
          <Text style={styles.subValue} numberOfLines={1}>
            {energy}
          </Text>
        </View>
        <View style={styles.metricCell}>
          <Text style={styles.metricLabel}>Avg power</Text>
          <Text style={styles.subValue} numberOfLines={1}>
            {formatPowerW(session.avgPowerW)}
          </Text>
        </View>
        <View style={styles.metricCell}>
          <Text style={styles.metricLabel}>Peak power</Text>
          <Text style={styles.subValue} numberOfLines={1}>
            {formatPowerW(session.peakPowerW)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
  const padX = rowPadX(useWindowDimensions().width);
  const sessionKey = workout.sessions.map((s) => `${s.id}:${s.activityType ?? ""}`).join("|");
  const [selectedIds, setSelectedIds] = useState(() => new Set(workout.sessions.map((s) => s.id)));

  const title = workoutTitle(workout);
  const sports = workoutSports(workout);
  const energyJ = workoutEnergyJ(workout);
  const values = {
    time: formatDuration(workoutDurationS(workout)),
    energy: energyJ !== undefined ? formatEnergy(energyJ) : "—",
    avg: formatPowerW(workoutAvgPowerW(workout)),
    peak: formatPowerW(workoutPeakPowerW(workout)),
  };
  const statusLabel = workout.status === "completed" ? null : "In progress";

  const colorBySessionId: Record<string, string> = {};
  for (const s of workout.sessions) {
    colorBySessionId[s.id] = activityColorForSport(s.activityType || "Activity");
  }

  const { series, loading: powerLoading, error: powerError } = useWorkoutPowerSeries(
    open ? workout : null
  );
  const chartSeries = series.map((s) => ({
    session: s.session,
    timelineSamples: s.timelineSamples,
    color: colorBySessionId[s.session.id] ?? theme.colors.secondaryGreen,
  }));

  useEffect(() => {
    setSelectedIds(new Set(workout.sessions.map((s) => s.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberately keyed on workout.id/sessionKey (stable primitives), not workout.sessions, so a new array reference with unchanged content doesn't retrigger the reset
  }, [workout.id, sessionKey]);

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
            <View key={key} style={styles.metricCell}>
              <Text style={styles.metricLabel}>{label}</Text>
              <Text style={styles.metricValue} numberOfLines={1}>
                {values[key]}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      {open && (
        <View style={[styles.expand, { paddingHorizontal: padX }]}>
          {workout.sessions.map((session: Session) => (
            <ActivitySubRow
              key={session.id}
              session={session}
              color={colorBySessionId[session.id] ?? theme.colors.secondaryGreen}
              selected={selectedIds.has(session.id)}
              onToggle={() => toggleActivity(session.id)}
            />
          ))}
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
    paddingBottom: theme.spacing.md,
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
    fontSize: theme.typography.size.sm,
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
  subRow: {
    paddingVertical: theme.spacing.sm,
    paddingLeft: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: withAlpha(INK, 0.12),
    gap: theme.spacing.xs,
    backgroundColor: withAlpha(INK, 0.03),
    borderRadius: theme.radii.sm,
  },
  subHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  subLabel: {
    flex: 1,
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.medium,
    color: INK,
  },
  subValue: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold,
    color: INK,
    fontVariant: ["tabular-nums"],
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
    fontSize: theme.typography.size.sm,
    paddingVertical: theme.spacing.sm,
  },
});
