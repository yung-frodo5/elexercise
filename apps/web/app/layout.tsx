import type { Metadata } from "next";
import { theme } from "@exercise-tracker/design-tokens";
import { SiteHeader, HEADER_HEIGHT } from "../components/nav/SiteHeader";

export const metadata: Metadata = {
  title: "Exercise Tracker",
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
        <SiteHeader />
        {/* Header is position:fixed (out of flow) so content needs matching top padding. */}
        <div style={{ paddingTop: HEADER_HEIGHT }}>{children}</div>
      </body>
    </html>
  );
}
