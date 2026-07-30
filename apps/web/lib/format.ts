export function formatDuration(totalSeconds: number): string {
  const rounded = Math.max(0, Math.round(totalSeconds));
  // Past one hour, roll minutes into H:MM:SS (75:00 → 1:15:00).
  if (rounded >= 3600) {
    const hours = Math.floor(rounded / 3600);
    const minutes = Math.floor((rounded % 3600) / 60);
    const seconds = rounded % 60;
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Elapsed time for tables/detail, e.g. 1:12:05 or 0:30:00. */
export function formatDurationHms(totalSeconds: number): string {
  const rounded = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatEnergy(joules: number): string {
  const wh = joules / 3600;
  return `${wh.toFixed(wh < 10 ? 2 : 1)} Wh`;
}

// Typical capacities, smallest first, for putting generated energy in
// relatable terms. The comparison item is picked so the percentage never
// exceeds 100% -- small totals compare against a phone, larger ones scale
// up to a laptop, a home, or an electric car instead of reporting, say, a
// phone charged to 2800%.
const ENERGY_COMPARISONS: { verb: string; label: string; capacityWh: number }[] = [
  { verb: "charge", label: "a phone", capacityWh: 12 },
  { verb: "charge", label: "a laptop", capacityWh: 50 },
  { verb: "power", label: "a home for an hour", capacityWh: 1200 },
  { verb: "charge", label: "an electric car", capacityWh: 60000 },
];

/** e.g. "enough to charge a laptop to 64%". Caps at 100% even past the largest reference. */
export function formatEnergyComparison(wh: number): string {
  const item = ENERGY_COMPARISONS.find((c) => wh <= c.capacityWh) ?? ENERGY_COMPARISONS[ENERGY_COMPARISONS.length - 1];
  const pct = Math.min(100, Math.round((wh / item.capacityWh) * 100));
  return `enough to ${item.verb} ${item.label} to ${pct}%`;
}

/** Watts with unit, or em dash when missing. */
export function formatPowerW(watts: number | undefined): string {
  return watts !== undefined ? `${Math.round(watts)} W` : "—";
}

/** Activity date, e.g. Sun, 7/26/2026. */
export function formatWorkoutDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}
