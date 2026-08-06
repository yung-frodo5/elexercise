"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { GraphicKey } from "@exercise-tracker/content";
import { theme } from "@exercise-tracker/design-tokens";
import { SoftPanel } from "../components/ui/SoftPanel";
import { FramedImage } from "../components/content/FramedImage";
import { graphicAssets } from "../lib/content/graphicAssets";
import { HEADER_HEIGHT } from "../lib/layoutConstants";
import { FOOTER_HEIGHT } from "../components/nav/SiteFooter";

// ContentPanel publishes its own responsive geometry as custom properties on
// .content-panel-home (see the comment there): the combined horizontal
// margin+padding per side, and the combined top margin+padding. Read those
// rather than restating "0.5in + xxl", which went stale the moment
// ContentPanel's own media query collapsed the panel to a 12px inset. The
// fallbacks are ContentPanel's desktop home values and only apply if this
// page ever renders outside ContentPanel.
const CONTENT_INSET = `var(--elex-content-inset, calc(0.5in + ${theme.spacing.xxl}px))`;
const CONTENT_TOP_OFFSET = `var(--elex-content-top-offset, calc(0.5in + ${theme.spacing.xxl}px))`;

// Fluid scales for the definition below. Two independent axes, because a
// viewport can be cramped in either one and a width-only breakpoint sees
// only one:
//   cqi -> 1% of the definition section's own inline size (it's a
//          container-query container, see the .definition-section rule
//          below), so type and indents track the width actually available
//          inside ContentPanel's margins/padding, not the raw viewport width
//          -- same reasoning as .landing-cards's own container query below.
//   svh -> 1% of the small/stable viewport height, so vertical rhythm and
//          the type ceilings also compress on SHORT viewports -- a
//          landscape phone or a short desktop window, neither of which any
//          width query can see.
// min(cqi-term, svh-term) takes whichever axis is scarcer. Every clamp below
// is fitted so a >=1278x890 window lands on today's exact values (headword
// 60, body 48, gaps 32, indent 64, padding 24) -- on a normal desktop this
// whole block is a no-op.
const HEADWORD_FONT_SIZE = "clamp(26px, min(calc(20px + 3.8cqi), 9svh), 60px)";
const DEFINITION_FONT_SIZE = "clamp(18px, min(calc(18px + 2.8cqi), 6svh), 48px)";
const DEFINITION_PANEL_PADDING = `clamp(${theme.spacing.sm}px, 3svh, ${theme.spacing.xl}px) clamp(${theme.spacing.lg}px, 2.5cqi, ${theme.spacing.xl}px)`;
const DEFINITION_LINE_GAP = `clamp(10px, 4svh, ${theme.spacing.xxl}px)`;
const DEFINITION_LINE_INDENT = `clamp(${theme.spacing.lg}px, 6cqi, ${theme.spacing.xxl * 2}px)`;
const SECTION_PADDING_TOP = `clamp(${theme.spacing.sm}px, 3svh, ${theme.spacing.xl}px)`;
// vw, not cqi: this padding is on the container element itself, and cqi
// resolves against that element's content box -- which its own padding
// defines. Circular. Everything INSIDE the container uses cqi instead.
const SECTION_PADDING_X = `clamp(${theme.spacing.md}px, 4vw, ${theme.spacing.xxl}px)`;

// The fixed header/footer (reserved via padding in layout.tsx) and
// ContentPanel's own top offset all eat into the viewport before this
// section's own box even starts -- a plain "80vh" doesn't know about any of
// that, so on a typical screen the scroll indicator at this section's
// bottom ends up below the fold. This computes the actual height available
// in the first-load viewport instead.
// svh, not vh: on a mobile browser, vh resolves to the LARGE viewport (URL
// bar hidden), which is taller than what's actually on screen at load, so
// it over-reserved and pushed the fold down. svh is the load-time viewport
// and is stable (doesn't reflow as the URL bar hides while scrolling),
// which is what "the definition exactly fills the first-load viewport"
// (see below) actually wants.
const DEFINITION_SECTION_HEIGHT = `calc(100svh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px - ${CONTENT_TOP_OFFSET})`;

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

const ARTICLES_SECTION_ID = "landing-articles";
// A full viewport per click overshot past the next card instead of just
// revealing it -- 0.7 keeps some of the previous card on screen as context.
const PAGE_DOWN_SCROLL_FRACTION = 0.7;
// Small buffer, not an exact >= check -- fractional-pixel scroll math
// (subpixel zoom, some mobile browsers) can leave scrollY a hair short of
// the true max, which would otherwise never satisfy an exact equality.
const BOTTOM_SCROLL_BUFFER_PX = 4;

