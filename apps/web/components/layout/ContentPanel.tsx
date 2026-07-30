"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { theme } from "@exercise-tracker/design-tokens";

// Routes whose page content sits directly on this panel's padding with no
// extra wrapper (each renders <main style={{ padding: theme.spacing.xl }}>
// as its outermost element) -- these get extra bottom padding on the panel
// per design feedback, so the dark green space below the content is at
// least as deep as the space above it (this panel's own xxl padding-top
// plus that <main>'s xl padding-top).
const EXTRA_BOTTOM_PADDING_ROUTES = new Set(["/track", "/leaderboard", "/resources/calculator", "/resources"]);

// The body background is the page canvas; this is the "foreground" panel
// framed by it. Every page gets 0.75in of light sage on top/sides except
// the home page, which gets 0.5in -- per design feedback, route-specific,
// hence needing the pathname (and therefore a client component) rather
// than a single static margin in the server layout.
export function ContentPanel({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const sideMargin = pathname === "/" ? "0.5in" : "0.75in";
  const paddingBottom = pathname && EXTRA_BOTTOM_PADDING_ROUTES.has(pathname)
    ? theme.spacing.xxl + theme.spacing.xl
    : theme.spacing.xxl;

  return (
    <div
      style={{
        margin: `${sideMargin} ${sideMargin} 1in ${sideMargin}`,
        backgroundColor: theme.colors.surface,
        paddingTop: theme.spacing.xxl,
        paddingLeft: theme.spacing.xxl,
        paddingRight: theme.spacing.xxl,
        paddingBottom,
      }}
    >
      {children}
    </div>
  );
}
