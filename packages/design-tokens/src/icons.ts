// Icon glyphs shared by web and mobile. Plain Unicode/emoji rather than a
// vector icon font/component set — consistent with this package's no-build-step,
// framework-agnostic conventions (see colors.ts/spacing.ts/typography.ts), and
// rendered natively with a plain <span>/<Text> on either platform with no
// extra dependency or native linking required.
export const icons = {
  menu: "☰",
  home: "🏠",
  dashboard: "💪",
  profile: "👤",
  login: "🔒",
  settings: "⚙️",
  close: "✕",
} as const;
