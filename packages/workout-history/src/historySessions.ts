import type { Session, WorkoutWithSessions } from "@exercise-tracker/shared-types";

export type HistorySortKey =
  | "title"
  | "date"
  | "sport"
  | "time"
  | "energy"
  | "avgPower"
  | "peakPower";
export type HistorySortDir = "asc" | "desc";

/** Web table headers; sort keys are shared by both apps. */
export const HISTORY_COLUMNS: {
  label: string;
  key: HistorySortKey;
  align?: "left" | "right";
}[] = [
  { label: "Title", key: "title" },
  { label: "Date", key: "date" },
  { label: "Workout", key: "sport" },
  { label: "Time", key: "time", align: "right" },
  { label: "Energy", key: "energy", align: "right" },
  { label: "Avg. power", key: "avgPower", align: "right" },
  { label: "Peak power", key: "peakPower", align: "right" },
];

export const HISTORY_COL_COUNT = HISTORY_COLUMNS.length;

export function sessionDurationS(session: Session): number {
  if (session.durationS !== undefined) return Math.max(0, session.durationS);
  if (!session.endedAt) return 0;
  return Math.max(
    0,
    Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000)
  );
}

/** Wall-clock from workout timestamps when present; otherwise sum of session durations. */
export function workoutDurationS(workout: WorkoutWithSessions): number {
  if (workout.endedAt) {
    return Math.max(
      0,
      Math.round((new Date(workout.endedAt).getTime() - new Date(workout.startedAt).getTime()) / 1000)
    );
  }
  return workout.sessions.reduce((sum, s) => sum + sessionDurationS(s), 0);
}

/** Sum of session energy fields that are present. */
export function workoutEnergyJ(workout: WorkoutWithSessions): number | undefined {
  let sum = 0;
  let any = false;
  for (const s of workout.sessions) {
    if (s.totalEnergyJoules === undefined) continue;
    sum += s.totalEnergyJoules;
    any = true;
  }
  return any ? sum : undefined;
}

/**
 * Prefer a single session's stored avgPowerW.
 * If multiple sessions contribute energy + duration, use total energy / total duration
 * (same definition the API uses for a session).
 */
export function workoutAvgPowerW(workout: WorkoutWithSessions): number | undefined {
  if (workout.sessions.length === 1) return workout.sessions[0]?.avgPowerW;
  const energy = workoutEnergyJ(workout);
  const duration = workout.sessions.reduce((sum, s) => sum + sessionDurationS(s), 0);
  if (energy !== undefined && duration > 0) return energy / duration;
  return undefined;
}

/** Max of session peak values that are present. */
export function workoutPeakPowerW(workout: WorkoutWithSessions): number | undefined {
  let peak: number | undefined;
  for (const s of workout.sessions) {
    if (s.peakPowerW === undefined) continue;
    peak = peak === undefined ? s.peakPowerW : Math.max(peak, s.peakPowerW);
  }
  return peak;
}

export function workoutSports(workout: WorkoutWithSessions): string[] {
  const seen = new Set<string>();
  const sports: string[] = [];
  for (const s of workout.sessions) {
    const type = s.activityType?.trim();
    if (!type || seen.has(type)) continue;
    seen.add(type);
    sports.push(type);
  }
  return sports;
}

export function workoutTitle(workout: WorkoutWithSessions): string {
  const sports = workoutSports(workout);
  if (sports.length === 0) return "Workout";
  return sports.join(" · ");
}

export function uniqueWorkoutActivityTypes(workouts: WorkoutWithSessions[]): string[] {
  const types = new Set<string>();
  for (const w of workouts) {
    for (const sport of workoutSports(w)) types.add(sport);
  }
  return [...types].sort((a, b) => a.localeCompare(b));
}

function sortValue(workout: WorkoutWithSessions, key: HistorySortKey): string | number {
  switch (key) {
    case "title":
      return workoutTitle(workout).toLowerCase();
    case "sport":
      return workoutSports(workout).join(" ").toLowerCase();
    case "date":
      return new Date(workout.startedAt).getTime();
    case "time":
      return workoutDurationS(workout);
    case "energy":
      return workoutEnergyJ(workout) ?? -1;
    case "avgPower":
      return workoutAvgPowerW(workout) ?? -1;
    case "peakPower":
      return workoutPeakPowerW(workout) ?? -1;
  }
}

export function filterAndSortHistoryWorkouts(
  workouts: WorkoutWithSessions[],
  {
    sports = [],
    keywords = "",
    sortKey,
    sortDir,
  }: {
    sports?: string[];
    keywords?: string;
    sortKey: HistorySortKey;
    sortDir: HistorySortDir;
  }
): WorkoutWithSessions[] {
  const q = keywords.trim().toLowerCase();
  const selected = new Set(sports);
  const filtered = workouts.filter((workout) => {
    const types = workoutSports(workout);
    if (selected.size > 0 && !types.some((t) => selected.has(t))) return false;
    if (!q) return true;
    const hay = `${workoutTitle(workout)} ${types.join(" ")}`.toLowerCase();
    return hay.includes(q);
  });

  const dir = sortDir === "asc" ? 1 : -1;
  return [...filtered].sort((a, b) => {
    const av = sortValue(a, sortKey);
    const bv = sortValue(b, sortKey);
    if (typeof av === "string" && typeof bv === "string") {
      return av.localeCompare(bv) * dir;
    }
    return ((av as number) - (bv as number)) * dir;
  });
}

export function nextSortState(
  currentKey: HistorySortKey,
  currentDir: HistorySortDir,
  nextKey: HistorySortKey
): { sortKey: HistorySortKey; sortDir: HistorySortDir } {
  if (currentKey === nextKey) {
    return { sortKey: currentKey, sortDir: currentDir === "asc" ? "desc" : "asc" };
  }
  return {
    sortKey: nextKey,
    sortDir: nextKey === "title" || nextKey === "sport" ? "asc" : "desc",
  };
}

export function toggleListItem(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}
