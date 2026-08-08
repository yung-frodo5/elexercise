"use client";

import { useMemo, useState } from "react";
import type { Session } from "@exercise-tracker/shared-types";
import { theme } from "@exercise-tracker/design-tokens";
import { usePowerSamples } from "../../lib/usePowerSamples";
import { formatDurationHms, formatEnergy, formatPowerW } from "../../lib/format";
import { sessionDurationS } from "../../lib/historySessions";
import { SessionStatusPill } from "../ui/SessionStatusPill";
import { StatTile } from "./StatTile";
import { PowerChart } from "./PowerChart";

/** Expandable row for one completed session -- same stats/chart the Workout Log shows, in place on Track. */
export function CompletedSessionRow({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  // Non-live -- a completed session's samples never change, so this is a
  // one-time fetch, not a Realtime subscription (see usePowerSamples).
  const { samples, loading, error } = usePowerSamples(open ? session.id : null, { live: false });

  const peakPowerW = useMemo(
    () => (samples.length > 0 ? Math.max(...samples.map((s) => s.powerW)) : 0),
    [samples]
  );

  const durationS = sessionDurationS(session);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.sm,
          width: "100%",
          background: "none",
          border: "none",
          padding: `${theme.spacing.xs}px 0`,
          cursor: "pointer",
          textAlign: "left",
          font: "inherit",
          fontSize: theme.typography.size.sm,
        }}
      >
        <span aria-hidden style={{ fontSize: theme.typography.size.xxs }}>
          {open ? theme.icons.collapse : theme.icons.expand}
        </span>
        <span>{session.activityType}</span>
        <SessionStatusPill status={session.status} />
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.sm,
            color: theme.colors.navy,
          }}
        >
          <span>{formatDurationHms(durationS)}</span>
          <span aria-hidden>·</span>
          <span>{session.totalEnergyJoules !== undefined ? formatEnergy(session.totalEnergyJoules) : "—"}</span>
        </span>
      </button>

      {open && (
        <div style={{ paddingBottom: theme.spacing.md }}>
          <div style={{ display: "flex", gap: theme.spacing.xl, marginBottom: theme.spacing.md }}>
            <StatTile label="Duration" value={formatDurationHms(durationS)} />
            <StatTile
              label="Energy"
              value={session.totalEnergyJoules !== undefined ? formatEnergy(session.totalEnergyJoules) : "—"}
            />
            <StatTile label="Avg" value={formatPowerW(session.avgPowerW)} />
            <StatTile label="Peak" value={formatPowerW(session.peakPowerW)} />
          </div>

          {error && (
            <p style={{ color: theme.colors.themed.error, fontSize: theme.typography.size.sm }}>
              Couldn&rsquo;t load power: {error}
            </p>
          )}
          {!error && loading && (
            <p style={{ color: theme.colors.navy, fontSize: theme.typography.size.sm }}>Loading power…</p>
          )}
          {!error && !loading && samples.length === 0 && (
            <p style={{ color: theme.colors.navy, fontSize: theme.typography.size.sm }}>
              No power data recorded for this session.
            </p>
          )}
          {!error && !loading && samples.length > 0 && <PowerChart samples={samples} peakPowerW={peakPowerW} />}
        </div>
      )}
    </div>
  );
}
