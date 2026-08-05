import type { Article } from "@exercise-tracker/content";
import { theme } from "@exercise-tracker/design-tokens";
import { Graphic } from "./Graphic";
import { RichText } from "./RichText";
import { ExternalLink } from "../ui/ExternalLink";

export function ArticleHeader({
  article,
  titleSize = "md",
  align = "left",
}: {
  article: Article;
  // Default matches every existing usage (home page popup, About page);
  // callers that want a more prominent title (e.g. a standalone article
  // page) opt in explicitly rather than changing the shared default.
  titleSize?: "md" | "xl";
  align?: "left" | "center";
}) {
  return (
    <>
      <h2
        style={{
          margin: 0,
          color: theme.colors.themed.navy,
          fontSize: theme.typography.size[titleSize],
          textAlign: align,
          lineHeight: 1.5,
        }}
      >
        {article.title}
      </h2>
      <p
        style={{
          marginTop: theme.spacing.xs,
          marginBottom: 0,
          color: theme.colors.themed.navy,
          fontSize: theme.typography.size.sm,
          textAlign: align,
          lineHeight: 1.5,
        }}
      >
        By: {article.authors.map((author) => author.name).join(", ")}
      </p>
      {article.lastUpdated && (
        <p
          style={{
            marginTop: theme.spacing.xs,
            marginBottom: 0,
            color: theme.colors.themed.navy,
            fontSize: theme.typography.size.sm,
            textAlign: align,
            lineHeight: 1.5,
          }}
        >
          Last updated: {article.lastUpdated}
        </p>
      )}
    </>
  );
}

export function ArticleBody({ article }: { article: Article }) {
  return (
    // line-height set once here (inherited by every paragraph/list/reference
    // below) rather than per element -- footnote markers render as <sup>,
    // which otherwise inflates just its own line's height inconsistently
    // against the rest of the article.
    <div style={{ lineHeight: 1.5 }}>
      {article.body.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p
                key={index}
                style={{
                  marginTop: theme.spacing.xl,
                  color: theme.colors.themed.navy,
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
                  color: theme.colors.themed.navy,
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
          case "list":
            return (
              <ul
                key={index}
                style={{
                  marginTop: theme.spacing.xl,
                  marginBottom: 0,
                  paddingLeft: theme.spacing.lg,
                  color: theme.colors.themed.navy,
                  fontSize: theme.typography.size.sm,
                }}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <RichText nodes={item} />
                  </li>
                ))}
              </ul>
            );
          case "callout":
            return (
              <div
                key={index}
                style={{
                  marginTop: theme.spacing.xl,
                  backgroundColor: theme.colors.static.accentPanelBg,
                  color: theme.colors.static.ink,
                  borderRadius: theme.radii.lg,
                  padding: theme.spacing.lg,
                }}
              >
                {block.heading && (
                  <p
                    style={{
                      margin: 0,
                      marginBottom: theme.spacing.sm,
                      fontWeight: theme.typography.weight.bold,
                      fontSize: theme.typography.size.sm,
                    }}
                  >
                    {block.heading}
                  </p>
                )}
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: theme.spacing.lg,
                    fontSize: theme.typography.size.sm,
                  }}
                >
                  {block.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <RichText nodes={item} linkColor={theme.colors.static.ink} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          case "table":
            return (
              <div key={index} style={{ marginTop: theme.spacing.xl }}>
                {block.heading && (
                  <p
                    style={{
                      margin: 0,
                      marginBottom: theme.spacing.sm,
                      fontWeight: theme.typography.weight.bold,
                      fontSize: theme.typography.size.sm,
                      color: theme.colors.themed.navy,
                    }}
                  >
                    {block.heading}
                  </p>
                )}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: `1px solid ${theme.colors.static.accentPanelBg}`,
                    fontSize: theme.typography.size.sm,
                    color: theme.colors.themed.navy,
                  }}
                >
                  <thead>
                    <tr>
                      {block.headers.map((header, headerIndex) => (
                        <th
                          key={headerIndex}
                          style={{
                            padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
                            textAlign: "left",
                            borderBottom: `1px solid ${theme.colors.static.accentPanelBg}`,
                            fontWeight: theme.typography.weight.bold,
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            style={{
                              padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
                              textAlign: "left",
                              borderBottom: `1px solid ${theme.colors.static.accentPanelBg}`,
                              verticalAlign: "top",
                            }}
                          >
                            <RichText nodes={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default: {
            const exhaustive: never = block;
            return exhaustive;
          }
        }
      })}
      {article.references && article.references.length > 0 && (
        <div style={{ marginTop: theme.spacing.xl }}>
          <p style={{ margin: 0, color: theme.colors.themed.navy, fontSize: theme.typography.size.lg }}>References</p>
          <ul
            style={{
              listStyle: "none",
              marginTop: theme.spacing.sm,
              marginBottom: 0,
              padding: 0,
              color: theme.colors.themed.navy,
              fontSize: theme.typography.size.sm,
            }}
          >
            {article.references.map((reference) => (
              <li key={reference.id} id={`ref-${reference.id}`} style={{ marginTop: theme.spacing.xs }}>
                {reference.id}.{" "}
                <ExternalLink href={reference.url} style={{ color: theme.colors.themed.link }}>
                  {reference.url}
                </ExternalLink>
              </li>
            ))}
          </ul>
        </div>
      )}
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
