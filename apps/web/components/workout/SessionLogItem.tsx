"use client";

import { useState } from "react";
import type { Session } from "@exercise-tracker/shared-types";
import { theme } from "@exercise-tracker/design-tokens";
import { CondensedStats } from "./CondensedStats";
import { SessionPowerChart } from "./SessionPowerChart";

export function SessionLogItem({ session }: { session: Session }) {
  const [expanded, setExpanded] = useState(false);

  // In-progress sessions are already covered live on the Track page — this
  // view is scoped to completed sessions, so just note the status plainly.
  if (session.status === "in_progress") {
    return (
      <li style={{ padding: `${theme.spacing.xs}px 0` }}>
        {session.activityType} — in progress
      </li>
    );
  }

  return (
    <li style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: theme.spacing.sm, marginTop: theme.spacing.sm }}>
      <button
        onClick={() => setExpanded((e) => !e)}
        style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
      >
        <strong>{session.activityType}</strong>
      </button>
      <div style={{ marginTop: theme.spacing.xs }}>
        <CondensedStats
          avgPowerW={session.avgPowerW}
          peakPowerW={session.peakPowerW}
          totalEnergyJoules={session.totalEnergyJoules}
          durationS={session.durationS}
        />
      </div>
      {expanded && (
        <div style={{ marginTop: theme.spacing.sm }}>
          <SessionPowerChart session={session} />
        </div>
      )}
    </li>
  );
}
