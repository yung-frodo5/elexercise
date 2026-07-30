import type { PowerSamplePoint } from "./powerSampleTypes";

/** Cap chart points so chart renderers stay responsive on long sessions. */
export const MAX_PLOTTED_POWER_POINTS = 400;

/** Evenly thin a series for plotting without changing endpoints. */
export function downsamplePowerSamples(
  points: PowerSamplePoint[],
  maxPoints: number = MAX_PLOTTED_POWER_POINTS
): PowerSamplePoint[] {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  const sampled = points.filter((_, i) => i % step === 0);
  const last = points[points.length - 1];
  if (last && sampled[sampled.length - 1] !== last) sampled.push(last);
  return sampled;
}

/** Nice Y-axis ceiling a bit above observed peak. */
export function powerAxisMaxW(peakPowerW: number): number {
  return Math.max(100, Math.ceil((peakPowerW + 20) / 50) * 50);
}
