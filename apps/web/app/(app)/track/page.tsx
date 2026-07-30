"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { WorkoutWithSessions } from "@exercise-tracker/shared-types";
import { theme } from "@exercise-tracker/design-tokens";
import { useSupabaseSession } from "../../../lib/useSession";
import {
  endSession,
  endWorkout,
  getCurrentWorkout,
  getWorkout,
  startMachineSession,
  startManualSession,
} from "../../../lib/api";
import { StartActivityForm } from "../../../components/workout/StartActivityForm";
import { StartMachineForm } from "../../../components/workout/StartMachineForm";
import { SessionList } from "../../../components/workout/SessionList";
import { LivePowerChart } from "../../../components/workout/LivePowerChart";

// Full-bleed light-blue background, breaking out to the actual window edges
// regardless of ancestor nesting (see the About page's panel for the same
// margin technique) -- the inner wrapper re-declares this page's own <main>
// maxWidth/margin/padding recipe exactly, so the ribbon's text lines up
// with the content below it (not with the window edge the ribbon itself
// reaches).
function LightBlueRibbon({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: "#D6E9FF",
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.sm,
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto", paddingLeft: theme.spacing.xl, paddingRight: theme.spacing.xl }}>
        {children}
      </div>
    </div>
  );
}

export default function TrackPage() {
  const { session } = useSupabaseSession();

  const [currentWorkout, setCurrentWorkout] = useState<WorkoutWithSessions | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session) return;
    try {
      const current = await getCurrentWorkout(session.access_token);
      setCurrentWorkout(current ? await getWorkout(session.access_token, current.id) : null);
    } catch {
      // Falls back to the empty "start a workout" state (e.g. a stale/expired
      // session token failing the call with 401) rather than surfacing an
      // error, so the page still shows something reviewable.
      setCurrentWorkout(null);
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

  if (dataLoading) {
    return (
      <main style={{ padding: theme.spacing.xl }}>
        <p>Loading your workouts…</p>
        <p style={{ color: theme.colors.navy, fontSize: theme.typography.size.sm }}>
          First load can take up to 30 seconds if the API has been idle.
        </p>
      </main>
    );
  }

  const inProgressSession = currentWorkout?.sessions.find((s) => s.status === "in_progress");

  return (
    <main
      style={{
        paddingTop: 0,
        paddingLeft: theme.spacing.xl,
        paddingRight: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {error && <p style={{ color: theme.colors.error }}>{error}</p>}

      <section>
        {currentWorkout ? (
          <>
            <LightBlueRibbon>
              <h2 style={{ margin: 0 }}>Workout in progress</h2>
            </LightBlueRibbon>
            <div style={{ marginTop: theme.spacing.xxl }}>
              <SessionList sessions={currentWorkout.sessions} onStop={handleStopSession} busy={busy} />
            </div>

            <section
              style={{
                marginTop: theme.spacing.lg,
                border: `1px dashed ${theme.colors.border}`,
                padding: theme.spacing.md,
              }}
            >
              {inProgressSession ? (
                <LivePowerChart sessionId={inProgressSession.id} activityType={inProgressSession.activityType} />
              ) : (
                <p style={{ color: theme.colors.navy }}>No active session — start one to see live power.</p>
              )}
            </section>

            <p style={{ marginTop: theme.spacing.lg }}>Add another activity:</p>
            <StartActivityForm onStart={handleStart} busy={busy} />
            <p style={{ marginTop: theme.spacing.sm }}>
              Or connect to a machine (stand-in for scanning, until that's built):
            </p>
            <StartMachineForm onStart={handleStartMachine} busy={busy} />
            <button onClick={() => void handleEnd()} disabled={busy} style={{ marginTop: theme.spacing.sm }}>
              End workout
            </button>
          </>
        ) : (
          <>
            <LightBlueRibbon>
              <h2 style={{ margin: 0 }}>Start a workout</h2>
            </LightBlueRibbon>
            <div style={{ marginTop: theme.spacing.xxl }}>
              <StartActivityForm onStart={handleStart} busy={busy} />
            </div>
            <p style={{ marginTop: theme.spacing.sm }}>
              Or connect to a machine (stand-in for scanning, until that's built):
            </p>
            <StartMachineForm onStart={handleStartMachine} busy={busy} />
          </>
        )}
      </section>
    </main>
  );
}
