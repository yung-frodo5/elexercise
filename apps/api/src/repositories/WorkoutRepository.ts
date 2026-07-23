import type { Machine, Session, Workout, WorkoutWithSessions } from "@exercise-tracker/shared-types";

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
  // a machine-sourced session on it.
  startMachineSession(
    userId: string,
    scanToken: string
  ): Promise<{ workout: Workout; session: Session }>;

  // Starts (or attaches to) an in-progress workout for the user and creates
  // a manually-logged session on it.
  startManualSession(
    userId: string,
    activityType: string
  ): Promise<{ workout: Workout; session: Session }>;

  endSession(userId: string, sessionId: string): Promise<Session>;

  // Also ends any of the workout's sessions that are still in_progress —
  // implementations must not leave a "completed" workout with a session
  // stuck in_progress.
  endWorkout(userId: string, workoutId: string): Promise<Workout>;

  getCurrentWorkout(userId: string): Promise<Workout | null>;

  getWorkoutById(userId: string, workoutId: string): Promise<WorkoutWithSessions | null>;

  listWorkouts(userId: string): Promise<Workout[]>;
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
