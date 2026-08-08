"use client";

import type { Session } from "@exercise-tracker/shared-types";
import { theme } from "@exercise-tracker/design-tokens";
import { SessionStatusPill } from "../ui/SessionStatusPill";
import { CompletedSessionRow } from "./CompletedSessionRow";

export function SessionList({
  sessions,
  onStop,
  busy,
}: {
  sessions: Session[];
  onStop?: (sessionId: string) => void;
  busy?: boolean;
}) {
  return (
    <ul
      style={{
        fontSize: theme.typography.size.sm,
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.xs,
      }}
    >
      {sessions.map((s) =>
        s.status === "in_progress" ? (
          <li key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>{s.activityType}</span>
            <SessionStatusPill status={s.status} />
            {onStop && (
              <button onClick={() => onStop(s.id)} disabled={busy}>
                Stop
              </button>
            )}
          </li>
        ) : (
          <li key={s.id}>
            <CompletedSessionRow session={s} />
          </li>
        )
      )}
    </ul>
  );
}
