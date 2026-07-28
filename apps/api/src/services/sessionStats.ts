// Pure aggregation over a completed session's power samples. Data-source
// agnostic — used the same way whether the samples came from the fake
// simulator or (eventually) real hardware.

export interface SessionStats {
  avgPowerW: number;
  peakPowerW: number;
  totalEnergyJoules: number;
}

export function computeSessionStats(samples: { tMs: number; powerW: number }[]): SessionStats | null {
  if (samples.length === 0) return null;

  const powers = samples.map((s) => s.powerW);
  const peakPowerW = Math.max(...powers);

  let totalEnergyJoules = 0;
  for (let i = 1; i < samples.length; i++) {
    const dtSeconds = (samples[i].tMs - samples[i - 1].tMs) / 1000;
    const avgPowerOverStep = (samples[i - 1].powerW + samples[i].powerW) / 2;
    totalEnergyJoules += avgPowerOverStep * dtSeconds;
  }

  // Energy = power x time, so dividing back out gives the physically
  // consistent time-weighted average power. A plain mean of sample values
  // would over-weight whichever stretch of the session happened to be
  // sampled more densely, which matters once samples aren't evenly spaced.
  const elapsedSeconds = (samples[samples.length - 1].tMs - samples[0].tMs) / 1000;
  const avgPowerW = elapsedSeconds > 0 ? totalEnergyJoules / elapsedSeconds : powers[0];

  return { avgPowerW, peakPowerW, totalEnergyJoules };
}
