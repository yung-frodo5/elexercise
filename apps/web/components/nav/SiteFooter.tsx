import { theme } from "@exercise-tracker/design-tokens";
import { ExternalLink } from "../ui/ExternalLink";

// Fixed pixel height so the root layout can reserve matching space above it
// (a fixed-position element is out of flow and would otherwise overlap content).
export const FOOTER_HEIGHT = 56;

export function SiteFooter() {
  return (
    <>
      <style>{`
        @media (max-width: 480px) {
          .site-footer-icon-credit { display: none; }
        }
      `}</style>
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
          gap: theme.spacing.sm,
          paddingLeft: FOOTER_HEIGHT,
          paddingRight: theme.spacing.lg,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          backgroundColor: "#D6E9FF",
          boxSizing: "border-box",
        }}
      >
        <span style={{ color: theme.colors.error, whiteSpace: "nowrap" }}>Est. 2026</span>
        <a
          href="mailto:noah.c.korotzer@gmail.com"
          style={{ color: theme.colors.error, textDecoration: "underline", whiteSpace: "nowrap" }}
        >
          Contact Us
        </a>
        <ExternalLink
          className="site-footer-icon-credit"
          href="https://www.flaticon.com/free-icons/renewable-energy"
          title="renewable energy icons"
          style={{ color: theme.colors.error, fontSize: 12 }}
        >
          Icon by Indah Rusiati
        </ExternalLink>
      </footer>
    </>
  );
}
