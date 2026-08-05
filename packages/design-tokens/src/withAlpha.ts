/** Apply alpha to a `#rrggbb` token without inventing a second palette. */
export function withAlpha(hex: string, alpha: number): string {
  if (hex.startsWith("var(")) {
    throw new Error(
      `withAlpha() received a CSS var() string ("${hex}") -- pass a static hex from theme.colors.static.* (or navyStatic) instead.`
    );
  }
  const raw = hex.replace("#", "");
  if (raw.length !== 6) return hex;
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
