"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { useSupabaseSession } from "../../../lib/useSession";
import {
  filterAndSortHistoryWorkouts,
  nextSortState,
  toggleListItem,
  uniqueWorkoutActivityTypes,
  type HistorySortDir,
  type HistorySortKey,
} from "../../../lib/historySessions";
import { useHistoryWorkouts } from "../../../lib/useHistoryWorkouts";
import { SoftPanel } from "../../../components/ui/SoftPanel";
import { HistoryToolbar } from "../../../components/workout/HistoryToolbar";
import { HistoryTable } from "../../../components/workout/HistoryTable";

const mainStyle: CSSProperties = {
  padding: `${theme.spacing.xxl}px ${theme.spacing.xl}px`,
  maxWidth: 1040,
  margin: "0 auto",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: theme.typography.fontFamily.web,
  color: theme.colors.textPrimary,
};

export default function HistoryPage() {
  const { session } = useSupabaseSession();
  const { workouts, loading, error, loadingWorkoutId, ensureWorkoutLoaded } =
    useHistoryWorkouts(session);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [keywords, setKeywords] = useState("");
  const [sports, setSports] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortKey, setSortKey] = useState<HistorySortKey>("date");
  const [sortDir, setSortDir] = useState<HistorySortDir>("desc");

  const sportOptions = useMemo(() => uniqueWorkoutActivityTypes(workouts), [workouts]);
  const filtered = useMemo(
    () => filterAndSortHistoryWorkouts(workouts, { sports, keywords, sortKey, sortDir }),
    [workouts, sports, keywords, sortKey, sortDir]
  );

  async function toggleExpand(workoutId: string) {
    if (expandedId === workoutId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(workoutId);
    await ensureWorkoutLoaded(workoutId);
  }

  if (loading) {
    return (
      <main style={mainStyle}>
        <h1
          style={{
            margin: 0,
            fontSize: theme.typography.size.xl,
            fontWeight: theme.typography.weight.bold,
            letterSpacing: "-0.02em",
          }}
        >
          Workout Log
        </h1>
        <p style={{ marginTop: theme.spacing.md, color: theme.colors.textMuted }}>Loading your workouts…</p>
        <p style={{ color: theme.colors.textMuted, fontSize: theme.typography.size.sm }}>
          First load can take up to 30 seconds if the API has been idle.
        </p>
      </main>
    );
  }

  return (
    <main style={mainStyle}>
      <header style={{ marginBottom: theme.spacing.xl }}>
        <h1
          style={{
            margin: 0,
            fontSize: theme.typography.size.xl,
            fontWeight: theme.typography.weight.bold,
            letterSpacing: "-0.02em",
            color: theme.colors.textPrimary,
          }}
        >
          Workout Log
        </h1>
        <p
          style={{
            margin: 0,
            marginTop: theme.spacing.xs,
            color: theme.colors.textMuted,
            fontSize: theme.typography.size.sm,
            lineHeight: 1.45,
            maxWidth: 420,
          }}
        >
          Past workouts and session power profiles.
        </p>
      </header>

      {error && <p style={{ marginBottom: theme.spacing.md, color: theme.colors.error }}>{error}</p>}

      <section>
        <HistoryToolbar
          activityCount={filtered.length}
          sportOptions={sportOptions}
          selectedSports={sports}
          onToggleSport={(sport) => setSports((prev) => toggleListItem(prev, sport))}
          keywords={keywords}
          searchOpen={searchOpen}
          onSearchOpenChange={setSearchOpen}
          onKeywordsChange={setKeywords}
        />

        {filtered.length === 0 ? (
          <SoftPanel style={{ padding: theme.spacing.xl }}>
            <p style={{ margin: 0, fontWeight: theme.typography.weight.semibold }}>
              {workouts.length === 0 ? "No past workouts yet." : "No workouts match these filters."}
            </p>
            <p
              style={{
                margin: 0,
                marginTop: theme.spacing.xs,
                color: theme.colors.textMuted,
                fontSize: theme.typography.size.sm,
                lineHeight: 1.45,
              }}
            >
              {workouts.length === 0
                ? "Finish a workout on Track and it will show up here."
                : "Try clearing filters or search."}
            </p>
          </SoftPanel>
        ) : (
          <HistoryTable
            rows={filtered}
            sortKey={sortKey}
            sortDir={sortDir}
            expandedId={expandedId}
            loadingWorkoutId={loadingWorkoutId}
            onSort={(key) => {
              const next = nextSortState(sortKey, sortDir, key);
              setSortKey(next.sortKey);
              setSortDir(next.sortDir);
            }}
            onToggleExpand={(workoutId) => void toggleExpand(workoutId)}
            onCloseExpand={() => setExpandedId(null)}
          />
        )}
      </section>
    </main>
  );
}
