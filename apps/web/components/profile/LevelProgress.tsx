"use client";

import { theme } from "@exercise-tracker/design-tokens";
import { progressToNextLevel } from "@exercise-tracker/leveling";

// compact drops the elexir-earned/elexir-remaining captions and shrinks
// everything else -- for showing progress somewhere small (e.g. the header),
// not just the full Profile Details page. Same progressToNextLevel call
// either way, so the two never disagree about where the bar actually is.
export function LevelProgress({
  level,
  elexir,
  compact = false,
}: {
  level: number;
  elexir: number;
  compact?: boolean;
}) {
  const progress = progressToNextLevel(elexir);

  if (compact) {
    return (
      <div style={{ minWidth: 120 }}>
        <div style={{ fontSize: theme.typography.size.xxs, marginBottom: 2 }}>Level {level}</div>
        <div
          style={{
            width: "100%",
            height: 6,
            borderRadius: theme.radii.pill,
            backgroundColor: theme.colors.border,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress.progressFraction * 100}%`,
              height: "100%",
              borderRadius: theme.radii.pill,
              backgroundColor: theme.colors.primaryGreen,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: theme.spacing.xs,
        }}
      >
        <span style={{ fontSize: theme.typography.size.lg, fontWeight: theme.typography.weight.semibold }}>
          Level {level}
        </span>
        <span style={{ fontSize: theme.typography.size.xs, color: theme.colors.textMuted }}>
          {elexir} elexir earned
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: 10,
          borderRadius: theme.radii.pill,
          backgroundColor: theme.colors.border,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress.progressFraction * 100}%`,
            height: "100%",
            borderRadius: theme.radii.pill,
            backgroundColor: theme.colors.primaryGreen,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <div style={{ marginTop: theme.spacing.xs, fontSize: theme.typography.size.xs, color: theme.colors.textMuted }}>
        {progress.xpRemaining} elexir to level {level + 1}
      </div>
    </div>
  );
}
