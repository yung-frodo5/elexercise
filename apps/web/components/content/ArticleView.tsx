import type { Article } from "@exercise-tracker/content";
import { theme } from "@exercise-tracker/design-tokens";
import { Graphic } from "./Graphic";
import { RichText } from "./RichText";

export function ArticleHeader({ article }: { article: Article }) {
  return (
    <>
      <h2 style={{ margin: 0, color: theme.colors.navyStatic, fontSize: theme.typography.size.md }}>
        {article.title}
      </h2>
      <p
        style={{
          marginTop: theme.spacing.xs,
          marginBottom: 0,
          color: theme.colors.navyStatic,
          fontSize: theme.typography.size.sm,
        }}
      >
        By: {article.authors.map((author) => author.name).join(", ")}
      </p>
    </>
  );
}

export function ArticleBody({ article }: { article: Article }) {
  return (
    <div>
      {article.body.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p
                key={index}
                style={{
                  marginTop: theme.spacing.xl,
                  color: theme.colors.navyStatic,
                  fontSize: theme.typography.size.sm,
                }}
              >
                <RichText nodes={block.content} />
              </p>
            );
          case "subtitle":
            return (
              <p
                key={index}
                style={{
                  marginTop: theme.spacing.xl,
                  color: theme.colors.navyStatic,
                  fontSize: theme.typography.size.lg,
                }}
              >
                <RichText nodes={block.content} />
              </p>
            );
          case "graphic":
            return (
              <div key={index} style={{ marginTop: theme.spacing.xl }}>
                <Graphic graphic={block} />
              </div>
            );
          default: {
            const exhaustive: never = block;
            return exhaustive;
          }
        }
      })}
    </div>
  );
}

export function ArticleView({ article }: { article: Article }) {
  return (
    <article>
      <ArticleHeader article={article} />
      <ArticleBody article={article} />
    </article>
  );
}
