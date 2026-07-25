import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Workout, WorkoutWithSessions } from "@exercise-tracker/shared-types";
import { theme } from "@exercise-tracker/design-tokens";
import { getWorkout, listWorkouts } from "../lib/api";
import { SessionList } from "../components/workout/SessionList";

export default function HistoryScreen({ accessToken }: { accessToken: string }) {
  const [history, setHistory] = useState<Workout[]>([]);
  const [expanded, setExpanded] = useState<Record<string, WorkoutWithSessions | undefined>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const all = await listWorkouts(accessToken);
      setHistory(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workouts");
    } finally {
      // Same cold-start-aware loading state as Track — see that screen for why.
      setDataLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function toggleExpand(workoutId: string) {
    if (expanded[workoutId]) {
      setExpanded((prev) => ({ ...prev, [workoutId]: undefined }));
      return;
    }
    const detail = await getWorkout(accessToken, workoutId);
    setExpanded((prev) => ({ ...prev, [workoutId]: detail }));
  }

  if (dataLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>History</Text>
        <Text>Loading your workouts…</Text>
        <Text style={styles.label}>First load can take up to 30 seconds if the API has been idle.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>

      {error && <Text style={styles.error}>{error}</Text>}

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
                <SessionList sessions={expanded[item.id]!.sessions} />
                <Text style={styles.label}>TODO: show duration/power/energy per session</Text>
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
    paddingTop: theme.spacing.lg,
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
  label: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    color: theme.colors.textMuted,
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
});
