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

// A plain rectangular light-blue background sized to its own content, not
// a full-bleed ribbon spanning the window -- per design feedback, simpler
// than the earlier breakout version.
function LightBlueHeading({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        display: "inline-block",
        margin: 0,
        backgroundColor: "#D6E9FF",
        // Static, not inherited -- this heading's own light-blue background
        // doesn't invert in dark mode, so its text can't rely on inheriting
        // the canvas's flipping default color (it never set its own before,
        // which is exactly the bug: it inherited white in dark mode).
        color: theme.colors.navyStatic,
        padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
        fontSize: theme.typography.size.md,
      }}
    >
      {children}
    </h2>
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
        <p style={{ fontSize: theme.typography.size.sm }}>Loading your workouts…</p>
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
      {error && <p style={{ color: theme.colors.error, fontSize: theme.typography.size.sm }}>{error}</p>}

      <section>
        {currentWorkout ? (
          <>
            <LightBlueHeading>Workout in progress</LightBlueHeading>
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
                <p style={{ color: theme.colors.navy, fontSize: theme.typography.size.sm }}>
                  No active session — start one to see live power.
                </p>
              )}
            </section>

            <p style={{ marginTop: theme.spacing.lg, fontSize: theme.typography.size.sm }}>Add another activity:</p>
            <StartActivityForm onStart={handleStart} busy={busy} />
            <p style={{ marginTop: theme.spacing.xxl, fontSize: theme.typography.size.sm }}>
              Or connect to a machine (stand-in for scanning, until that&apos;s built):
            </p>
            <StartMachineForm onStart={handleStartMachine} busy={busy} />
            <button
              onClick={() => void handleEnd()}
              disabled={busy}
              style={{ marginTop: theme.spacing.sm, fontSize: theme.typography.size.sm }}
            >
              End workout
            </button>
          </>
        ) : (
          <>
            <LightBlueHeading>Start a workout</LightBlueHeading>
            <div style={{ marginTop: theme.spacing.xxl }}>
              <StartActivityForm onStart={handleStart} busy={busy} />
            </div>
            <p style={{ marginTop: theme.spacing.xxl, fontSize: theme.typography.size.sm }}>
              Or connect to a machine (stand-in for scanning, until that&apos;s built):
            </p>
            <StartMachineForm onStart={handleStartMachine} busy={busy} />
          </>
        )}
      </section>
    </main>
  );
}
