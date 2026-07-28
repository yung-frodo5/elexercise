"use client";

import type { Session } from "@exercise-tracker/shared-types";
import { SessionLogItem } from "./SessionLogItem";

export function SessionLogList({ sessions }: { sessions: Session[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {sessions.map((s) => (
        <SessionLogItem key={s.id} session={s} />
      ))}
    </ul>
  );
}
