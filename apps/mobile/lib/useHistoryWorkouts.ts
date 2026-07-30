import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkoutWithSessions } from "@exercise-tracker/shared-types";
import { getWorkout, listWorkouts } from "./api";

export function useHistoryWorkouts(accessToken: string) {
  const [workouts, setWorkouts] = useState<WorkoutWithSessions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingWorkoutId, setLoadingWorkoutId] = useState<string | null>(null);
  const workoutsRef = useRef(workouts);
  workoutsRef.current = workouts;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const listed = await listWorkouts(accessToken);
        // Table needs session fields (sports/metrics); hydrate details up front.
        const details = await Promise.all(
          listed.map(async (workout) => {
            try {
              return await getWorkout(accessToken, workout.id);
            } catch {
              return { ...workout, sessions: [] } satisfies WorkoutWithSessions;
            }
          })
        );
        if (!cancelled) setWorkouts(details);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load workouts");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  /** Fill in a workout that somehow landed without sessions (partial list failure). */
  const ensureWorkoutLoaded = useCallback(
    async (workoutId: string) => {
      const existing = workoutsRef.current.find((w) => w.id === workoutId);
      if (existing && existing.sessions.length > 0) return;

      setLoadingWorkoutId(workoutId);
      try {
        const detail = await getWorkout(accessToken, workoutId);
        setWorkouts((prev) => prev.map((w) => (w.id === workoutId ? detail : w)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workout");
      } finally {
        setLoadingWorkoutId(null);
      }
    },
    [accessToken]
  );

  return { workouts, loading, error, loadingWorkoutId, ensureWorkoutLoaded };
}
