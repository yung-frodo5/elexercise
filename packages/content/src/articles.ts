import type { Article } from "./types";
import { powerGenerationWorthItArticle } from "./powerGenerationWorthIt";

// Registry of published Articles-tab entries. Distinct from `landingArticle`,
// which backs the home page/About and isn't part of the Articles listing.
// Adding a new article: author it in its own `src/<name>.ts` file, then add
// it here.
export const articles: Article[] = [powerGenerationWorthItArticle];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}
