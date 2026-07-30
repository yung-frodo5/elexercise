// Type scale extracted from today's literal values across apps/web and
// apps/mobile — adopting this is a no-op visually.
//
// fontFamily can't be a single cross-platform string: web takes a CSS font
// stack, React Native takes one named font (or undefined for the OS
// default, which is what apps/mobile relies on today). Custom font loading
// per platform is a future concern, not something this pass solves.
export const typography = {
  fontFamily: {
    web: "sans-serif",
    native: undefined as string | undefined,
    // Display/accent face for headings like the landing hero — web-only for now.
    mono: "monospace",
  },
  size: {
    // Compact uppercase labels (table headers, chart titles).
    xxs: 11,
    xs: 13,
    sm: 14,
    md: 16,
    lg: 24,
    xl: 28,
    xxl: 32,
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;
