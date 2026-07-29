"use client";

import { theme } from "@exercise-tracker/design-tokens";
import { landingArticle } from "@exercise-tracker/content";
import { ArticleBody, ArticleHeader } from "../components/content/ArticleView";
import { Graphic } from "../components/content/Graphic";
import { FramedImage } from "../components/content/FramedImage";
import { HEADER_HEIGHT } from "../lib/layoutConstants";
// Web-only image — not part of the shared `packages/content` article data,
// since it isn't confirmed for mobile yet.
import articleDiagram from "../assets/images/what-is-elexercise.svg";

export default function LandingPage() {
  const [hero, ...rest] = landingArticle.body;

  return (
    <>
      <section
        style={{
          backgroundColor: theme.colors.background,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
          paddingLeft: theme.spacing.xxl,
          paddingRight: theme.spacing.xxl,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {hero.type === "graphic" && <Graphic graphic={hero} />}
      </section>

      <section style={{ backgroundColor: "#ffffff", padding: theme.spacing.xxl }}>
        <ArticleHeader article={landingArticle} />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: theme.spacing.xxl,
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: "2 1 320px", minWidth: 240 }}>
            <ArticleBody article={{ ...landingArticle, body: rest }} />
          </div>
          <div
            style={{
              flex: "1 1 320px",
              minWidth: 280,
              position: "sticky",
              top: HEADER_HEIGHT + theme.spacing.xxl,
            }}
          >
            <FramedImage image={articleDiagram} alt="TODO: describe this diagram" maxWidth={720} />
          </div>
        </div>
      </section>
    </>
  );
}
