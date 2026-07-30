import type { Metadata } from "next";
import { theme } from "@exercise-tracker/design-tokens";
import { SiteHeader } from "../components/nav/SiteHeader";
import { SiteFooter, FOOTER_HEIGHT } from "../components/nav/SiteFooter";
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
          backgroundColor: theme.colors.background,
          color: theme.colors.textPrimary,
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
            background-color: #F0E9E9;
          }
        `}</style>
        <SiteHeader />
        {/* Header/footer are position:fixed (out of flow) so content needs matching padding. */}
        <div style={{ paddingTop: HEADER_HEIGHT, paddingBottom: FOOTER_HEIGHT }}>
          {/* The body background is the page canvas; this is the "foreground"
              panel framed by it -- top margin per design feedback. */}
          <div
            style={{
              margin: "0.75in 1in 1in 1in",
              backgroundColor: theme.colors.surface,
              padding: theme.spacing.xxl,
            }}
          >
            {children}
          </div>
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
