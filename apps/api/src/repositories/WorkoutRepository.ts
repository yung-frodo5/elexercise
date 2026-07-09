import type { Workout, NewWorkout, WorkoutUpdate } from "@exercise-tracker/shared-types";

/**
 * Storage-agnostic contract for workout persistence.
 *
 * Route handlers and business logic depend ONLY on this interface, never on
 * a concrete implementation. Swapping CsvWorkoutRepository for
 * PostgresWorkoutRepository later should require changing exactly one line
 * (the place where the repository is instantiated) and nothing else.
 */
export interface WorkoutRepository {
  getWorkouts(userId: string): Promise<Workout[]>;
  getWorkoutById(id: string): Promise<Workout | null>;
  addWorkout(workout: NewWorkout): Promise<Workout>;
  updateWorkout(id: string, updates: WorkoutUpdate): Promise<Workout>;
  deleteWorkout(id: string): Promise<void>;
}

export class WorkoutNotFoundError extends Error {
  constructor(id: string) {
    super(`Workout not found: ${id}`);
    this.name = "WorkoutNotFoundError";
  }
}
