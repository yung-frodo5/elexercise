import { theme } from "@exercise-tracker/design-tokens";
import { ExternalLink } from "../ui/ExternalLink";

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
        paddingLeft: theme.spacing.lg,
        paddingRight: theme.spacing.lg,
        backgroundColor: theme.colors.sageAccent,
      }}
    >
      <span style={{ color: theme.colors.border }}>Est. 2026</span>
      <a
        href="mailto:noah.c.korotzer@gmail.com"
        style={{ color: theme.colors.border, textDecoration: "underline" }}
      >
        Contact Us
      </a>
      <ExternalLink
        href="https://www.flaticon.com/free-icons/renewable-energy"
        title="renewable energy icons"
        style={{ color: theme.colors.border, fontSize: 12 }}
      >
        Icon by Indah Rusiati
      </ExternalLink>
    </footer>
  );
}
