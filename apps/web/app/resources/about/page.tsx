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
    <main style={{ padding: theme.spacing.xl, maxWidth: 720, margin: "0 auto" }}>
      <ArticleHeader article={landingArticle} />
      <ArticleBody article={{ ...landingArticle, body: rest }} />
      <div style={{ marginTop: theme.spacing.xl }}>
        <FramedImage image={articleDiagram} alt="TODO: describe this diagram" maxWidth={480} />
      </div>
    </main>
  );
}
