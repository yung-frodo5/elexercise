import { theme } from "@exercise-tracker/design-tokens";

// Fixed pixel height so the root layout can reserve matching space above it
// (a fixed-position element is out of flow and would otherwise overlap content).
export const FOOTER_HEIGHT = 56;

export function SiteFooter() {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: FOOTER_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: theme.spacing.lg * 4,
        paddingRight: theme.spacing.lg * 4,
        backgroundColor: theme.colors.bannerBackground,
      }}
    >
      <span style={{ color: theme.colors.textPrimary }}>Est. 2026</span>
      <a
        href="mailto:noah.c.korotzer@gmail.com"
        style={{ color: theme.colors.secondaryGreen, textDecoration: "underline" }}
      >
        Contact Us
      </a>
    </footer>
  );
}