export default function LandingPage() {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    function checkIsAtBottom() {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - BOTTOM_SCROLL_BUFFER_PX;
      setIsAtBottom(scrolledToBottom);
    }

    checkIsAtBottom();
    window.addEventListener("scroll", checkIsAtBottom, { passive: true });
    return () => window.removeEventListener("scroll", checkIsAtBottom);
  }, []);

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
        /* Makes this section a container-query container so the definition's
           type and indents can be sized in cqi -- 1% of the width actually
           available inside ContentPanel's margins/padding, which a viewport
           media query can't see (same reasoning as .landing-cards below).
           Safe on this element specifically: its inline size comes from its
           block parent, not from its own contents. Do NOT move this to
           .definition-wrap -- that's a fit-content flex item, and inline-size
           containment would make it resolve its width against empty
           contents and collapse to zero.
           Everything that used to live in a max-width: 600px block here (a
           single abrupt jump that missed tablets/small laptops between
           600px and ~1200px, and any short-but-wide landscape viewport
           regardless of width) is now a fluid clamp() in the inline styles
           below -- which is why none of it needs !important anymore. */
        .definition-section { container-type: inline-size; }
        /* Decorative and aria-hidden. On a viewport this short the
           definition already visibly runs past the fold, so the affordance
           is redundant, and a fixed element pinned near the bottom would
           sit on top of the text. */
        @media (max-height: 480px) {
          .scroll-indicator { display: none; }
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
        className="definition-section"
        style={{
          minHeight: DEFINITION_SECTION_HEIGHT,
          paddingTop: SECTION_PADDING_TOP,
          paddingLeft: SECTION_PADDING_X,
          paddingRight: SECTION_PADDING_X,
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
              padding: DEFINITION_PANEL_PADDING,
              borderRadius: theme.radii.lg,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: DEFINITION_FONT_SIZE,
            }}
          >
            {/* No white-space: nowrap. It only differs from the default in
                the case where the line doesn't fit, and there it turns
                "wrap gracefully" into "scroll the whole page sideways" --
                which it did on every viewport from ~1200px down, not just
                the phones the old max-width: 600px rule covered. Left to
                wrap naturally, it stays on one line whenever there's room,
                which is all the nowrap was ever for. */}
            <p className="definition-headword" style={{ margin: 0, fontSize: HEADWORD_FONT_SIZE }}>
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
                  // em, so the speaker tracks the headword instead of
                  // staying fixed at 32px next to a shrunk word on a small
                  // screen. 0.55em of the 60px desktop cap is 33px, i.e.
                  // today's value.
                  fontSize: "0.55em",
                  verticalAlign: "middle",
                  padding: 0,
                }}
              >
                🔊
              </button>
            </p>
            <p
              className="definition-body-line"
              style={{ margin: 0, marginTop: DEFINITION_LINE_GAP, paddingLeft: DEFINITION_LINE_INDENT }}
            >
              <span style={{ fontWeight: theme.typography.weight.bold, fontStyle: "italic" }}>verb.</span> to produce
              electricity through exercise
            </p>
            <p
              className="definition-body-line"
              style={{ margin: 0, marginTop: DEFINITION_LINE_GAP, paddingLeft: DEFINITION_LINE_INDENT }}
            >
              <span style={{ fontWeight: theme.typography.weight.bold, fontStyle: "italic" }}>noun.</span> a
              movement; an ideal; the empowerment of people to meet personal health goals while contributing to
              planetary health
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
          overlapping it. Hidden once the page is scrolled to the bottom,
          where "scroll down" no longer makes sense. */}
      {!isAtBottom && (
        <button
          type="button"
          className="scroll-indicator"
          aria-label="Scroll to articles"
          onClick={() => {
            const articlesSection = document.getElementById(ARTICLES_SECTION_ID);
            // First click (still above the articles section): jump straight
            // to it. Once already there, jumping again would be a no-op --
            // page down by a viewport instead, so repeated clicks keep
            // advancing through the article cards below.
            if (articlesSection && window.scrollY < articlesSection.offsetTop) {
              articlesSection.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
              window.scrollBy({ top: window.innerHeight * PAGE_DOWN_SCROLL_FRACTION, behavior: "smooth" });
            }
          }}
          style={{
            position: "fixed",
            left: "50%",
            bottom: FOOTER_HEIGHT + theme.spacing.md,
            transform: "translateX(-50%)",
            fontSize: theme.typography.size.xl,
            color: theme.colors.themed.controlOnChrome,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            zIndex: 40,
          }}
        >
          ⌄
        </button>
      )}

      <section
        id={ARTICLES_SECTION_ID}
        style={{
          backgroundColor: theme.colors.static.accentPanelBg,
          // Breaks out of ContentPanel's side margin AND its side padding
          // (both apply -- margin outside, padding inside, and this section
          // sits inside both) so the background reaches the actual window
          // edge. Read from ContentPanel's own published variable rather
          // than restated as a literal: it collapses from 80px to 12px per
          // side at ContentPanel's own breakpoints, and a hardcoded -80px
          // overshot the window edge by 68px per side on every phone.
          marginLeft: `calc(-1 * ${CONTENT_INSET})`,
          marginRight: `calc(-1 * ${CONTENT_INSET})`,
          paddingTop: `clamp(${theme.spacing.lg}px, 3svh, ${theme.spacing.xxl}px)`,
          paddingBottom: `clamp(${theme.spacing.lg}px, 3svh, ${theme.spacing.xxl}px)`,
          paddingLeft: SECTION_PADDING_X,
          paddingRight: SECTION_PADDING_X,
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
