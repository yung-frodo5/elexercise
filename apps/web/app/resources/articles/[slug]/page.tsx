import { notFound } from "next/navigation";
import { theme } from "@exercise-tracker/design-tokens";
import { articles, getArticleBySlug } from "@exercise-tracker/content";
import { ArticleBody, ArticleHeader } from "../../../../components/content/ArticleView";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  if (!article) {
    notFound();
  }

  return (
    <main style={{ padding: theme.spacing.xl, paddingTop: theme.spacing.xs, maxWidth: 720, margin: "0 auto" }}>
      <ArticleHeader article={article} titleSize="xl" align="center" />
      <ArticleBody article={article} />
    </main>
  );
}
