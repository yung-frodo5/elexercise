"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Workout, WorkoutWithSessions } from "@exercise-tracker/shared-types";
import { theme } from "@exercise-tracker/design-tokens";
import { useSupabaseSession } from "../../../lib/useSession";
import { useWattcycleSession } from "../../../lib/useWattcycleSession";
import { useWorkoutSummaries } from "../../../lib/WorkoutSummaryContext";
import { endSession, endWorkout, getWorkout, startManualSession } from "../../../lib/api";
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
        backgroundColor: theme.colors.static.accentPanelBg,
        // Static, not inherited -- this heading's own light-blue background
        // doesn't invert in dark mode, so its text can't rely on inheriting
        // the canvas's flipping default color (it never set its own before,
        // which is exactly the bug: it inherited white in dark mode).
        color: theme.colors.static.ink,
        padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
        fontSize: theme.typography.size.lg,
      }}
    >
      {children}
    </h2>
  );
}

export default function TrackPage() {
  const { session } = useSupabaseSession();
  const { currentWorkout: currentWorkoutSummary, initialLoading: initialSummariesLoading, refresh: refreshSummaries } =
    useWorkoutSummaries();
  const wattcycle = useWattcycleSession(session?.access_token);

  const [currentWorkout, setCurrentWorkout] = useState<WorkoutWithSessions | null>(null);
  // True only until the first hydration settles -- later hydrations
  // (triggered by an action changing currentWorkoutSummary) update
  // currentWorkout silently instead of re-blanking the page. See
  // WorkoutSummaryContext's matching initialLoading/hasLoadedOnceRef.
  const [initialDetailLoading, setInitialDetailLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedDetailOnceRef = useRef(false);

  // Hydrates full session detail (exercises/sets) for whichever current-workout
  // summary the shared context currently holds -- the summary itself is
  // already hotloaded at login by WorkoutSummaryProvider, so this only ever
  // does the one remaining fetch (getWorkout) instead of also re-fetching
  // getCurrentWorkout on every visit to this page.
  const loadDetail = useCallback(
    async (summary: Workout | null) => {
      if (!session) return;
      try {
        setCurrentWorkout(summary ? await getWorkout(session.access_token, summary.id) : null);
      } catch {
        // Falls back to the empty "start a workout" state (e.g. a stale/expired
        // session token failing the call with 401) rather than surfacing an
        // error, so the page still shows something reviewable.
        setCurrentWorkout(null);
      } finally {
        if (!hasLoadedDetailOnceRef.current) {
          hasLoadedDetailOnceRef.current = true;
          setInitialDetailLoading(false);
        }
      }
    },
    [session]
  );

  useEffect(() => {
    if (initialSummariesLoading) return;
    void loadDetail(currentWorkoutSummary);
  }, [initialSummariesLoading, currentWorkoutSummary, loadDetail]);

  async function handleStart(activityType: string) {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      await startManualSession(session.access_token, activityType);
      await refreshSummaries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start activity");
    } finally {
      setBusy(false);
    }
  }

  // BLE-only end to end -- see useWattcycleSession. A machine with no real
  // Bluetooth mapping throws the same error a failed connection would,
  // rather than falling back to the simulated pathway.
  async function handleStartMachine(scanToken: string) {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      await wattcycle.connect(scanToken);
      await refreshSummaries();
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
      // Stopping the BLE-tracked session must disconnect it, not just mark
      // it completed -- see useWattcycleSession.stop().
      if (sessionId === wattcycle.sessionId) {
        await wattcycle.stop();
      } else {
        await endSession(session.access_token, sessionId);
      }
      await refreshSummaries();
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
      if (wattcycle.sessionId) {
        await wattcycle.stop();
      }
      await endWorkout(session.access_token, currentWorkout.id);
      await refreshSummaries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end workout");
    } finally {
      setBusy(false);
    }
  }

  // The API can take 20-30s to respond on a cold start (Render free tier);
  // without a loading gate that whole window would render as "no workouts" /
  // "start a workout" -- indistinguishable from a genuinely empty account,
  // which reads as broken/missing features rather than slow. Only gates the
  // very first load -- initialSummariesLoading/initialDetailLoading never
  // flip back to true on a later background refresh, so starting/stopping/
  // ending a session updates the view in place instead of blanking it.
  if (initialSummariesLoading || initialDetailLoading) {
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

  const wattcycleStatusMessage: string | null =
    wattcycle.status === "looking-up"
      ? "Looking up machine…"
      : wattcycle.status === "connecting"
        ? "Connecting via Bluetooth — check for a browser device picker…"
        : wattcycle.status === "disconnected"
          ? "Bluetooth connection lost. Click Stop on the session below to end it."
          : null;

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
      {error && <p style={{ color: theme.colors.themed.error, fontSize: theme.typography.size.sm }}>{error}</p>}

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

            <LightBlueHeading>Connect to a machine</LightBlueHeading>
            <div style={{ marginTop: theme.spacing.md }}>
              <StartMachineForm onStart={handleStartMachine} busy={busy} />
            </div>
            {wattcycleStatusMessage && (
              <p style={{ color: theme.colors.navy, fontSize: theme.typography.size.sm, marginTop: theme.spacing.xs }}>
                {wattcycleStatusMessage}
              </p>
            )}

            <div style={{ marginTop: theme.spacing.xxl }}>
              <LightBlueHeading>Simulate a workout</LightBlueHeading>
              <div style={{ marginTop: theme.spacing.md }}>
                <StartActivityForm onStart={handleStart} busy={busy} />
              </div>
            </div>

            <button
              onClick={() => void handleEnd()}
              disabled={busy}
              style={{ marginTop: theme.spacing.lg, fontSize: theme.typography.size.sm }}
            >
              End workout
            </button>
          </>
        ) : (
          <>
            <LightBlueHeading>Connect to a machine</LightBlueHeading>
            <div style={{ marginTop: theme.spacing.md }}>
              <StartMachineForm onStart={handleStartMachine} busy={busy} />
            </div>
            {wattcycleStatusMessage && (
              <p style={{ color: theme.colors.navy, fontSize: theme.typography.size.sm, marginTop: theme.spacing.xs }}>
                {wattcycleStatusMessage}
              </p>
            )}

            <div style={{ marginTop: theme.spacing.xxl }}>
              <LightBlueHeading>Simulate a workout</LightBlueHeading>
              <div style={{ marginTop: theme.spacing.md }}>
                <StartActivityForm onStart={handleStart} busy={busy} />
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
