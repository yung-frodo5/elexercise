"use client";

import { theme } from "@exercise-tracker/design-tokens";
import { landingArticle } from "@exercise-tracker/content";
import { ArticleBody, ArticleHeader } from "../components/content/ArticleView";
import { FramedImage } from "../components/content/FramedImage";
import { HERO_HEIGHT } from "../components/content/Graphic";
import { graphicAssets } from "../lib/content/graphicAssets";
// Web-only images — not part of the shared `packages/content` article data,
// since they aren't confirmed for mobile yet.
import heroSecondary from "../assets/images/landing-hero-2.svg";
import articleDiagram from "../assets/images/what-is-elexercise.svg";

export default function LandingPage() {
  const [hero, ...rest] = landingArticle.body;

  return (
    <>
      <section
        style={{
          backgroundColor: theme.colors.background,
          height: HERO_HEIGHT,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
          boxSizing: "content-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: theme.spacing.xxl,
        }}
      >
        {hero.type === "graphic" && (
          <FramedImage src={graphicAssets[hero.key].src} alt={hero.alt} />
        )}
        <FramedImage src={heroSecondary.src} alt="TODO: describe the second hero image" />
      </section>

      <section style={{ backgroundColor: "#ffffff", padding: theme.spacing.xxl }}>
        <ArticleHeader article={landingArticle} />

        <div style={{ display: "flex", gap: theme.spacing.xxl, alignItems: "flex-start", marginTop: theme.spacing.xl }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ArticleBody article={{ ...landingArticle, body: rest }} />
          </div>
          <div style={{ flexShrink: 0, width: 720 }}>
            <FramedImage src={articleDiagram.src} alt="TODO: describe this diagram" />
          </div>
        </div>
      </section>
    </>
  );
}
