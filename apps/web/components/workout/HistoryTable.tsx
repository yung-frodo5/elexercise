"use client";

import type { CSSProperties } from "react";
import type { WorkoutWithSessions } from "@exercise-tracker/shared-types";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import type { HistorySortDir, HistorySortKey } from "../../lib/historySessions";
import { overlineStyle } from "../../lib/uiStyles";
import { WorkoutHistoryRow } from "./WorkoutHistoryRow";

const COLUMNS: { label: string; key: HistorySortKey; align?: "left" | "right" }[] = [
  { label: "Title", key: "title" },
  { label: "Date", key: "date" },
  { label: "Sports", key: "sport" },
  { label: "Time", key: "time", align: "right" },
  { label: "Energy", key: "energy", align: "right" },
  { label: "Avg power", key: "avgPower", align: "right" },
  { label: "Peak power", key: "peakPower", align: "right" },
];

const COL_COUNT = COLUMNS.length;

/** Opaque sticky header so scrolling rows don't show through. */
const HEADER_BG = theme.colors.background;

export function HistoryTable({
  rows,
  sortKey,
  sortDir,
  expandedId,
  loadingWorkoutId,
  onSort,
  onToggleExpand,
  onCloseExpand,
}: {
  rows: WorkoutWithSessions[];
  sortKey: HistorySortKey;
  sortDir: HistorySortDir;
  expandedId: string | null;
  loadingWorkoutId: string | null;
  onSort: (key: HistorySortKey) => void;
  onToggleExpand: (workoutId: string) => void;
  onCloseExpand: () => void;
}) {
  const headerCell: CSSProperties = {
    ...overlineStyle,
    padding: `${theme.spacing.md}px`,
    textAlign: "left",
    borderBottom: `1px solid ${withAlpha(theme.colors.border, 0.2)}`,
    whiteSpace: "nowrap",
    backgroundColor: HEADER_BG,
    backgroundImage: `linear-gradient(${withAlpha(theme.colors.secondaryGreen, 0.14)}, ${withAlpha(theme.colors.secondaryGreen, 0.14)})`,
    position: "sticky",
    top: 0,
    zIndex: 3,
    cursor: "pointer",
    userSelect: "none",
    boxShadow: `0 1px 0 ${withAlpha(theme.colors.border, 0.2)}`,
  };

  return (
    <div
      style={{
        overflowX: "auto",
        maxHeight: "min(70vh, 720px)",
        overflowY: "auto",
        borderRadius: theme.radii.xl,
        border: `1px solid ${withAlpha(theme.colors.border, 0.2)}`,
        backgroundColor: theme.colors.background,
        boxShadow: `0 8px 28px ${withAlpha(theme.colors.textPrimary, 0.05)}`,
      }}
    >
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            {COLUMNS.map(({ label, key, align }) => {
              const active = sortKey === key;
              const arrow = !active ? "" : sortDir === "asc" ? " ↑" : " ↓";
              return (
                <th
                  key={key}
                  style={{
                    ...headerCell,
                    textAlign: align ?? "left",
                    color: active ? theme.colors.secondaryGreen : theme.colors.textMuted,
                  }}
                  onClick={() => onSort(key)}
                >
                  {label}
                  {arrow}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((workout, index) => (
            <WorkoutHistoryRow
              key={workout.id}
              workout={workout}
              loading={loadingWorkoutId === workout.id}
              open={expandedId === workout.id}
              zebra={index % 2 === 1}
              colSpan={COL_COUNT}
              onToggle={() => onToggleExpand(workout.id)}
              onClose={onCloseExpand}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
