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
import { endWorkout, getCurrentWorkout, getWorkout, listWorkouts, startManualSession } from "../lib/api";

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
          <Button title={preset} onPress={() => onStart(preset)} disabled={busy} />
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
            <Text key={s.id}>
              {s.activityType} — {s.status}
            </Text>
          ))}
          <Text style={styles.label}>Add another activity:</Text>
          <StartActivityForm onStart={handleStart} busy={busy} />
          <Button title="End workout" onPress={() => void handleEnd()} disabled={busy} />
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start a workout</Text>
          <StartActivityForm onStart={handleStart} busy={busy} />
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
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
  error: {
    color: "#b00020",
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 8,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    color: "#666",
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  presetButton: {
    marginRight: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
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
    borderBottomColor: "#eee",
  },
  rowDate: {
    fontWeight: "500",
  },
  rowSets: {
    color: "#666",
  },
  expandedList: {
    paddingLeft: 12,
    paddingBottom: 8,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
