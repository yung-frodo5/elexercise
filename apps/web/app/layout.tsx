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
            background per design feedback. */}
        <style>{`
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
        `}</style>
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
        {/* Header/footer are position:fixed (out of flow) so content needs matching padding. */}
        <div style={{ paddingTop: HEADER_HEIGHT, paddingBottom: FOOTER_HEIGHT }}>
          <ContentPanel>{children}</ContentPanel>
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
