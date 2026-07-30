"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session, WorkoutWithSessions } from "@exercise-tracker/shared-types";
import { fetchPowerSamples } from "./fetchPowerSamples";
import type { PowerSamplePoint } from "./usePowerSamples";

export type SessionPowerSeries = {
  session: Session;
  samples: PowerSamplePoint[];
  /** Samples shifted onto the shared workout timeline (ms from workout start). */
  timelineSamples: PowerSamplePoint[];
};

function offsetForSession(workout: WorkoutWithSessions, session: Session): number {
  return new Date(session.startedAt).getTime() - new Date(workout.startedAt).getTime();
}

/** Load power samples for every session in a workout, aligned to one timeline. */
export function useWorkoutPowerSeries(workout: WorkoutWithSessions | null): {
  series: SessionPowerSeries[];
  loading: boolean;
  error: string | null;
} {
  const [bySessionId, setBySessionId] = useState<Record<string, PowerSamplePoint[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionKey = workout?.sessions.map((s) => s.id).join("|") ?? "";
  const workoutId = workout?.id ?? "";

  useEffect(() => {
    if (!workout) {
      setBySessionId({});
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    const current = workout;

    void (async () => {
      try {
        const entries = await Promise.all(
          current.sessions.map(async (session) => {
            const samples = await fetchPowerSamples(session.id);
            return [session.id, samples] as const;
          })
        );
        if (cancelled) return;
        setBySessionId(Object.fromEntries(entries));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load power samples");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [workoutId, sessionKey]);

  const series = useMemo(() => {
    if (!workout) return [];
    return workout.sessions.map((session) => {
      const samples = bySessionId[session.id] ?? [];
      const offset = offsetForSession(workout, session);
      return {
        session,
        samples,
        timelineSamples: samples.map((p) => ({ tMs: p.tMs + offset, powerW: p.powerW })),
      } satisfies SessionPowerSeries;
    });
  }, [workout, bySessionId]);

  return { series, loading, error };
}
