import { theme } from "@exercise-tracker/design-tokens";
import { landingArticle } from "@exercise-tracker/content";
import { ArticleBody, ArticleHeader } from "../../../components/content/ArticleView";
import { FramedImage } from "../../../components/content/FramedImage";
// Web-only image — not part of the shared `packages/content` article data,
// since it isn't confirmed for mobile yet.
import articleDiagram from "../../../assets/images/what-is-elexercise.svg";

// Same content as the home page's hover popup over the "elexercise"
// definition -- this page just shows it statically instead of on hover, for
// anyone who wants to read it without needing to find/hover the definition.
export default function AboutPage() {
  const [, ...rest] = landingArticle.body;

  return (
    <main style={{ paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.xl }}>
      {/* ArticleHeader/ArticleBody default to navy text -- override to
          black here per design feedback. !important is needed since they
          set that color inline on their own elements. */}
      <style>{`
        .about-panel h2,
        .about-panel p {
          color: #000000 !important;
        }
      `}</style>
      <div
        className="about-panel"
        style={{
          backgroundColor: "#D6E9FF",
          // Breaks the panel's right edge out to the actual window edge,
          // past every ancestor's own max-width/centering (ContentPanel,
          // this page's own layout) -- 50% here is relative to this div's
          // own (already-centered) container, so it cancels out exactly
          // regardless of how deep that container is nested, as long as
          // nothing in the chain is asymmetric.
          marginRight: "calc(-50vw + 50%)",
          paddingTop: theme.spacing.xl,
          paddingLeft: theme.spacing.xxl * 2,
          paddingBottom: theme.spacing.xl,
        }}
      >
        <div style={{ maxWidth: 720 }}>
          <ArticleHeader article={landingArticle} />
          <ArticleBody article={{ ...landingArticle, body: rest }} />
          <div style={{ marginTop: theme.spacing.xl }}>
            <FramedImage image={articleDiagram} alt="TODO: describe this diagram" maxWidth={480} />
          </div>
        </div>
      </div>
    </main>
  );
}
