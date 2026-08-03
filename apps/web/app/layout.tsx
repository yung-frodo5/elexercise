import type { Metadata } from "next";
import { theme } from "@exercise-tracker/design-tokens";
import { SiteHeader } from "../components/nav/SiteHeader";
import { SiteFooter, FOOTER_HEIGHT } from "../components/nav/SiteFooter";
import { ContentPanel } from "../components/layout/ContentPanel";
import { HEADER_HEIGHT } from "../lib/layoutConstants";
import { ThemeProvider } from "../lib/ThemeContext";
import { newsreader } from "../lib/fonts";

export const metadata: Metadata = {
  title: "elexercise",
  description: "Track live workouts and review your workout history.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Clash Display isn't on Google Fonts, so next/font/google can't
            load it -- linking Fontshare's hosted stylesheet directly is
            the standard way to pull a non-Google webfont into the App
            Router. Weights 400/500/600/700 cover every place it's used --
            without a matching @font-face for a weight actually used, the
            browser fake-bolds/synthesizes it instead of rendering the
            font's real weight. */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap"
        />
      </head>
      <body
        style={{
          margin: 0,
          // Site-wide default -- Newsreader everywhere except headings and
          // table headers (Clash Display, see the h1/h2/h3 and th rules
          // below), the green pill/oval buttons (also Clash Display, set
          // per-button at their own source), and the home page definition
          // (Georgia, set locally there).
          fontFamily: newsreader.style.fontFamily,
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
          /* --elex-navy backs theme.colors.navy (see design-tokens/colors.ts)
             -- every existing "color: theme.colors.navy" call site across
             the app flips to white under dark mode for free, with no
             per-component changes needed. */
          :root {
            --elex-navy: #0033A0;
          }
          html[data-theme="dark"] {
            --elex-navy: #FFFFFF;
          }
          html[data-theme="dark"] body {
            background-color: #001F3F !important;
          }
          /* Clash Display for header/heading text everywhere -- page
             titles ("Workout Log", "Leaderboard", "Resources", ...),
             section headings ("Start a workout"/"Workout in progress",
             the calculator's "Editor"/"Results", article titles), etc.
             One global rule instead of hunting down every page, since none
             of them set their own conflicting fontFamily today.
             font-weight: 600 !important caps every heading at Semibold --
             the header wordmark ("elexercise!") is the one place Clash
             Display Bold is used, and it's a <span>/<Link>, not a heading,
             so this rule doesn't reach it. Needs !important since h1-h3
             are bold by browser default (and a couple set bold explicitly
             too), both of which this has to beat. */
          h1, h2, h3 {
            font-family: 'Clash Display', sans-serif;
            font-weight: 600 !important;
          }
          /* Clash Display, capped at Semibold, for real <th> table headers
             -- !important as a safety net beating both the "inherit" rule
             above and any per-component inline value, so this holds even
             for a <th> this sweep missed. Individual table headers also
             set this explicitly at the source (see leaderboard/page.tsx's
             headerCell) so the two stay in sync, but this is the actual
             guarantee.
             NOT applied to all buttons -- only the green pill/oval buttons
             (Add/Connect/Save/Sign in/Share/...) are Clash Display, each
             set explicitly at its own source. Plain rectangular buttons
             (e.g. the Run/Bike/Row/Strength/Walk presets) fall back to the
             body's Newsreader default instead, unset here on purpose. */
          th {
            font-family: 'Clash Display', sans-serif !important;
            font-weight: 600 !important;
          }
        `,
          }}
        />
        <ThemeProvider>
          <SiteHeader />
          {/* Vertical accent ribbon along the left edge, as wide as the
              footer is tall -- fixed, spanning between the header and
              footer so it doesn't overlap either. Already navy -- unchanged
              by dark mode, it already reads as part of the inverted canvas. */}
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
        </ThemeProvider>
      </body>
    </html>
  );
}
