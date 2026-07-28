import type { WorkoutWithSessions } from "@exercise-tracker/shared-types";

export interface AggregatedWorkoutStats {
  avgPowerW?: number;
  peakPowerW?: number;
  totalEnergyJoules?: number;
  durationS: number;
}

// Energy and peak come from whichever sessions already have computed stats
// (naturally excludes any still-in_progress session — those never get
// stats until they close). Duration comes from the workout's own
// started_at/ended_at (or "now" while still in_progress) rather than
// summing session durations, so it naturally includes rest periods between
// sessions instead of just their active time.
export function aggregateWorkoutStats(workout: WorkoutWithSessions): AggregatedWorkoutStats {
  const withStats = workout.sessions.filter((s) => s.totalEnergyJoules !== undefined);

  const totalEnergyJoules =
    withStats.length > 0 ? withStats.reduce((sum, s) => sum + (s.totalEnergyJoules ?? 0), 0) : undefined;
  const peakPowerW = withStats.length > 0 ? Math.max(...withStats.map((s) => s.peakPowerW ?? 0)) : undefined;

  const endedAtMs = workout.endedAt ? new Date(workout.endedAt).getTime() : Date.now();
  const durationS = Math.round((endedAtMs - new Date(workout.startedAt).getTime()) / 1000);

  // Energy = power x time, so this is the physically consistent way to
  // derive average power over the whole workout — including rest — rather
  // than averaging the per-session averages.
  const avgPowerW = totalEnergyJoules !== undefined && durationS > 0 ? totalEnergyJoules / durationS : undefined;

  return { avgPowerW, peakPowerW, totalEnergyJoules, durationS };
}
