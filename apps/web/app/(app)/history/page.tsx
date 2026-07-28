"use client";

import { useCallback, useEffect, useState } from "react";
import type { Workout, WorkoutWithSessions } from "@exercise-tracker/shared-types";
import { theme } from "@exercise-tracker/design-tokens";
import { useSupabaseSession } from "../../../lib/useSession";
import { getWorkout, listWorkouts } from "../../../lib/api";
import { aggregateWorkoutStats } from "../../../lib/aggregateWorkoutStats";
import { CondensedStats } from "../../../components/workout/CondensedStats";
import { SessionLogList } from "../../../components/workout/SessionLogList";

export default function HistoryPage() {
  const { session } = useSupabaseSession();

  const [history, setHistory] = useState<Workout[]>([]);
  const [expanded, setExpanded] = useState<Record<string, WorkoutWithSessions | undefined>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session) return;
    try {
      const all = await listWorkouts(session.access_token);
      setHistory(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workouts");
    } finally {
      // Same cold-start-aware loading state as /track — see that page for why.
      setDataLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function toggleExpand(workoutId: string) {
    if (!session) return;
    if (expanded[workoutId]) {
      setExpanded((prev) => ({ ...prev, [workoutId]: undefined }));
      return;
    }
    const detail = await getWorkout(session.access_token, workoutId);
    setExpanded((prev) => ({ ...prev, [workoutId]: detail }));
  }

  if (dataLoading) {
    return (
      <main style={{ padding: theme.spacing.xl }}>
        <p>Loading your workouts…</p>
        <p style={{ color: theme.colors.textMuted, fontSize: theme.typography.size.sm }}>
          First load can take up to 30 seconds if the API has been idle.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: theme.spacing.xl, maxWidth: 480 }}>
      <h1>History</h1>

      {error && <p style={{ color: theme.colors.error }}>{error}</p>}

      <section style={{ marginTop: theme.spacing.lg }}>
        {history.length === 0 ? (
          <p>No past workouts yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {history.map((w) => {
              const detail = expanded[w.id];
              return (
                <li
                  key={w.id}
                  style={{ borderBottom: `1px solid ${theme.colors.border}`, padding: `${theme.spacing.sm}px 0` }}
                >
                  <button
                    onClick={() => void toggleExpand(w.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}
                  >
                    {new Date(w.startedAt).toLocaleString()} — {w.status}
                  </button>
                  {detail && (
                    <>
                      <div style={{ marginTop: theme.spacing.xs }}>
                        <CondensedStats {...aggregateWorkoutStats(detail)} />
                      </div>
                      <SessionLogList sessions={detail.sessions} />
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
