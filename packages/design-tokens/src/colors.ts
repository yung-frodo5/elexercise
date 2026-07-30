// Shared brand palette — the one part of this token set that reflects an
// actual design decision rather than a mechanical extraction of what was
// already hardcoded. Update here to repaint both apps at once.
//
// Sage-green page canvas framing a dark-green "foreground" content panel,
// white text (design feedback pass, iterated from an earlier black/neon-LED
// palette).
export const colors = {
  primaryGreen: "#6a994e",
  secondaryGreen: "#386641",
  // General-purpose accent -- used for the header, the calculator's Outputs
  // column, and emphasized nav dropdown items.
  sageAccent: "#95C07C",
  bannerBackground: "#000000",
  // Outermost page canvas -- a lighter tint of sageAccent (same hue, mixed
  // toward white), so it reads as a distinct but complementary shade rather
  // than an exact match to the header. The margined content panel (surface)
  // sits on top of it.
  background: "#B5D3A3",
  // The "foreground" content panel color -- what actually holds page
  // content, framed by background's margin (see apps/web/app/layout.tsx).
  surface: "#0B3D0B",
  error: "#bc4749",
  // Uniform across primary and muted text.
  textPrimary: "#FFFFFF",
  textMuted: "#FFFFFF",
  colorContrast: "#aa7122",
  border: "#5b462b",
  // Extra accents for hashed sport tags / multi-series charts.
  accentBlue: "#1f4e79",
  accentBlueMuted: "#2a6f97",
  accentBrick: "#8a3a3c",
} as const;
