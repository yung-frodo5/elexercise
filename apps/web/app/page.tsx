"use client";

import { theme } from "@exercise-tracker/design-tokens";
import { landingArticle } from "@exercise-tracker/content";
import { ArticleBody, ArticleHeader } from "../components/content/ArticleView";

export default function LandingPage() {
  // hero used to be an image (landing-hero.png) rendered via the shared
  // "graphic" block type; per design feedback it's now real text on the
  // page instead, with its own verb/noun entries that don't exist in that
  // block's alt copy, so it's hardcoded here rather than derived from it.
  const [, ...rest] = landingArticle.body;

  return (
    <>
      {/* The rest of the article (and its diagram) now lives in a popup
          anchored to the definition, shown on hover/focus rather than
          always on the page -- a real <style> rule is needed for the
          :hover/:focus-within pseudo-classes, which inline styles can't express. */}
      <style>{`
        .definition-wrap { position: relative; display: inline-block; }
        .definition-popup {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 150ms ease;
          z-index: 10;
        }
        .definition-wrap:hover .definition-popup,
        .definition-wrap:focus-within .definition-popup {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }
        /* ArticleHeader/ArticleBody default to navy text (correct on the
           white About page, their other use site) -- override here per
           design feedback: the title (h2, the only one in this subtree)
           green, everything else black. The byline ("By: ...") is hidden
           entirely -- ">" targets it specifically since it's a direct
           child of the popup, unlike ArticleBody's paragraphs which are
           nested one level deeper inside ArticleBody's own wrapper div. */
        .definition-popup h2 {
          color: #228B22 !important;
        }
        .definition-popup > p {
          display: none;
        }
        .definition-popup p {
          color: #000000 !important;
        }
        /* The headword's 60px nowrap text is wider than any phone viewport
           -- without this it forces the whole page to scroll horizontally.
           !important is needed to beat the matching inline styles. */
        @media (max-width: 600px) {
          .definition-wrap { display: block; width: 100%; box-sizing: border-box; }
          .definition-panel { font-size: 26px !important; padding: 16px !important; }
          .definition-headword { white-space: normal !important; font-size: 30px !important; }
          .definition-body-line { padding-left: 16px !important; }
        }
      `}</style>

      <section
        style={{
          paddingTop: theme.spacing.xxl,
          // Generous bottom padding so the page has real scroll room below
          // the trigger -- the popup can be tall (up to 80vh) and is
          // absolutely positioned, so without this there isn't guaranteed
          // room to scroll down far enough to read all the way to its end.
          paddingBottom: "80vh",
          paddingLeft: theme.spacing.xxl,
          paddingRight: theme.spacing.xxl,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className="definition-wrap" tabIndex={0}>
          <div
            className="definition-panel"
            style={{
              color: "#000000",
              padding: theme.spacing.xl,
              borderRadius: theme.radii.lg,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 48,
            }}
          >
            <p className="definition-headword" style={{ margin: 0, whiteSpace: "nowrap", fontSize: 60 }}>
              <span style={{ fontWeight: theme.typography.weight.bold }}>elexercise</span>{" "}
              \əˈlɛk &middot; sɚ &middot; saɪz\
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
              <span style={{ fontWeight: theme.typography.weight.bold, fontStyle: "italic" }}>noun.</span> the act of
              producing electricity through exercise
            </p>
          </div>

          <div
            className="definition-popup"
            style={{
              width: "min(90vw, 840px)",
              maxHeight: "80vh",
              overflowY: "auto",
              marginTop: theme.spacing.sm,
              backgroundColor: "#D6E9FF",
              color: "#000000",
              borderRadius: theme.radii.lg,
              padding: theme.spacing.xxl,
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)",
            }}
          >
            <ArticleHeader article={landingArticle} />
            <ArticleBody article={{ ...landingArticle, body: rest }} />
          </div>
        </div>
      </section>
    </>
  );
}
