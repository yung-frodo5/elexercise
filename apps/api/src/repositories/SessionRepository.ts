import type { Machine, Session, SessionWorkout } from "@exercise-tracker/shared-types";

/**
 * Storage-agnostic contract for the Machine/Workout/Session model.
 *
 * Deliberately separate from `WorkoutRepository` — that interface is tied to
 * the CSV-era flat `Workout`/`ExerciseSet` shape (see server.ts's commented
 * -out `PostgresWorkoutRepository` placeholder, which is reserved for a
 * same-shape swap of that model). This interface exists alongside it, not in
 * place of it.
 *
 * Method surface is intentionally minimal — enough to exercise the schema,
 * not a full implementation of every endpoint in the Phone API sketch.
 */
export interface SessionRepository {
  getMachineByScanToken(scanToken: string): Promise<Machine | null>;

  // Starts (or attaches to) an in-progress workout for the user and creates
  // a machine-sourced session on it.
  startMachineSession(
    userId: string,
    scanToken: string
  ): Promise<{ workout: SessionWorkout; session: Session }>;

  // Starts (or attaches to) an in-progress workout for the user and creates
  // a manually-logged session on it.
  startManualSession(
    userId: string,
    activityType: string
  ): Promise<{ workout: SessionWorkout; session: Session }>;

  endSession(sessionId: string): Promise<Session>;

  getCurrentWorkout(userId: string): Promise<SessionWorkout | null>;

  getWorkoutById(workoutId: string): Promise<(SessionWorkout & { sessions: Session[] }) | null>;
}

export class MachineNotFoundError extends Error {
  constructor(scanToken: string) {
    super(`Machine not found for scan token: ${scanToken}`);
    this.name = "MachineNotFoundError";
  }
}

export class SessionWorkoutNotFoundError extends Error {
  constructor(id: string) {
    super(`Workout not found: ${id}`);
    this.name = "SessionWorkoutNotFoundError";
  }
}

export class SessionNotFoundError extends Error {
  constructor(id: string) {
    super(`Session not found: ${id}`);
    this.name = "SessionNotFoundError";
  }
}
