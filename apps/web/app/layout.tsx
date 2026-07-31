import type { Metadata } from "next";
import { theme } from "@exercise-tracker/design-tokens";
import { SiteHeader } from "../components/nav/SiteHeader";
import { SiteFooter, FOOTER_HEIGHT } from "../components/nav/SiteFooter";
import { ContentPanel } from "../components/layout/ContentPanel";
import { HEADER_HEIGHT } from "../lib/layoutConstants";

export const metadata: Metadata = {
  title: "elexercise",
  description: "Track live workouts and review your workout history.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: theme.typography.fontFamily.web,
          backgroundColor: "#FFFFFF",
          color: theme.colors.navy,
        }}
      >
        {/* Browsers apply their own UA font to form controls regardless of
            inherited body font-family -- this is the standard fix so inputs,
            selects, textareas, and buttons match the rest of the page instead
            of falling back to the system default. Buttons also get a shared
            background per design feedback.
            Uses dangerouslySetInnerHTML (not JSX text children) because the
            `"` characters in the attribute selectors below get HTML-escaped
            by React's server renderer but left un-decoded by the browser's
            HTML parser inside <style> (a raw-text element) -- the resulting
            server/client text mismatch was throwing a hydration error on
            every page. Raw innerHTML sidesteps the escaping entirely. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          input, textarea, select, button {
            font-family: inherit;
            font-size: inherit;
          }
          button {
            background-color: #FFFFFF;
          }
          input[type="file"]::file-selector-button,
          input[type="file"]::-webkit-file-upload-button {
            font-family: inherit;
            font-size: inherit;
            background-color: #FFFFFF;
          }
        `,
          }}
        />
        <SiteHeader />
        {/* Vertical accent ribbon along the left edge, as wide as the
            footer is tall -- fixed, spanning between the header and
            footer so it doesn't overlap either. */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: HEADER_HEIGHT,
            bottom: FOOTER_HEIGHT,
            left: 0,
            width: FOOTER_HEIGHT,
            backgroundColor: "#002FA7",
            zIndex: 50,
          }}
        />
        {/* Header/footer/ribbon are position:fixed (out of flow) — reserve matching space. */}
        <div
          style={{
            paddingTop: HEADER_HEIGHT,
            paddingBottom: `calc(${FOOTER_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
            paddingLeft: FOOTER_HEIGHT,
            boxSizing: "border-box",
          }}
        >
          <ContentPanel>{children}</ContentPanel>
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
