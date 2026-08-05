"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Workout } from "@exercise-tracker/shared-types";
import { getCurrentWorkout, listWorkouts } from "./api";

type WorkoutSummaryState = {
  workouts: Workout[];
  currentWorkout: Workout | null;
  loading: boolean;
  workoutsError: string | null;
  currentWorkoutError: string | null;
  refresh: () => Promise<void>;
};

const WorkoutSummaryContext = createContext<WorkoutSummaryState | null>(null);

// Prefetches the lightweight workout list/current-workout as soon as the
// (app) layout confirms a real session, so Track and Workout Log both start
// with hotloaded data instead of each fetching independently on visit. Only
// mounted after that layout's own loading/redirect guard passes, so
// `session` here is always real -- never the transient null a page's own
// useSupabaseSession() call would see on its first render.
export function WorkoutSummaryProvider({ session, children }: { session: Session; children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [workoutsError, setWorkoutsError] = useState<string | null>(null);
  const [currentWorkoutError, setCurrentWorkoutError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    // Settled independently -- Track only needs currentWorkout and Workout
    // Log only needs workouts, so one endpoint failing (e.g. a stale token
    // racing a refresh) shouldn't blank out data the other page can still use.
    const [listedResult, currentResult] = await Promise.allSettled([
      listWorkouts(session.access_token),
      getCurrentWorkout(session.access_token),
    ]);

    if (listedResult.status === "fulfilled") {
      setWorkouts(listedResult.value);
      setWorkoutsError(null);
    } else {
      setWorkoutsError(listedResult.reason instanceof Error ? listedResult.reason.message : "Failed to load workouts");
    }

    if (currentResult.status === "fulfilled") {
      setCurrentWorkout(currentResult.value);
      setCurrentWorkoutError(null);
    } else {
      setCurrentWorkoutError(
        currentResult.reason instanceof Error ? currentResult.reason.message : "Failed to load current workout"
      );
    }

    setLoading(false);
  }, [session.access_token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <WorkoutSummaryContext.Provider
      value={{ workouts, currentWorkout, loading, workoutsError, currentWorkoutError, refresh }}
    >
      {children}
    </WorkoutSummaryContext.Provider>
  );
}

export function useWorkoutSummaries() {
  const ctx = useContext(WorkoutSummaryContext);
  if (!ctx) throw new Error("useWorkoutSummaries must be used within a WorkoutSummaryProvider");
  return ctx;
}
