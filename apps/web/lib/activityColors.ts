import { theme } from "@exercise-tracker/design-tokens";
import { withAlpha } from "./color";

const TAG_PALETTE = [
  { fg: theme.colors.secondaryGreen, bg: withAlpha(theme.colors.primaryGreen, 0.22) },
  { fg: "#1f4e79", bg: withAlpha("#2a6f97", 0.18) },
  { fg: theme.colors.colorContrast, bg: withAlpha(theme.colors.colorContrast, 0.18) },
  { fg: "#8a3a3c", bg: withAlpha(theme.colors.error, 0.16) },
  { fg: "#5b462b", bg: withAlpha(theme.colors.border, 0.16) },
] as const;

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function sportTagColors(sport: string): { fg: string; bg: string } {
  const i = hashString(sport.toLowerCase()) % TAG_PALETTE.length;
  return TAG_PALETTE[i]!;
}

/** Same foreground as the sport tag — used for chart series + activity toggles. */
export function activityColorForSport(sport: string): string {
  return sportTagColors(sport).fg;
}
