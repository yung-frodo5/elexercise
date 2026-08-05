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

export interface ThemedColor {
  light: string;
  dark: string;
}

// Web's systematic light/dark token set -- every value here is a plain hex
// pair (not a var() string), generalizing the navy/navyStatic mechanism
// above to every color that needs to react to dark mode. apps/web derives
// both its CSS custom properties (see webTheme.ts's generateThemeCss) and
// its inline style values from this one object, so a light/dark pair is
// only ever declared once. Not consumed by apps/mobile (mobile keeps using
// the flat `colors` above -- see navy's comment).
export const themedColors = {
  // Body/article text and anything else that sits on the ambient canvas or
  // chrome (header, content panel). Named `navy` (not e.g. `text`) on
  // purpose: it drives the SAME --elex-navy CSS variable the legacy `navy`
  // key above already used, via webTheme.ts's generateThemeCss -- keeping
  // the variable name unchanged means the ~190 existing (already-correct)
  // `theme.colors.navy` call sites across apps/web keep flipping with zero
  // edits, instead of silently freezing at their light value the moment
  // this object took over generating the CSS.
  navy: { light: "#0033A0", dark: "#FFFFFF" },
  // Inline links and footnote markers inside article content.
  link: { light: "#386641", dark: "#8FD18F" },
  // The wordmark, "Log in" link, and profile-name text/heading green.
  brandAccent: { light: "#228B22", dark: "#4ED164" },
  // Error text on the ambient canvas or chrome (as opposed to error text on
  // a static light surface -- see staticColors.errorInk below).
  error: { light: "#bc4749", dark: "#FF9B9D" },
  // The page's own background.
  canvasBg: { light: "#FFFFFF", dark: "#001F3F" },
  // Header / content-panel background -- same value as canvasBg today, but
  // named separately since "chrome" and "canvas" are conceptually distinct
  // surfaces that happen to currently share a color.
  chromeBg: { light: "#FFFFFF", dark: "#001F3F" },
  // A UI-component (non-text) tier for elements that need to visually
  // separate from chromeBg -- e.g. the navbar's hamburger button, which
  // otherwise blends into a dark header.
  controlOnChrome: { light: "#002FA7", dark: "#5C7FE0" },
  // The home page's definition-panel text.
  definitionText: { light: "#000000", dark: "#FFFFFF" },
} as const satisfies Record<string, ThemedColor>;

// Colors for surfaces that are deliberately light in *both* themes (the
// history table, calculator panels, tooltips, the light-blue accent
// panels) -- a separate namespace, not a name suffix, so picking the wrong
// tier means typing `.static.` vs `.themed.` explicitly rather than
// pattern-matching a "Static" suffix from memory (the mistake that caused
// article text to render as navyStatic on a background that actually
// flips to dark).
export const staticColors = {
  // SoftPanel, white history rows, expanded workout-history cells.
  panelBg: "#FFFFFF",
  // Text on a static panel, and the base color for withAlpha() tints that
  // must not shift with theme (was `navyStatic` above).
  ink: "#0033A0",
  // The light-blue accent tone used for header rows / callouts / tooltips
  // across the app -- previously duplicated as a raw "#D6E9FF" literal in
  // ~15 places.
  accentPanelBg: "#D6E9FF",
  // The static navy card/panel background used by LoginModal and the nav
  // dropdown -- always this color in both themes.
  darkPanelBg: "#002FA7",
  // A darker red for error text/chips on static LIGHT surfaces
  // (EquipmentEditor's light-blue panel) where the plain `error` hex
  // doesn't clear WCAG AA. Don't use this on darkPanelBg -- it's far too
  // dark to read there; see errorInkOnDarkPanel below.
  errorInk: "#A63D3F",
  // A lighter red for error text on the static NAVY darkPanelBg (e.g.
  // LoginModal's error message) -- errorInk above is unreadable there.
  errorInkOnDarkPanel: "#FF9B9D",
} as const;
