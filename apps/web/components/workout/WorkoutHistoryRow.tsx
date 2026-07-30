"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Session, WorkoutWithSessions } from "@exercise-tracker/shared-types";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import { HISTORY_ROW_HOVER_BG } from "@exercise-tracker/workout-history";
import { activityColorForSport } from "../../lib/activityColors";
import { formatDurationHms, formatEnergy, formatPowerW, formatWorkoutDate } from "../../lib/format";
import {
  sessionDurationS,
  workoutAvgPowerW,
  workoutDurationS,
  workoutEnergyJ,
  workoutPeakPowerW,
  workoutSports,
  workoutTitle,
} from "../../lib/historySessions";
import { SportTag } from "../ui/SportTag";
import { MultiPowerChart } from "./MultiPowerChart";
import { useWorkoutPowerSeries } from "../../lib/useWorkoutPowerSeries";

const HISTORY_ROW_STYLES_ID = "elex-history-row-styles";
const EXPAND_ACCENT = `inset 3px 0 0 ${theme.colors.border}`;
// Prefer shared token; value matches web's navy-tint hover on white rows.
const ROW_HOVER_BG = HISTORY_ROW_HOVER_BG;

function ensureRowStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(HISTORY_ROW_STYLES_ID)) return;
  const style = document.createElement("style");
  style.id = HISTORY_ROW_STYLES_ID;
  style.textContent = `
    .history-row:focus-visible {
      outline: 2px solid ${theme.colors.border};
      outline-offset: -2px;
    }
  `;
  document.head.appendChild(style);
}

function ActivityToggle({
  color,
  on,
  onToggle,
}: {
  color: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Hide on power chart" : "Show on power chart"}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      style={{
        width: 12,
        height: 12,
        borderRadius: theme.radii.sm,
        flexShrink: 0,
        boxSizing: "border-box",
        padding: 0,
        cursor: "pointer",
        background: on ? color : "transparent",
        border: `2px solid ${color}`,
      }}
    />
  );
}

