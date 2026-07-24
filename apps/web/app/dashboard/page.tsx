"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Workout, WorkoutWithSessions } from "@exercise-tracker/shared-types";
import { supabase } from "../../lib/supabase";
import { useSupabaseSession } from "../../lib/useSession";
import {
  endSession,
  endWorkout,
  getCurrentWorkout,
  getWorkout,
  listWorkouts,
  startMachineSession,
  startManualSession,
} from "../../lib/api";

const ACTIVITY_PRESETS = ["Run", "Bike", "Row", "Strength", "Walk"];

function StartActivityForm({
  onStart,
  busy,
}: {
  onStart: (activityType: string) => void;
  busy: boolean;
}) {
  const [other, setOther] = useState("");

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      {ACTIVITY_PRESETS.map((preset) => (
        <button key={preset} onClick={() => onStart(preset)} disabled={busy}>
          {preset}
        </button>
      ))}
      <input placeholder="Other…" value={other} onChange={(e) => setOther(e.target.value)} style={{ width: 120 }} />
      <button
        onClick={() => {
          if (!other.trim()) return;
          onStart(other.trim());
          setOther("");
        }}
        disabled={busy || !other.trim()}
      >
        Add
      </button>
    </div>
  );
}

function StartMachineForm({ onStart, busy }: { onStart: (scanToken: string) => void; busy: boolean }) {
  const [machineId, setMachineId] = useState("");

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
      <input
        placeholder="Machine ID"
        value={machineId}
        onChange={(e) => setMachineId(e.target.value)}
        style={{ width: 160 }}
      />
      <button
        onClick={() => {
          if (!machineId.trim()) return;
          onStart(machineId.trim());
          setMachineId("");
        }}
        disabled={busy || !machineId.trim()}
      >
        Connect
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { session, loading } = useSupabaseSession();
  const router = useRouter();

  const [currentWorkout, setCurrentWorkout] = useState<WorkoutWithSessions | null>(null);
  const [history, setHistory] = useState<Workout[]>([]);
  const [expanded, setExpanded] = useState<Record<string, WorkoutWithSessions | undefined>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) router.replace("/");
  }, [loading, session, router]);

  const refresh = useCallback(async () => {
    if (!session) return;
    try {
      const current = await getCurrentWorkout(session.access_token);
      setCurrentWorkout(current ? await getWorkout(session.access_token, current.id) : null);
      const all = await listWorkouts(session.access_token);
      setHistory(all.filter((w) => w.id !== current?.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workouts");
    } finally {
      // Only matters for the first load — the empty/start-a-workout state
      // is only accurate once we've actually heard back from the API. The
      // API can take 20-30s to respond on a cold start (Render free tier),
      // and without this, that whole window renders as "no workouts" /
      // "start a workout" — indistinguishable from a genuinely empty
      // account, which reads as broken/missing features rather than slow.
      setDataLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleStart(activityType: string) {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      await startManualSession(session.access_token, activityType);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start activity");
    } finally {
      setBusy(false);
    }
  }

  async function handleStartMachine(scanToken: string) {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      await startMachineSession(session.access_token, scanToken);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to machine");
    } finally {
      setBusy(false);
    }
  }

  async function handleStopSession(sessionId: string) {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      await endSession(session.access_token, sessionId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop activity");
    } finally {
      setBusy(false);
    }
  }

  async function handleEnd() {
    if (!session || !currentWorkout) return;
    setBusy(true);
    setError(null);
    try {
      await endWorkout(session.access_token, currentWorkout.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end workout");
    } finally {
      setBusy(false);
    }
  }

  async function toggleExpand(workoutId: string) {
    if (!session) return;
    if (expanded[workoutId]) {
      setExpanded((prev) => ({ ...prev, [workoutId]: undefined }));
      return;
    }
    const detail = await getWorkout(session.access_token, workoutId);
    setExpanded((prev) => ({ ...prev, [workoutId]: detail }));
  }

  if (loading || !session) {
    return (
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <p>Loading…</p>
      </main>
    );
  }

  if (dataLoading) {
    return (
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <p>Loading your workouts…</p>
        <p style={{ color: "#666", fontSize: 14 }}>
          First load can take up to 30 seconds if the API has been idle.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 480 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Exercise Tracker</h1>
        <button onClick={() => void supabase.auth.signOut()}>Sign out</button>
      </div>

      {error && <p style={{ color: "#b00020" }}>{error}</p>}

      <section style={{ marginTop: 16 }}>
        {currentWorkout ? (
          <>
            <h2>Workout in progress</h2>
            <ul>
              {currentWorkout.sessions.map((s) => (
                <li key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>
                    {s.activityType} — {s.status}
                  </span>
                  {s.status === "in_progress" && (
                    <button onClick={() => void handleStopSession(s.id)} disabled={busy}>
                      Stop
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <p>Add another activity:</p>
            <StartActivityForm onStart={handleStart} busy={busy} />
            <p style={{ marginTop: 8 }}>
              Or connect to a machine (stand-in for scanning, until that's built):
            </p>
            <StartMachineForm onStart={handleStartMachine} busy={busy} />
            <button onClick={() => void handleEnd()} disabled={busy} style={{ marginTop: 8 }}>
              End workout
            </button>
          </>
        ) : (
          <>
            <h2>Start a workout</h2>
            <StartActivityForm onStart={handleStart} busy={busy} />
            <p style={{ marginTop: 8 }}>
              Or connect to a machine (stand-in for scanning, until that's built):
            </p>
            <StartMachineForm onStart={handleStartMachine} busy={busy} />
          </>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Past workouts</h2>
        {history.length === 0 ? (
          <p>No past workouts yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {history.map((w) => (
              <li key={w.id} style={{ borderBottom: "1px solid #eee", padding: "8px 0" }}>
                <button
                  onClick={() => void toggleExpand(w.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}
                >
                  {new Date(w.startedAt).toLocaleString()} — {w.status}
                </button>
                {expanded[w.id] && (
                  <ul>
                    {expanded[w.id]!.sessions.map((s) => (
                      <li key={s.id}>
                        {s.activityType} — {s.status}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
