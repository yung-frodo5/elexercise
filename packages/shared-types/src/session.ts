// Machine/Workout/Session/PowerSample model for power-generating exercise
// equipment. This is additive groundwork alongside the CSV-backed MVP model
// in index.ts (Workout/ExerciseSet) — the two are unrelated in storage today.
//
// NOTE ON NAMING: the SQL table is just `workouts`, matching the domain
// language used by the Phone API (GET /workouts, etc). The TS type here is
// named `SessionWorkout` instead of `Workout` purely to avoid colliding with
// the existing CSV-era `Workout` type exported from index.ts — it is not a
// different SQL entity, just a distinctly-named TS type sharing a package.

export type MachineStatus = "available" | "in_use" | "offline";

export interface Machine {
  id: string;
  type: string;
  model: string;
  serial: string;
  scanToken: string;
  status: MachineStatus;
  lastSeenAt?: string; // ISO 8601 timestamp
}

export type SessionWorkoutStatus = "in_progress" | "completed";

export interface SessionWorkout {
  id: string;
  userId: string;
  startedAt: string; // ISO 8601 timestamp
  endedAt?: string; // ISO 8601 timestamp
  status: SessionWorkoutStatus;
  createdAt: string; // ISO 8601 timestamp
}

export type SessionSource = "machine" | "manual";
export type SessionStatus = "in_progress" | "completed";

export interface Session {
  id: string;
  workoutId: string;
  machineId?: string; // present only when source === "machine"
  source: SessionSource;
  activityType: string;
  startedAt: string; // ISO 8601 timestamp
  endedAt?: string; // ISO 8601 timestamp
  status: SessionStatus;
  avgPowerW?: number;
  peakPowerW?: number;
  totalEnergyJoules?: number;
  durationS?: number;
}

export interface PowerSample {
  sessionId: string;
  tMs: number;
  powerW: number;
}
