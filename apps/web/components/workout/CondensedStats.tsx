"use client";

import { theme } from "@exercise-tracker/design-tokens";
import { formatDuration, formatEnergy } from "../../lib/format";
import { StatTile } from "./StatTile";

export function CondensedStats({
  avgPowerW,
  peakPowerW,
  totalEnergyJoules,
  durationS,
}: {
  avgPowerW?: number;
  peakPowerW?: number;
  totalEnergyJoules?: number;
  durationS?: number;
}) {
  return (
    <div style={{ display: "flex", gap: theme.spacing.xl }}>
      <StatTile label="Total energy" value={totalEnergyJoules !== undefined ? formatEnergy(totalEnergyJoules) : "—"} />
      <StatTile label="Time elapsed" value={durationS !== undefined ? formatDuration(durationS) : "—"} />
      <StatTile label="Average power" value={avgPowerW !== undefined ? `${Math.round(avgPowerW)} W` : "—"} />
      <StatTile label="Peak power" value={peakPowerW !== undefined ? `${Math.round(peakPowerW)} W` : "—"} />
    </div>
  );
}
