import type { HistorySortKey } from "./historySessions";

/** Shared Workout Log column definitions — web table headers + mobile sort/header. */
export const HISTORY_COLUMNS: {
  label: string;
  key: HistorySortKey;
  align?: "left" | "right";
}[] = [
  { label: "Title", key: "title" },
  { label: "Date", key: "date" },
  { label: "Workout", key: "sport" },
  { label: "Time", key: "time", align: "right" },
  { label: "Energy", key: "energy", align: "right" },
  { label: "Avg. power", key: "avgPower", align: "right" },
  { label: "Peak power", key: "peakPower", align: "right" },
];

export const HISTORY_COL_COUNT = HISTORY_COLUMNS.length;

/** Hover / expanded highlight — navy-tint on white web rows (not sage). */
export const HISTORY_ROW_HOVER_BG = "#E6ECF2";
