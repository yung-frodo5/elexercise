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

/** Wordy elapsed time for prose, e.g. "2 hours 15 minutes" or "45 minutes". */
export function formatDurationHoursMinutes(totalSeconds: number): string {
  const totalMinutes = Math.round(Math.max(0, totalSeconds) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hoursPart = `${hours} ${hours === 1 ? "hour" : "hours"}`;
  const minutesPart = `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  return hours > 0 ? `${hoursPart} ${minutesPart}` : minutesPart;
}

export function formatEnergy(joules: number): string {
  const wh = joules / 3600;
  return `${wh.toFixed(wh < 10 ? 2 : 1)} Wh`;
}

interface EnergyComparisonTier {
  // Exclusive upper bound of this tier's kWh range; the last tier has no
  // upper bound. Tiers are listed in ascending order.
  maxKWh: number;
  // Energy per one unit of the comparison (e.g. 0.1 kWh per hour of TV) --
  // the input's kWh divided by this gives the multiplier to display.
  unitKWh: number;
  singular: string;
  plural: string;
}

// Real-world figures matched to packages/content/src/howMuchPower.ts's
// "Common Energy Quantities" table rows (phone/laptop/TV-hour/EV-charge
// figures there are ~0.013/~0.05/~0.1/~75 kWh) so this sentence and the
// "Learn more" reference table tell a consistent story, even though the
// data isn't literally shared between the two packages.
const ENERGY_COMPARISON_TIERS: EnergyComparisonTier[] = [
  { maxKWh: 0.05, unitKWh: 0.013, singular: "phone charge", plural: "phone charges" },
  { maxKWh: 0.1, unitKWh: 0.05, singular: "laptop charge", plural: "laptop charges" },
  { maxKWh: 1, unitKWh: 0.1, singular: "hour of television use", plural: "hours of television use" },
  { maxKWh: 75, unitKWh: 1.2, singular: "hour of powering a home", plural: "hours of powering a home" },
  { maxKWh: Infinity, unitKWh: 75, singular: "EV charge", plural: "EV charges" },
];

/** e.g. "3 hours of television use" for 270.1 Wh. Picks the shortlist tier whose range contains the value, then scales to the nearest whole multiple of that tier's reference unit. */
export function formatEnergyComparison(wh: number): string {
  const kWh = wh / 1000;
  const tier =
    ENERGY_COMPARISON_TIERS.find((t) => kWh < t.maxKWh) ?? ENERGY_COMPARISON_TIERS[ENERGY_COMPARISON_TIERS.length - 1];
  const multiplier = Math.max(1, Math.round(kWh / tier.unitKWh));
  return `${multiplier} ${multiplier === 1 ? tier.singular : tier.plural}`;
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
