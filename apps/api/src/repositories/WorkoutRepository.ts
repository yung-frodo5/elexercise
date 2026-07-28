import type {
  Machine,
  Session,
  SessionDetails,
  Workout,
  WorkoutWithSessions,
} from "@exercise-tracker/shared-types";

/**
 * Storage-agnostic contract for the Machine/Workout/Session model.
 *
 * Every method that touches a specific workout/session takes `userId` and
 * scopes the query by it — the concrete implementation may run on a
 * privileged connection (e.g. a service-role key that bypasses RLS), so
 * ownership has to be enforced here explicitly rather than assumed.
 */
export interface WorkoutRepository {
  getMachineByScanToken(scanToken: string): Promise<Machine | null>;

  // Starts (or attaches to) an in-progress workout for the user and creates
  // a machine-sourced session on it. Only one session is ever open at a
  // time, so this ends whatever session was previously in_progress first.
  // Machines are also exclusive across users: if someone else has an
  // active session on this machine, it gets ended too (their session only
  // — not their workout, which they might resume manually). closedSessionIds
  // lists every session this call just ended (the caller's own previous
  // session, and/or another user's session on the same machine), so callers
  // can react to those sessions no longer being in_progress.
  startMachineSession(
    userId: string,
    scanToken: string
  ): Promise<{ workout: Workout; session: Session; closedSessionIds?: string[] }>;

  // Starts (or attaches to) an in-progress workout for the user and creates
  // a manually-logged session on it. Only one session is ever open at a
  // time, so this ends whatever session was previously in_progress first.
  startManualSession(
    userId: string,
    activityType: string
  ): Promise<{ workout: Workout; session: Session; closedSessionIds?: string[] }>;

  // details is optional freeform data (duration, weight, reps, etc.) —
  // usually only known once the activity is actually done.
  endSession(userId: string, sessionId: string, details?: SessionDetails): Promise<Session>;

  // Also ends any of the workout's sessions that are still in_progress —
  // implementations must not leave a "completed" workout with a session
  // stuck in_progress. closedSessionIds lists those sessions.
  endWorkout(userId: string, workoutId: string): Promise<Workout & { closedSessionIds?: string[] }>;

  getCurrentWorkout(userId: string): Promise<Workout | null>;

  getWorkoutById(userId: string, workoutId: string): Promise<WorkoutWithSessions | null>;

  listWorkouts(userId: string): Promise<Workout[]>;

  // Plain storage write for one telemetry point. Used both by the fake
  // telemetry simulator today and, eventually, by real hardware ingestion —
  // this method itself has no idea which one called it.
  insertPowerSample(sessionId: string, tMs: number, powerW: number): Promise<void>;
}

export class MachineNotFoundError extends Error {
  constructor(scanToken: string) {
    super(`Machine not found for scan token: ${scanToken}`);
    this.name = "MachineNotFoundError";
  }
}

export class WorkoutNotFoundError extends Error {
  constructor(id: string) {
    super(`Workout not found: ${id}`);
    this.name = "WorkoutNotFoundError";
  }
}

export class SessionNotFoundError extends Error {
  constructor(id: string) {
    super(`Session not found: ${id}`);
    this.name = "SessionNotFoundError";
  }
}
