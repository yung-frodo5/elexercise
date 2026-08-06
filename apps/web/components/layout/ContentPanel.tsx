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
const EXTRA_BOTTOM_PADDING_ROUTES = new Set(["/track", "/leaderboard", "/resources/equipment-analyzer", "/resources"]);

// Per design feedback, the calculator page's title should sit close to the top of the page rather
// than get the standard 0.75in margin-top + xxl padding-top every other page uses. Article-detail
// pages want the same treatment -- their large centered title reads oddly with a lot of empty
// space above it.
const REDUCED_TOP_SPACING_ROUTES = new Set(["/resources/equipment-analyzer"]);

// Article-detail pages are dynamic (/resources/articles/<slug>), so they
// can't be enumerated in either Set above -- checked separately by prefix.
const ARTICLE_DETAIL_ROUTE_PREFIX = "/resources/articles/";

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
// On narrow viewports, inch gutters + 90% width leave almost no room --
// collapse to edge-to-edge with tight padding (see .content-panel media
// query below).
export function ContentPanel({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isArticleDetail = Boolean(pathname?.startsWith(ARTICLE_DETAIL_ROUTE_PREFIX));
  const hasReducedTopSpacing = Boolean(pathname && REDUCED_TOP_SPACING_ROUTES.has(pathname)) || isArticleDetail;
  const paddingBottom =
    (pathname && EXTRA_BOTTOM_PADDING_ROUTES.has(pathname)) || isArticleDetail
      ? theme.spacing.xxl + theme.spacing.xl
      : theme.spacing.xxl;

  return (
    <>
      {/* dangerouslySetInnerHTML, not JSX text children -- the quotes in
          the data-theme selector below get HTML-escaped by React's SSR but
          left un-decoded by the browser inside <style> (a raw-text
          element), desyncing server/client text and throwing a hydration
          error (see app/layout.tsx's fuller explanation of this). */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* This panel's own geometry, published to its descendants. page.tsx's
           full-bleed accent section has to cancel exactly this much
           horizontal inset to reach the window edge, and its first-viewport
           hero section has to subtract exactly this much from the viewport
           height. Both used to restate "0.5in + xxl" as a literal, which
           silently went stale the moment the media query below collapsed
           this panel to a 12px inset -- the accent section overshot the
           window edge by 68px per side and scrolled the whole page sideways.
           Custom properties, because this is the only way a value computed
           in JS (an inline style in page.tsx) can track a breakpoint that
           only exists in CSS -- this codebase deliberately has no JS
           matchMedia hooks anywhere. Declared here in the stylesheet rather
           than the inline style prop below so the base value and its
           override sit next to each other and the override doesn't need
           !important to beat an inline declaration -- don't move these into
           the style prop. */
        .content-panel-home {
          --elex-content-inset: calc(0.5in + ${theme.spacing.xxl}px);
          --elex-content-top-offset: calc(0.5in + ${theme.spacing.xxl}px);
        }
        /* Second condition: a landscape phone or short foldable is wider
           than 640px but has no vertical room to spare, and 160px of
           horizontal panel chrome out of an 844px-wide screen reads as a
           sliver. Bounded by max-width: 900px so an ordinary desktop window
           that happens to be short keeps its panel framing. Comma is OR in
           a media query list, so both conditions share one rule body. */
        @media (max-width: 640px), (max-width: 900px) and (max-height: 500px) {
          .content-panel {
            width: 100% !important;
            max-width: none !important;
            margin: 12px 0 20px 0 !important;
            padding: 12px 12px 20px 12px !important;
          }
          .content-panel-home {
            margin: 12px 0 20px 0 !important;
            padding: 12px 12px 20px 12px !important;
            /* margin-left/right 0 + padding-left/right 12 */
            --elex-content-inset: 12px;
            /* margin-top 12 + padding-top 12 (the padding shorthand above
               resets padding-top to 12, not xxl) */
            --elex-content-top-offset: 24px;
          }
        }
      `,
        }}
      />
      <div
        className={isHome ? "content-panel content-panel-home" : "content-panel"}
        style={
          isHome
            ? {
                margin: "0.5in 0.5in 1in 0.5in",
                backgroundColor: theme.colors.themed.chromeBg,
                color: theme.colors.themed.navy,
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
                backgroundColor: theme.colors.themed.chromeBg,
                color: theme.colors.themed.navy,
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
