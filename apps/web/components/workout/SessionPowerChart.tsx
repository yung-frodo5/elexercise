"use client";

import type { Session } from "@exercise-tracker/shared-types";
import { theme } from "@exercise-tracker/design-tokens";
import { usePowerSamples } from "../../lib/usePowerSamples";
import { PowerChart } from "./PowerChart";

// A completed session's samples never change, so this fetches once with no
// Realtime subscription — unlike LivePowerChart, which is for the one
// session that's still in_progress.
export function SessionPowerChart({ session }: { session: Session }) {
  const { samples, loading, error } = usePowerSamples(session.id, { live: false });

  if (error) {
    return <p style={{ color: theme.colors.error }}>Couldn&rsquo;t load power profile: {error}</p>;
  }
  if (loading) {
    return <p style={{ color: theme.colors.textMuted }}>Loading power profile…</p>;
  }
  if (samples.length === 0) {
    return <p style={{ color: theme.colors.textMuted }}>No power data recorded for this session.</p>;
  }

  return <PowerChart samples={samples} peakPowerW={session.peakPowerW ?? 0} />;
}
