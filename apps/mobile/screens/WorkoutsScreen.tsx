import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { Workout, WorkoutWithSessions } from "@exercise-tracker/shared-types";
import { theme } from "@exercise-tracker/design-tokens";
import {
  endSession,
  endWorkout,
  getCurrentWorkout,
  getWorkout,
  listWorkouts,
  startMachineSession,
  startManualSession,
} from "../lib/api";

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
    <View style={styles.presetRow}>
      {ACTIVITY_PRESETS.map((preset) => (
        <View key={preset} style={styles.presetButton}>
          <Button title={preset} onPress={() => onStart(preset)} disabled={busy} color={theme.colors.primaryGreen} />
        </View>
      ))}
      <TextInput style={styles.input} placeholder="Other…" value={other} onChangeText={setOther} />
      <Button
        title="Add"
        disabled={busy || !other.trim()}
        onPress={() => {
          if (!other.trim()) return;
          onStart(other.trim());
          setOther("");
        }}
        color={theme.colors.primaryGreen}
      />
    </View>
  );
}

function StartMachineForm({
  onStart,
  busy,
}: {
  onStart: (scanToken: string) => void;
  busy: boolean;
}) {
  const [machineId, setMachineId] = useState("");

  return (
    <View style={styles.machineRow}>
      <TextInput
        style={styles.input}
        placeholder="Machine ID"
        value={machineId}
        onChangeText={setMachineId}
      />
      <Button
        title="Connect"
        disabled={busy || !machineId.trim()}
        onPress={() => {
          if (!machineId.trim()) return;
          onStart(machineId.trim());
          setMachineId("");
        }}
        color={theme.colors.primaryGreen}
      />
    </View>
  );
}

export default function WorkoutsScreen({ accessToken }: { accessToken: string }) {
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutWithSessions | null>(null);
  const [history, setHistory] = useState<Workout[]>([]);
  const [expanded, setExpanded] = useState<Record<string, WorkoutWithSessions | undefined>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const current = await getCurrentWorkout(accessToken);
      setCurrentWorkout(current ? await getWorkout(accessToken, current.id) : null);
      const all = await listWorkouts(accessToken);
      setHistory(all.filter((w) => w.id !== current?.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workouts");
    } finally {
      setLoading(false);
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

  async function toggleExpand(workoutId: string) {
    if (expanded[workoutId]) {
      setExpanded((prev) => ({ ...prev, [workoutId]: undefined }));
      return;
    }
    const detail = await getWorkout(accessToken, workoutId);
    setExpanded((prev) => ({ ...prev, [workoutId]: detail }));
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workouts</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {currentWorkout ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout in progress</Text>
          {currentWorkout.sessions.map((s) => (
            <View key={s.id} style={styles.sessionRow}>
              <Text>
                {s.activityType} — {s.status}
              </Text>
              {s.status === "in_progress" && (
                <Button
                  title="Stop"
                  onPress={() => void handleStopSession(s.id)}
                  disabled={busy}
                  color={theme.colors.secondaryGreen}
                />
              )}
            </View>
          ))}
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

      <Text style={styles.sectionTitle}>Past workouts</Text>
      <FlatList
        style={styles.list}
        data={history}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No past workouts yet.</Text>}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity onPress={() => void toggleExpand(item.id)} style={styles.row}>
              <Text style={styles.rowDate}>{new Date(item.startedAt).toLocaleString()}</Text>
              <Text style={styles.rowSets}>{item.status}</Text>
            </TouchableOpacity>
            {expanded[item.id] && (
              <View style={styles.expandedList}>
                {expanded[item.id]!.sessions.map((s) => (
                  <Text key={s.id}>
                    {s.activityType} — {s.status}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
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
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  machineRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  presetButton: {
    marginRight: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.sm,
    minWidth: 100,
  },
  list: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowDate: {
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.textPrimary,
  },
  rowSets: {
    color: theme.colors.textMuted,
  },
  expandedList: {
    paddingLeft: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
});
