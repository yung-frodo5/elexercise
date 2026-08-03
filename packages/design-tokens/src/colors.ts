// Shared brand palette — the one part of this token set that reflects an
// actual design decision rather than a mechanical extraction of what was
// already hardcoded. Update here to repaint both apps at once.
//
// textPrimary/textMuted stay white here since apps/mobile still relies on
// them globally (Text.defaultProps in App.tsx) against its own black/green
// screens -- apps/web's recent "white text -> navy" pass (on a now-white
// canvas, dark-green panel removed) is applied there directly via
// theme.colors.navy at each web call site instead of changing this shared
// token, so mobile's contrast against its own (unchanged) dark screens
// doesn't break.
export const colors = {
  primaryGreen: "#6a994e",
  secondaryGreen: "#386641",
  // General-purpose accent -- used for emphasized nav dropdown items.
  sageAccent: "#95C07C",
  bannerBackground: "#000000",
  // Mobile's screen-canvas color; apps/web no longer uses this as a
  // background (its canvas is plain white now).
  background: "#B5D3A3",
  // Mobile's dark-green panel/screen color; apps/web no longer uses this
  // as a background (the dark green panel was removed there).
  surface: "#0B3D0B",
  error: "#bc4749",
  // Uniform across primary and muted text -- still white; see the note above.
  textPrimary: "#FFFFFF",
  textMuted: "#FFFFFF",
  colorContrast: "#aa7122",
  border: "#5b462b",
  // apps/web's replacement for textPrimary/textMuted now that its canvas
  // is white -- not shared with mobile (see note above). Brightened from
  // an earlier near-black #001F3F per design feedback ("more blue").
  //
  // A CSS var (not a plain hex) so every existing `color: theme.colors.navy`
  // call site automatically flips to white for dark mode with no per-file
  // changes -- apps/web/app/layout.tsx defines --elex-navy: <this hex> at
  // :root and swaps it to white under html[data-theme="dark"]. Anything
  // that needs the literal navy hex regardless of theme (background fills,
  // withAlpha() shadows -- both would break on a var string, since
  // withAlpha parses its input as raw hex) uses navyStatic instead.
  navy: "var(--elex-navy, #0033A0)",
  // Raw hex twin of `navy`, for the handful of call sites (background
  // fills, withAlpha() shadow tints) that need a real hex value that
  // doesn't participate in the dark-mode text-color flip. See `navy` above.
  navyStatic: "#0033A0",
  // Extra accents for hashed sport tags / multi-series charts.
  accentBlue: "#1f4e79",
  accentBlueMuted: "#2a6f97",
  accentBrick: "#8a3a3c",
} as const;
