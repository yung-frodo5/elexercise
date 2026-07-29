// $/workout values can be very small (e.g. -$0.0006), where toFixed(2) would
// display a misleading "$0.00" — show enough decimal places to surface the
// first significant digit instead.
export function formatUsdPerWorkout(value: number): string {
  const abs = Math.abs(value);
  const decimals = abs !== 0 && abs < 0.01 ? 4 : 2;
  const sign = value < 0 ? "-" : "";
  return `${sign}$${abs.toFixed(decimals)}`;
}

export function formatKwh(value: number): string {
  return `${value.toFixed(1)} kWh`;
}

export function formatKg(value: number): string {
  return `${value.toFixed(1)} kg CO2e`;
}

export function formatGrams(value: number): string {
  return `${value.toFixed(1)} g CO2e`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
