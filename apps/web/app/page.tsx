"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { GraphicKey } from "@exercise-tracker/content";
import { theme } from "@exercise-tracker/design-tokens";
import { SoftPanel } from "../components/ui/SoftPanel";
import { FramedImage } from "../components/content/FramedImage";
import { graphicAssets } from "../lib/content/graphicAssets";
import { HEADER_HEIGHT } from "../lib/layoutConstants";
import { FOOTER_HEIGHT } from "../components/nav/SiteFooter";

// The fixed header/footer (reserved via padding in layout.tsx) and
// ContentPanel's own home-branch top margin (0.5in = 48px) + top padding
// (xxl) all eat into the viewport before this section's own box even
// starts -- a plain "80vh" doesn't know about any of that, so on a typical
// screen the scroll indicator at this section's bottom ends up below the
// fold. This computes the actual height available in the first-load
// viewport instead.
const DEFINITION_SECTION_HEIGHT = `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px - 48px - ${theme.spacing.xxl}px)`;

interface LandingLink {
  href: string;
  title: string;
  description: ReactNode;
  // Preview image shown alongside the title/description -- omitted for
  // resources that don't have one yet.
  graphicKey?: GraphicKey;
  imageAlt?: string;
}

const LANDING_LINKS: LandingLink[] = [
  {
    href: "/resources/articles/what-is-elexercise",
    title: "What is elexercise?",
    description: (
      <>
        Elexercise takes aim at a global-scale absurdity:{" "}
        <strong>humans currently do an immense amount of useless work</strong>. Pedal to spin a wheel for a little
        while. Lift weights up and down, repeatedly. Climb up a wall, then climb back down. Meanwhile, gyms consume
        power to run power-intensive HVAC systems and cardio equipment. Step back for a second and think about the
        fitness industry at large: we burn fossil fuels to generate electricity so that we can do useless work more
        comfortably. If we could physically feel how much work is required to generate the electricity we use, would
        it impact our consumption habits?
        <br />
        <br />
        <strong>Read more &gt;&gt;</strong>
      </>
    ),
    graphicKey: "what-is-elexercise-diagram",
    imageAlt:
      "Diagram of a gym designed as a community resilience hub, with rooftop solar panels, exercise equipment, bicycle parking, EV charging, and backup power.",
  },
  {
    href: "/resources/articles/how-much-power",
    title: "How Much Power?",
    description: (
      <>
        A single hard workout can generate 0.375 kWh -- nearly 30 iPhone charges. Scale that up and{" "}
        <strong>human power alone could offset up to 83% of a gym&rsquo;s annual electricity bill</strong>, with U.S.
        gym
        members collectively capable of generating an estimated 2.4 TWh a year, enough to power 220,000 households.
        <br />
        <br />
        <strong>Read more &gt;&gt;</strong>
      </>
    ),
    graphicKey: "how-much-power-preview",
    imageAlt:
      "Workout history table and power output chart for a combined run and bike session, showing energy generated and average/peak power for each segment.",
  },
  {
    href: "/resources/articles/is-the-power-generation-worth-it",
    title: "Is It Cheaper?",
    description: (
      <>
        We assert that <strong>elexercise equipment is cheaper than its traditional counterparts</strong> in many
        scenarios, when accounting for the electricity generation over its lifetime. This cost-benefit analysis
        depends on many factors, including capital costs, electricity prices, energy generation per workout, and
        more.
        <br />
        <br />
        <strong>Read more &gt;&gt;</strong>
      </>
    ),
    graphicKey: "power-generation-treadmill-comp",
    imageAlt:
      "Line chart comparing lifetime cost across a passive, motorized, and electricity-generating treadmill in Hawaii, showing the motorized treadmill costing over $1,800 more than the electricity-generating option over 7 years",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* A real <style> rule is needed for the mobile media query below,
          which inline styles can't express. Set via dangerouslySetInnerHTML,
          not plain JSX text children -- React HTML-escapes plain children
          (quotes/">"/apostrophes in the comments below become
          &quot;/&gt;/&#39;), but a <style> tag's content is raw text per the
          HTML spec, so the browser keeps those entities literal instead of
          decoding them. That desyncs the SSR markup from what React computes
          on the client, causing a hydration mismatch. dangerouslySetInnerHTML
          skips escaping entirely, so both renders produce identical raw
          CSS. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* The headword's 60px nowrap text is wider than any phone viewport
           -- without this it forces the whole page to scroll horizontally.
           !important is needed to beat the matching inline styles. */
        @media (max-width: 600px) {
          .definition-wrap { width: 100%; box-sizing: border-box; }
          .definition-panel { font-size: 26px !important; padding: 16px !important; }
          .definition-headword { white-space: normal !important; font-size: 30px !important; }
          .definition-body-line { padding-left: 16px !important; }
        }
        /* Below the row/column breakpoint, every card stacks in DOM order
           (image, then text) regardless of its alternating side -- the
           image-left vs. image-right choice only applies once there's room
           for a row.
           Keyed off the cards container's own rendered width via a
           container query, not the viewport -- the content panel's own
           margins/padding eat horizontal space that a viewport-width media
           query can't see, which previously caused the row layout to kick
           in before there was actually enough room and squeeze the text
           column down to a sliver. */
        .landing-cards { container-type: inline-size; }
        .landing-card-row {
          display: flex;
          flex-direction: column;
          gap: ${theme.spacing.lg}px;
        }
        .landing-card-image { width: 100%; max-width: 480px; }
        .landing-card-text { width: 100%; }
        @container (min-width: 720px) {
          .landing-card-row { flex-direction: row; align-items: center; }
          .landing-card-image { width: auto; flex: 0 0 400px; }
          .landing-card-text { width: auto; flex: 1 1 260px; }
          .landing-card-row--right > .landing-card-image { order: 2; }
          .landing-card-row--right > .landing-card-text { order: 1; }
        }
        @keyframes elexScrollIndicatorBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        .scroll-indicator {
          animation: elexScrollIndicatorBounce 1.6s ease-in-out infinite;
        }
      `,
        }}
      />

      {/* Its own full-viewport-height section, not just top padding on the
          shared one below -- on load, this is the only thing on screen
          (a "clean display of the definition only"); the article cards
          start exactly at the bottom of the viewport, so they're only
          reachable by actually scrolling, not just visible tucked under a
          large top margin. */}
      <section
        style={{
          minHeight: DEFINITION_SECTION_HEIGHT,
          paddingTop: theme.spacing.xl,
          paddingLeft: theme.spacing.xxl,
          paddingRight: theme.spacing.xxl,
          // flex-start (not center) -- the definition sits close to the
          // top, and the leftover space (now larger, since it's no longer
          // split evenly above/below) collects below it, where the scroll
          // indicator lives.
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <div className="definition-wrap">
          <div
            className="definition-panel"
            style={{
              // The definition panel itself has no background of its own --
              // it sits directly on the home page's canvas, which inverts to
              // dark navy in dark mode, so its text needs to flip too.
              color: theme.colors.themed.definitionText,
              padding: theme.spacing.xl,
              borderRadius: theme.radii.lg,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 48,
            }}
          >
            <p className="definition-headword" style={{ margin: 0, whiteSpace: "nowrap", fontSize: 60 }}>
              <span style={{ fontWeight: theme.typography.weight.bold }}>elexercise</span>{" "}
              \ɪˈlɛk &middot; sɚ &middot; saɪz\{" "}
              <button
                type="button"
                aria-label="Play pronunciation"
                onClick={() => {
                  void new Audio("/elexercise.m4a").play();
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 32,
                  verticalAlign: "middle",
                  padding: 0,
                }}
              >
                🔊
              </button>
            </p>
            <p
              className="definition-body-line"
              style={{ margin: 0, marginTop: theme.spacing.xxl, paddingLeft: theme.spacing.xxl * 2 }}
            >
              <span style={{ fontWeight: theme.typography.weight.bold, fontStyle: "italic" }}>verb.</span> to produce
              electricity through exercise
            </p>
            <p
              className="definition-body-line"
              style={{ margin: 0, marginTop: theme.spacing.xxl, paddingLeft: theme.spacing.xxl * 2 }}
            >
              <span style={{ fontWeight: theme.typography.weight.bold, fontStyle: "italic" }}>noun.</span> a
              movement; an ideal; an empowerment of people to simultaneously meet their personal health goals and
              contribute to planetary health
            </p>
          </div>
        </div>

      </section>

      {/* position: fixed, not a flex child relying on the section's
          remaining space -- the definition's own rendered height varies
          with viewport size/font metrics, and on a short-enough screen it
          can exceed the section's calculated height and push a
          flow-positioned indicator below the fold regardless of that
          calculation. Fixed to the viewport instead guarantees it's always
          visible on load. Pinned just above the fixed footer, not
          overlapping it. */}
      <div
        className="scroll-indicator"
        aria-hidden
        style={{
          position: "fixed",
          left: "50%",
          bottom: FOOTER_HEIGHT + theme.spacing.md,
          transform: "translateX(-50%)",
          fontSize: theme.typography.size.xl,
          color: theme.colors.static.accentPanelBg,
          zIndex: 40,
        }}
      >
        ⌄
      </div>

      <section
        style={{
          backgroundColor: theme.colors.static.accentPanelBg,
          // Breaks out of ContentPanel's own fixed 0.5in side margins AND
          // its own xxl side padding (see ContentPanel.tsx's home branch --
          // both apply, margin outside padding inside, and this section
          // sits inside both) so the background reaches the actual window
          // edge on both sides.
          marginLeft: `calc(-0.5in - ${theme.spacing.xxl}px)`,
          marginRight: `calc(-0.5in - ${theme.spacing.xxl}px)`,
          paddingTop: theme.spacing.xxl,
          paddingBottom: theme.spacing.xxl,
          paddingLeft: theme.spacing.xxl,
          paddingRight: theme.spacing.xxl,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          className="landing-cards"
          style={{
            width: "100%",
            maxWidth: 960,
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.lg,
          }}
        >
          {LANDING_LINKS.map((link, index) => {
            const image = link.graphicKey ? graphicAssets[link.graphicKey] : undefined;
            // Alternate the image side by position so the page feels dynamic
            // rather than reading a manual per-card flag.
            const imagePosition = index % 2 === 0 ? "right" : "left";
            return (
              <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
                <SoftPanel style={{ padding: theme.spacing.lg }}>
                  <div className={`landing-card-row landing-card-row--${imagePosition}`}>
                    {image && (
                      <div className="landing-card-image">
                        <FramedImage image={image} alt={link.imageAlt ?? ""} />
                      </div>
                    )}
                    <div className="landing-card-text">
                      <p
                        style={{
                          margin: 0,
                          color: theme.colors.static.ink,
                          fontWeight: theme.typography.weight.semibold,
                          fontSize: theme.typography.size.lg,
                        }}
                      >
                        {link.title}
                      </p>
                      <div
                        style={{
                          marginTop: theme.spacing.sm,
                          color: theme.colors.static.ink,
                          fontSize: theme.typography.size.sm,
                          lineHeight: 1.5,
                        }}
                      >
                        {link.description}
                      </div>
                    </div>
                  </div>
                </SoftPanel>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
