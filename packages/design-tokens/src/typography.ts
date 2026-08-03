// Type scale extracted from today's literal values across apps/web and
// apps/mobile — adopting this is a no-op visually.
//
// fontFamily can't be a single cross-platform string: web takes a CSS font
// stack, React Native takes one named font (or undefined for the OS
// default, which is what apps/mobile relies on today). A custom digital/LED
// face and later a geometric sans were both tried and reverted per design
// feedback. web now matches mono -- the header's "elexercise!" wordmark was
// already set in monospace, and design feedback asked for all body text to
// match it.
export const typography = {
  fontFamily: {
    web: "monospace",
    native: undefined as string | undefined,
    mono: "monospace",
  },
  size: {
    // Compact uppercase labels (table headers, chart titles).
    xxs: 11,
    // Was two steps (xs: 13, sm: 14) -- merged since the 1px gap wasn't
    // tracking any real semantic distinction across call sites, just
    // whichever token a given file happened to reach for.
    sm: 14,
    md: 16,
    lg: 24,
    // Was two steps (xl: 28, xxl: 32) -- dropped xxl, its one consumer
    // (mobile's LoginScreen title) now uses xl instead.
    xl: 28,
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;
