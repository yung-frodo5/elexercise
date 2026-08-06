const ENERGY_UNITS = ["Wh", "kWh", "MWh", "GWh", "TWh", "PWh"];

/** Scales a Wh value up to the largest unit whose value stays under 1000, e.g. 10,791,000 -> "10.79 MWh". */
export function formatEnergyAuto(wh: number): string {
  let value = wh;
  let unitIndex = 0;
  while (Math.abs(value) >= 1000 && unitIndex < ENERGY_UNITS.length - 1) {
    value /= 1000;
    unitIndex++;
  }
  const rounded = Math.round(value * 100) / 100;
  return `${rounded.toLocaleString()} ${ENERGY_UNITS[unitIndex]}`;
}
