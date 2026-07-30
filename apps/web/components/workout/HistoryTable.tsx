"use client";

import type { CSSProperties } from "react";
import type { WorkoutWithSessions } from "@exercise-tracker/shared-types";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import {
  HISTORY_COL_COUNT,
  HISTORY_COLUMNS,
  type HistorySortDir,
  type HistorySortKey,
} from "../../lib/historySessions";
import { overlineStyle } from "../../lib/uiStyles";
import { WorkoutHistoryRow } from "./WorkoutHistoryRow";

/** Opaque sticky header so scrolling rows don't show through. */
const HEADER_BG = "#002FA7";

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
        backgroundColor: "#FFFFFF",
        boxShadow: `0 8px 28px ${withAlpha(theme.colors.navy, 0.05)}`,
      }}
    >
      <table style={{ width: "100%", minWidth: 640, borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            {HISTORY_COLUMNS.map(({ label, key, align }) => {
              const active = sortKey === key;
              const arrow = !active ? "" : sortDir === "asc" ? " ↑" : " ↓";
              return (
                <th
                  key={key}
                  style={{
                    ...headerCell,
                    textAlign: align ?? "left",
                    color: "#FFFFFF",
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
              colSpan={HISTORY_COL_COUNT}
              onToggle={() => onToggleExpand(workout.id)}
              onClose={onCloseExpand}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
