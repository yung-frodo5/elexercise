// Core domain types shared across api, web, and mobile.
// Changing a field here is a contract change for every app — bump thoughtfully.
//
// Machine/Workout/Session/PowerSample model for power-generating exercise
// equipment. SQL tables live in supabase/migrations/0002_machine_session_schema.sql.

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

export type WorkoutStatus = "in_progress" | "completed";

export interface Workout {
  id: string;
  userId: string;
  startedAt: string; // ISO 8601 timestamp
  endedAt?: string; // ISO 8601 timestamp
  status: WorkoutStatus;
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

// A workout with its sessions attached — the shape returned by GET /workouts/:id.
export type WorkoutWithSessions = Workout & { sessions: Session[] };
