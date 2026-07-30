"use client";

import { theme } from "@exercise-tracker/design-tokens";
import { landingArticle } from "@exercise-tracker/content";
import { ArticleBody, ArticleHeader } from "../components/content/ArticleView";
import { FramedImage } from "../components/content/FramedImage";
// Web-only image — not part of the shared `packages/content` article data,
// since it isn't confirmed for mobile yet.
import articleDiagram from "../assets/images/what-is-elexercise.svg";

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
      `}</style>

      <section
        style={{
          paddingTop: theme.spacing.xxl,
          paddingBottom: theme.spacing.xxl,
          paddingLeft: theme.spacing.xxl,
          paddingRight: theme.spacing.xxl,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className="definition-wrap" tabIndex={0}>
          <div
            style={{
              backgroundColor: theme.colors.surface,
              color: theme.colors.textPrimary,
              padding: theme.spacing.xl,
              borderRadius: theme.radii.lg,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 48,
            }}
          >
            <p style={{ margin: 0, whiteSpace: "nowrap", fontSize: 60 }}>
              <span style={{ fontWeight: theme.typography.weight.bold }}>elexercise</span>{" "}
              \əˈlɛk &middot; sə &middot; saɪz\
            </p>
            <p style={{ margin: 0, marginTop: theme.spacing.xxl, paddingLeft: theme.spacing.xxl * 2 }}>
              <span style={{ fontWeight: theme.typography.weight.bold, fontStyle: "italic" }}>verb.</span> to produce
              electricity through exercise
            </p>
            <p style={{ margin: 0, marginTop: theme.spacing.xxl, paddingLeft: theme.spacing.xxl * 2 }}>
              <span style={{ fontWeight: theme.typography.weight.bold, fontStyle: "italic" }}>noun.</span> the act of
              producing electricity through exercise
            </p>
          </div>

          <div
            className="definition-popup"
            style={{
              width: "min(90vw, 840px)",
              maxHeight: "70vh",
              overflowY: "auto",
              marginTop: theme.spacing.sm,
              backgroundColor: theme.colors.border,
              borderRadius: theme.radii.lg,
              padding: theme.spacing.xxl,
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)",
            }}
          >
            <ArticleHeader article={landingArticle} />
            <ArticleBody article={{ ...landingArticle, body: rest }} />
            <div style={{ marginTop: theme.spacing.xl }}>
              <FramedImage image={articleDiagram} alt="TODO: describe this diagram" maxWidth={480} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
