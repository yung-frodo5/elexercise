import type { Article } from "./types";
import { landingArticle } from "./landing";
import { powerGenerationWorthItArticle } from "./powerGenerationWorthIt";
import { howMuchPowerArticle } from "./howMuchPower";
import { thePsychologicalBridgeArticle } from "./thePsychologicalBridge";
import { lifeCycleAnalysisArticle } from "./lifeCycleAnalysis";

// Registry of published Articles-tab entries, in listing order. `landingArticle`
// also backs the home page's hover popup, which renders its own excerpt of
// the same data directly (not through this registry) -- being in both
// places is expected, not a duplication to clean up.
// Adding a new article: author it in its own `src/<name>.ts` file, then add
// it here.
export const articles: Article[] = [
  landingArticle,
  powerGenerationWorthItArticle,
  howMuchPowerArticle,
  thePsychologicalBridgeArticle,
  lifeCycleAnalysisArticle,
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}
