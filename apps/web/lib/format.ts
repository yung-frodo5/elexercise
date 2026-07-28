export function formatDuration(totalSeconds: number): string {
  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatEnergy(joules: number): string {
  const wh = joules / 3600;
  return `${wh.toFixed(wh < 10 ? 2 : 1)} Wh`;
}
