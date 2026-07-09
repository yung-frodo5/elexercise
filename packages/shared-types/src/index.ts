// Core domain types shared across api, web, and mobile.
// Changing a field here is a contract change for every app — bump thoughtfully.

export type ExerciseCategory =
  | "strength"
  | "cardio"
  | "mobility"
  | "other";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
}

export interface ExerciseSet {
  id: string;
  exerciseId: string;
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  rpe?: number; // rate of perceived exertion, 1-10
}

export interface Workout {
  id: string;
  userId: string;
  date: string; // ISO 8601 date string, e.g. "2026-07-09"
  notes?: string;
  sets: ExerciseSet[];
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

// Shape used when creating a workout — server assigns id/createdAt/updatedAt.
export type NewWorkout = Omit<Workout, "id" | "createdAt" | "updatedAt">;

// Partial update payload.
export type WorkoutUpdate = Partial<Omit<Workout, "id" | "userId">>;