export function WorkoutHistoryRow({
  workout,
  loading,
  open,
  zebra,
  colSpan,
  onToggle,
  onClose,
}: {
  workout: WorkoutWithSessions;
  loading: boolean;
  open: boolean;
  zebra: boolean;
  colSpan: number;
  onToggle: () => void;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const sessionMetaKey = workout.sessions
    .map((s) => `${s.id}:${s.activityType ?? ""}`)
    .join("|");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(workout.sessions.map((s) => s.id))
  );

  const title = workoutTitle(workout);
  const sports = workoutSports(workout);
  const durationS = workoutDurationS(workout);
  const energyJ = workoutEnergyJ(workout);
  const avgPowerW = workoutAvgPowerW(workout);
  const peakPowerW = workoutPeakPowerW(workout);
  const statusLabel = workout.status === "completed" ? null : "In progress";

  const colorBySessionId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of workout.sessions) {
      map[s.id] = activityColorForSport(s.activityType || "Activity");
    }
    return map;
    // sessionMetaKey encodes id + activityType for this workout's sessions.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by sessionMetaKey
  }, [sessionMetaKey]);

  const { series, loading: powerLoading, error: powerError } = useWorkoutPowerSeries(
    open ? workout : null
  );

  const chartSeries = useMemo(
    () =>
      series.map((s) => ({
        session: s.session,
        timelineSamples: s.timelineSamples,
        color: colorBySessionId[s.session.id] ?? theme.colors.secondaryGreen,
      })),
    [series, colorBySessionId]
  );

  useEffect(() => {
    ensureRowStyles();
  }, []);

  useEffect(() => {
    setSelectedIds(new Set(workout.sessions.map((s) => s.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by sessionMetaKey
  }, [workout.id, sessionMetaKey]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function toggleActivity(sessionId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  }

  const cell: CSSProperties = {
    padding: `${theme.spacing.md}px`,
    fontSize: theme.typography.size.sm,
    color: theme.colors.navy,
    verticalAlign: "middle",
    fontFamily: theme.typography.fontFamily.web,
    borderBottom: open ? "none" : `1px solid ${withAlpha(theme.colors.border, 0.25)}`,
  };

  const numericCell: CSSProperties = {
    ...cell,
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.size.xs,
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  };

  const subCell: CSSProperties = {
    ...cell,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottom: `1px solid ${withAlpha(theme.colors.border, 0.2)}`,
    backgroundColor: "#FFFFFF",
  };

  const subNumeric: CSSProperties = {
    ...subCell,
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.size.xs,
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
    color: theme.colors.navy,
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  };

  const rowBg = open || hovered ? ROW_HOVER_BG : zebra ? "#D6E9FF" : "#FFFFFF";

  return (
    <>
      <tr
        className="history-row"
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        tabIndex={0}
        aria-expanded={open}
        style={{
          backgroundColor: rowBg,
          cursor: "pointer",
          transition: "background-color 140ms ease",
          outline: "none",
          boxShadow: open || hovered ? EXPAND_ACCENT : "inset 3px 0 0 transparent",
        }}
      >
        <td style={cell}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: theme.spacing.sm }}>
            <span
              aria-hidden
              style={{
                display: "inline-block",
                marginTop: 2,
                color: theme.colors.navy,
                fontSize: theme.typography.size.xxs,
                lineHeight: 1.2,
                flexShrink: 0,
              }}
            >
              {open ? theme.icons.collapse : theme.icons.expand}
            </span>
            <div style={{ minWidth: 0 }}>
              <span
                style={{
                  color: theme.colors.navy,
                  fontWeight: theme.typography.weight.semibold,
                  fontSize: theme.typography.size.md,
                }}
              >
                {title}
              </span>
              {statusLabel || loading ? (
                <span
                  style={{
                    display: "block",
                    marginTop: 2,
                    fontSize: theme.typography.size.xs,
                    color: theme.colors.navy,
                  }}
                >
                  {statusLabel}
                  {loading ? " · Loading…" : null}
                </span>
              ) : null}
            </div>
          </div>
        </td>
        <td
          style={{
            ...cell,
            color: theme.colors.navy,
            whiteSpace: "nowrap",
            fontSize: theme.typography.size.xs,
          }}
        >
          {formatWorkoutDate(workout.startedAt)}
        </td>
        <td style={cell}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {sports.map((sport) => (
              <SportTag key={sport} label={sport} />
            ))}
          </div>
        </td>
        <td style={numericCell}>{formatDurationHms(durationS)}</td>
        <td style={numericCell}>{energyJ !== undefined ? formatEnergy(energyJ) : "—"}</td>
        <td style={numericCell}>{formatPowerW(avgPowerW)}</td>
        <td style={numericCell}>{formatPowerW(peakPowerW)}</td>
      </tr>

      {open &&
        workout.sessions.map((session) => (
          <ActivitySubRow
            key={session.id}
            session={session}
            color={colorBySessionId[session.id] ?? theme.colors.secondaryGreen}
            selected={selectedIds.has(session.id)}
            onToggle={() => toggleActivity(session.id)}
            subCell={subCell}
            subNumeric={subNumeric}
          />
        ))}

      {open && (
        <tr>
          <td
            colSpan={colSpan}
            style={{
              padding: `${theme.spacing.md}px ${theme.spacing.xl}px ${theme.spacing.xl}px`,
              backgroundColor: "#FFFFFF",
              borderBottom: `1px solid ${withAlpha(theme.colors.border, 0.25)}`,
              boxShadow: EXPAND_ACCENT,
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <div style={{ width: "100%", maxWidth: 820, height: 260 }}>
                {powerError ? (
                  <p style={{ color: theme.colors.error, margin: 0, textAlign: "center" }}>
                    Couldn&rsquo;t load power: {powerError}
                  </p>
                ) : powerLoading ? (
                  <p style={{ color: theme.colors.navy, margin: 0, textAlign: "center" }}>
                    Loading power profile…
                  </p>
                ) : (
                  <MultiPowerChart series={chartSeries} selectedIds={selectedIds} />
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ActivitySubRow({
  session,
  color,
  selected,
  onToggle,
  subCell,
  subNumeric,
}: {
  session: Session;
  color: string;
  selected: boolean;
  onToggle: () => void;
  subCell: CSSProperties;
  subNumeric: CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  const durationS = sessionDurationS(session);
  const hoverBg = ROW_HOVER_BG;
  const cell = hovered ? { ...subCell, backgroundColor: hoverBg } : subCell;
  const numeric = hovered ? { ...subNumeric, backgroundColor: hoverBg } : subNumeric;

  return (
    <tr
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: EXPAND_ACCENT,
        transition: "background-color 140ms ease",
        cursor: "pointer",
      }}
    >
      <td style={cell}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.sm,
            paddingLeft: theme.spacing.xl,
          }}
        >
          <ActivityToggle color={color} on={selected} onToggle={onToggle} />
          <span
            style={{
              fontSize: theme.typography.size.sm,
              fontWeight: theme.typography.weight.medium,
              color: theme.colors.navy,
            }}
          >
            {session.activityType || "Activity"}
          </span>
        </div>
      </td>
      <td style={cell} />
      <td style={cell} />
      <td style={numeric}>{formatDurationHms(durationS)}</td>
      <td style={numeric}>
        {session.totalEnergyJoules !== undefined ? formatEnergy(session.totalEnergyJoules) : "—"}
      </td>
      <td style={numeric}>{formatPowerW(session.avgPowerW)}</td>
      <td style={numeric}>{formatPowerW(session.peakPowerW)}</td>
    </tr>
  );
}
