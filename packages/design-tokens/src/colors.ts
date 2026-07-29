// Shared brand palette — the one part of this token set that reflects an
// actual design decision rather than a mechanical extraction of what was
// already hardcoded. Update here to repaint both apps at once.
export const colors = {
  primaryGreen: "#6a994e",
  secondaryGreen: "#386641",
  // Lighter than primaryGreen for better contrast against textPrimary in the
  // header/footer banners specifically — kept separate from primaryGreen so
  // it doesn't also relighten mobile buttons/backgrounds that reuse that token.
  bannerBackground: "#95c07c",
  background: "#f0e9e9",
  error: "#bc4749",
  textPrimary: "#111d13",
  textMuted: "#283f3b",
  colorContrast: "#aa7122",
  border: "#5b462b",
} as const;
