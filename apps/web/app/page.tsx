"use client";

import { theme } from "@exercise-tracker/design-tokens";
import { landingArticle } from "@exercise-tracker/content";
import { ArticleBody, ArticleHeader } from "../components/content/ArticleView";
import { FramedImage } from "../components/content/FramedImage";
import { graphicAssets } from "../lib/content/graphicAssets";
// Web-only image — not part of the shared `packages/content` article data,
// since it isn't confirmed for mobile yet.
import articleDiagram from "../assets/images/what-is-elexercise.svg";

// The hero graphic is a wide banner (not the ~16:9 shape HERO_HEIGHT was
// tuned for), so it gets its own shorter frame here instead of Graphic.tsx's.
const HERO_BANNER_HEIGHT = 140;

export default function LandingPage() {
  const [hero, ...rest] = landingArticle.body;

  return (
    <>
      <section
        style={{
          backgroundColor: theme.colors.background,
          height: HERO_BANNER_HEIGHT,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
          boxSizing: "content-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {hero.type === "graphic" && (
          <FramedImage src={graphicAssets[hero.key].src} alt={hero.alt} />
        )}
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
