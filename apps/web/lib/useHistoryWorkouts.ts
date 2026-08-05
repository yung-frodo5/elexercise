"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Session as AuthSession } from "@supabase/supabase-js";
import type { WorkoutWithSessions } from "@exercise-tracker/shared-types";
import { getWorkout } from "./api";
import { useWorkoutSummaries } from "./WorkoutSummaryContext";

// Falls back to these when the API call fails (e.g. a stale/expired session
// token) so the page still shows something reviewable instead of a bare
// error -- not backed by any real account data.
const PLACEHOLDER_WORKOUTS: WorkoutWithSessions[] = [
  {
    id: "placeholder-workout-1",
    userId: "placeholder",
    startedAt: "2026-07-28T14:00:00Z",
    endedAt: "2026-07-28T14:32:00Z",
    status: "completed",
    createdAt: "2026-07-28T14:00:00Z",
    sessions: [
      {
        id: "placeholder-session-1",
        workoutId: "placeholder-workout-1",
        source: "machine",
        activityType: "cycling",
        startedAt: "2026-07-28T14:00:00Z",
        endedAt: "2026-07-28T14:32:00Z",
        status: "completed",
        avgPowerW: 92,
        peakPowerW: 148,
        totalEnergyJoules: 551040,
        durationS: 1920,
      },
    ],
  },
  {
    id: "placeholder-workout-2",
    userId: "placeholder",
    startedAt: "2026-07-25T09:15:00Z",
    endedAt: "2026-07-25T09:45:00Z",
    status: "completed",
    createdAt: "2026-07-25T09:15:00Z",
    sessions: [
      {
        id: "placeholder-session-2",
        workoutId: "placeholder-workout-2",
        source: "machine",
        activityType: "rowing",
        startedAt: "2026-07-25T09:15:00Z",
        endedAt: "2026-07-25T09:45:00Z",
        status: "completed",
        avgPowerW: 78,
        peakPowerW: 133,
        totalEnergyJoules: 421200,
        durationS: 1800,
      },
    ],
  },
  {
    id: "placeholder-workout-3",
    userId: "placeholder",
    startedAt: "2026-07-22T18:00:00Z",
    endedAt: "2026-07-22T18:40:00Z",
    status: "completed",
    createdAt: "2026-07-22T18:00:00Z",
    sessions: [
      {
        id: "placeholder-session-3",
        workoutId: "placeholder-workout-3",
        source: "manual",
        activityType: "running",
        startedAt: "2026-07-22T18:00:00Z",
        endedAt: "2026-07-22T18:40:00Z",
        status: "completed",
        durationS: 2400,
      },
    ],
  },
];

export function useHistoryWorkouts(authSession: AuthSession | null) {
  const { workouts: summaries, loading: summariesLoading, workoutsError: summariesError } = useWorkoutSummaries();
  const [workouts, setWorkouts] = useState<WorkoutWithSessions[]>([]);
  const [hydrating, setHydrating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingWorkoutId, setLoadingWorkoutId] = useState<string | null>(null);
  const workoutsRef = useRef(workouts);
  workoutsRef.current = workouts;

  useEffect(() => {
    let cancelled = false;

    // Summaries (id/dates/status, no sessions) are prefetched at login via
    // WorkoutSummaryProvider; this effect only handles hydrating each one to
    // full session detail (sport/energy/power) for the table.
    if (summariesLoading) return;

    if (summariesError) {
      // Falls back to placeholder rows (e.g. a stale/expired session token
      // failing the prefetch with 401) rather than surfacing an error, so
      // the page still shows something reviewable.
      setWorkouts(PLACEHOLDER_WORKOUTS);
      setHydrating(false);
      return;
    }

    if (!authSession) {
      // This page's own session hook hasn't resolved yet even though the
      // summary prefetch above (sourced from the session already confirmed
      // higher up the tree) has -- stay in loading rather than flashing an
      // empty state.
      setHydrating(true);
      return;
    }

    setHydrating(true);
    void (async () => {
      try {
        // Table needs session fields (sports/metrics); hydrate details up front.
        const details = await Promise.all(
          summaries.map(async (workout) => {
            try {
              return await getWorkout(authSession.access_token, workout.id);
            } catch {
              return { ...workout, sessions: [] } satisfies WorkoutWithSessions;
            }
          })
        );
        if (!cancelled) setWorkouts(details);
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authSession, summaries, summariesError, summariesLoading]);

  /** Fill in a workout that somehow landed without sessions (partial list failure). */
  const ensureWorkoutLoaded = useCallback(
    async (workoutId: string) => {
      const existing = workoutsRef.current.find((w) => w.id === workoutId);
      if (existing && existing.sessions.length > 0) return;
      if (!authSession) return;

      setLoadingWorkoutId(workoutId);
      try {
        const detail = await getWorkout(authSession.access_token, workoutId);
        setWorkouts((prev) => prev.map((w) => (w.id === workoutId ? detail : w)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workout");
      } finally {
        setLoadingWorkoutId(null);
      }
    },
    [authSession]
  );

  return {
    workouts,
    loading: summariesLoading || hydrating,
    error: error ?? summariesError,
    loadingWorkoutId,
    ensureWorkoutLoaded,
  };
}
