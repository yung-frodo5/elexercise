"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { theme } from "@exercise-tracker/design-tokens";

// Routes whose page content sits directly on this panel's padding with no
// extra wrapper (each renders <main style={{ padding: theme.spacing.xl }}>
// as its outermost element) -- these get extra bottom padding on the panel
// per design feedback, so the space below the content is at least as deep
// as the space above it (this panel's own xxl padding-top plus that
// <main>'s xl padding-top).
const EXTRA_BOTTOM_PADDING_ROUTES = new Set(["/track", "/leaderboard", "/resources/equipment-builder", "/resources"]);

// Per design feedback, the calculator page's title should sit close to the top of the page rather
// than get the standard 0.75in margin-top + xxl padding-top every other page uses.
const REDUCED_TOP_SPACING_ROUTES = new Set(["/resources/equipment-builder"]);

// Used to frame page content against the page canvas -- white now, not the
// dark green it used to be (removed per design feedback). Every page gets
// 0.75in of margin on top/sides except the home page,
// which gets 0.5in -- per design feedback, route-specific, hence needing
// the pathname (and therefore a client component) rather than a single
// static margin in the server layout.
//
// Home page's side margin stays a fixed 0.5in. Every other page instead
// gets width: 90% (a 5%-per-side gutter that scales with the window,
// instead of a fixed inch value staying constant as it resizes) capped by
// max-width: 1040px (matching the widest page content, History/Calculator)
// so past that point extra window width becomes more margin instead of
// this panel growing indefinitely wider than any page's actual content.
// margin uses the literal "auto" keyword (not a percentage) so the browser
// centers whichever of the two constraints (90% vs 1040px cap) actually
// applies, rather than leaving lopsided leftover space.
//
// On narrow viewports, inch gutters + 90% width leave almost no room once
// the left navy ribbon is reserved — collapse to edge-to-edge with tight
// padding (see .content-panel media query below).
export function ContentPanel({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const hasReducedTopSpacing = Boolean(pathname && REDUCED_TOP_SPACING_ROUTES.has(pathname));
  const paddingBottom =
    pathname && EXTRA_BOTTOM_PADDING_ROUTES.has(pathname)
      ? theme.spacing.xxl + theme.spacing.xl
      : theme.spacing.xxl;

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .content-panel {
            width: 100% !important;
            max-width: none !important;
            margin: 12px 0 20px 0 !important;
            padding: 12px 12px 20px 12px !important;
          }
          .content-panel-home {
            margin: 12px 0 20px 0 !important;
            padding: 12px 12px 20px 12px !important;
          }
        }
      `}</style>
      <div
        className={isHome ? "content-panel content-panel-home" : "content-panel"}
        style={
          isHome
            ? {
                margin: "0.5in 0.5in 1in 0.5in",
                backgroundColor: "#FFFFFF",
                color: theme.colors.navy,
                paddingTop: theme.spacing.xxl,
                paddingLeft: theme.spacing.xxl,
                paddingRight: theme.spacing.xxl,
                paddingBottom,
                boxSizing: "border-box",
              }
            : {
                width: "90%",
                maxWidth: 1040,
                boxSizing: "border-box",
                margin: hasReducedTopSpacing ? `${theme.spacing.sm}px auto 1in auto` : "0.75in auto 1in auto",
                backgroundColor: "#FFFFFF",
                color: theme.colors.navy,
                paddingTop: hasReducedTopSpacing ? theme.spacing.sm : theme.spacing.xxl,
                paddingLeft: theme.spacing.xxl,
                paddingRight: theme.spacing.xxl,
                paddingBottom,
              }
        }
      >
        {children}
      </div>
    </>
  );
}
