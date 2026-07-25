"use client";

import type { Session } from "@exercise-tracker/shared-types";

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
    <ul>
      {sessions.map((s) => (
        <li key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>
            {s.activityType} — {s.status}
          </span>
          {onStop && s.status === "in_progress" && (
            <button onClick={() => onStop(s.id)} disabled={busy}>
              Stop
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
