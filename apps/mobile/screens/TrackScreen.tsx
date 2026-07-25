import { useCallback, useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import type { WorkoutWithSessions } from "@exercise-tracker/shared-types";
import { theme } from "@exercise-tracker/design-tokens";
import {
  endSession,
  endWorkout,
  getCurrentWorkout,
  getWorkout,
  startMachineSession,
  startManualSession,
} from "../lib/api";
import { SessionList } from "../components/workout/SessionList";
import { StartActivityForm } from "../components/workout/StartActivityForm";
import { StartMachineForm } from "../components/workout/StartMachineForm";

export default function TrackScreen({ accessToken }: { accessToken: string }) {
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutWithSessions | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const current = await getCurrentWorkout(accessToken);
      setCurrentWorkout(current ? await getWorkout(accessToken, current.id) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workouts");
    } finally {
      // API can take 20-30s to respond on a cold start (Render free tier) —
      // see HistoryScreen for why this matters for the empty state.
      setDataLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleStart(activityType: string) {
    setBusy(true);
    setError(null);
    try {
      await startManualSession(accessToken, activityType);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start activity");
    } finally {
      setBusy(false);
    }
  }

  async function handleStartMachine(scanToken: string) {
    setBusy(true);
    setError(null);
    try {
      await startMachineSession(accessToken, scanToken);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to machine");
    } finally {
      setBusy(false);
    }
  }

  async function handleStopSession(sessionId: string) {
    setBusy(true);
    setError(null);
    try {
      await endSession(accessToken, sessionId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop activity");
    } finally {
      setBusy(false);
    }
  }

  async function handleEnd() {
    if (!currentWorkout) return;
    setBusy(true);
    setError(null);
    try {
      await endWorkout(accessToken, currentWorkout.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end workout");
    } finally {
      setBusy(false);
    }
  }

  if (dataLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Track</Text>
        <Text>Loading your workouts…</Text>
        <Text style={styles.label}>First load can take up to 30 seconds if the API has been idle.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Track</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {currentWorkout ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout in progress</Text>
          <SessionList sessions={currentWorkout.sessions} onStop={handleStopSession} busy={busy} />

          <View style={styles.livePower}>
            <Text style={styles.sectionTitle}>Live power</Text>
            <Text style={styles.label}>
              TODO: live power/telemetry chart (1Hz PowerSample stream) — not wired up yet
            </Text>
          </View>

          <Text style={styles.label}>Add another activity:</Text>
          <StartActivityForm onStart={handleStart} busy={busy} />
          <Text style={styles.label}>Or connect to a machine (stand-in for scanning, until that's built):</Text>
          <StartMachineForm onStart={handleStartMachine} busy={busy} />
          <Button
            title="End workout"
            onPress={() => void handleEnd()}
            disabled={busy}
            color={theme.colors.secondaryGreen}
          />
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start a workout</Text>
          <StartActivityForm onStart={handleStart} busy={busy} />
          <Text style={styles.label}>Or connect to a machine (stand-in for scanning, until that's built):</Text>
          <StartMachineForm onStart={handleStartMachine} busy={busy} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  content: {
    paddingBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.semibold,
    marginBottom: theme.spacing.lg,
    color: theme.colors.textPrimary,
  },
  error: {
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.semibold,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  label: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    color: theme.colors.textMuted,
  },
  livePower: {
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
});
