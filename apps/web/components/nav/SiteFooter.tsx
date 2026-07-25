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
        justifyContent: "center",
        backgroundColor: theme.colors.border,
      }}
    >
      <p style={{ margin: 0, color: "#ffffff" }}>TODO: polish footer</p>
    </footer>
  );
}
