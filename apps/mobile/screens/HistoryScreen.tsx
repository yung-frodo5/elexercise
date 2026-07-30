import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import type { WorkoutWithSessions } from "@exercise-tracker/shared-types";
import { filterAndSortHistoryWorkouts } from "@exercise-tracker/workout-history";
import { useHistoryWorkouts } from "../lib/useHistoryWorkouts";
import { FeedSearchBar } from "../components/ui/FeedSearchBar";
import { WorkoutHistoryRow } from "../components/workout/WorkoutHistoryRow";

export default function HistoryScreen({ accessToken }: { accessToken: string }) {
  const { workouts, loading, error, loadingWorkoutId, ensureWorkoutLoaded } =
    useHistoryWorkouts(accessToken);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [keywords, setKeywords] = useState("");

  const filtered = useMemo(
    () =>
      filterAndSortHistoryWorkouts(workouts, {
        keywords,
        sortKey: "date",
        sortDir: "desc",
      }),
    [workouts, keywords]
  );

  const handleToggleExpand = useCallback(
    async (workoutId: string) => {
      if (expandedId === workoutId) {
        setExpandedId(null);
        return;
      }
      setExpandedId(workoutId);
      await ensureWorkoutLoaded(workoutId);
    },
    [expandedId, ensureWorkoutLoaded]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.primaryGreen} size="large" />
        <Text style={styles.muted}>Loading your workouts…</Text>
      </View>
    );
  }

  return (
    <FlatList<WorkoutWithSessions>
      style={styles.root}
      data={filtered}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          <FeedSearchBar value={keywords} onChange={setKeywords} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            {workouts.length === 0 ? "No past workouts yet." : "No workouts match your search."}
          </Text>
          <Text style={styles.emptyBody}>
            {workouts.length === 0
              ? "Finish a workout on Track and it will show up here."
              : "Try a different search."}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <WorkoutHistoryRow
          workout={item}
          loading={loadingWorkoutId === item.id}
          open={expandedId === item.id}
          onToggle={() => void handleToggleExpand(item.id)}
        />
      )}
      contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    gap: theme.spacing.sm,
    padding: theme.spacing.xl,
  },
  muted: {
    color: withAlpha(theme.colors.navy, 0.7),
    fontSize: theme.typography.size.sm,
  },
  error: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    color: theme.colors.error,
    fontSize: theme.typography.size.sm,
  },
  empty: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    alignItems: "flex-start",
  },
  emptyTitle: {
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.navy,
    fontSize: theme.typography.size.md,
  },
  emptyBody: {
    marginTop: theme.spacing.xs,
    color: withAlpha(theme.colors.navy, 0.65),
    fontSize: theme.typography.size.sm,
    lineHeight: 20,
  },
});
