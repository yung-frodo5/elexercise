import { theme, withAlpha } from "@exercise-tracker/design-tokens";

// Avoid `border` as a tag color — brown is hairline chrome; body ink is navy.
const TAG_PALETTE = [
  { fg: theme.colors.secondaryGreen, bg: withAlpha(theme.colors.primaryGreen, 0.22) },
  { fg: theme.colors.accentBlue, bg: withAlpha(theme.colors.accentBlueMuted, 0.18) },
  { fg: theme.colors.colorContrast, bg: withAlpha(theme.colors.colorContrast, 0.18) },
  { fg: theme.colors.accentBrick, bg: withAlpha(theme.colors.error, 0.16) },
  { fg: theme.colors.primaryGreen, bg: withAlpha(theme.colors.sageAccent, 0.45) },
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

/** Compact sport glyph for feed rows (unicode, no icon font). */
export function sportIcon(sport: string): string {
  const key = sport.trim().toLowerCase();
  if (key.includes("bike") || key.includes("cycl")) return "🚴";
  if (key.includes("run") || key.includes("jog")) return "🏃";
  if (key.includes("swim")) return "🏊";
  if (key.includes("row")) return "🚣";
  if (key.includes("walk") || key.includes("hik")) return "🚶";
  if (key.includes("strength") || key.includes("lift") || key.includes("weight")) return "💪";
  if (key.includes("yoga") || key.includes("stretch")) return "🧘";
  return "⚡";
}
