"use client";

import { useMemo } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { usePowerSamples } from "../../lib/usePowerSamples";
import { formatDuration } from "../../lib/format";
import { StatTile } from "./StatTile";
import { PowerChart } from "./PowerChart";

export function LivePowerChart({ sessionId, activityType }: { sessionId: string; activityType: string }) {
  const { samples, loading, error } = usePowerSamples(sessionId);

  const stats = useMemo(() => {
    if (samples.length === 0) return null;
    const powers = samples.map((s) => s.powerW);
    const current = powers[powers.length - 1];
    const peak = Math.max(...powers);
    const average = powers.reduce((sum, p) => sum + p, 0) / powers.length;
    const elapsed = samples[samples.length - 1].tMs;
    return { current, peak, average, elapsed };
  }, [samples]);

  if (error) {
    return (
      <p style={{ color: theme.colors.themed.error, fontSize: theme.typography.size.sm }}>
        Couldn&rsquo;t load live power: {error}
      </p>
    );
  }

  return (
    <div>
      {/* One tier below its parent h2 (LightBlueHeading on the Track page,
          now also md after the site-wide heading-size pass) -- sm ties it
          with body text instead, differentiated by the global h1/h2/h3
          Clash Display + semibold styling. */}
      <h3 style={{ fontSize: theme.typography.size.sm }}>Live power — {activityType}</h3>

      {!loading && !stats && (
        <p style={{ color: theme.colors.navy, fontSize: theme.typography.size.sm }}>
          Waiting for the first reading…
        </p>
      )}

      {stats && (
        <>
          <div style={{ display: "flex", gap: theme.spacing.xl, marginBottom: theme.spacing.md }}>
            <StatTile label="Current" value={`${Math.round(stats.current)} W`} />
            <StatTile label="Peak" value={`${Math.round(stats.peak)} W`} />
            <StatTile label="Average" value={`${Math.round(stats.average)} W`} />
            <StatTile label="Elapsed" value={formatDuration(stats.elapsed / 1000)} />
          </div>

          <PowerChart samples={samples} peakPowerW={stats.peak} />
        </>
      )}
    </div>
  );
}
