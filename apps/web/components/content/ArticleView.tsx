import type { Article, Table } from "@exercise-tracker/content";
import { theme } from "@exercise-tracker/design-tokens";
import { Graphic } from "./Graphic";
import { RichText } from "./RichText";
import { ExternalLink } from "../ui/ExternalLink";
import { HEADER_HEIGHT } from "../../lib/layoutConstants";

// "Technical"-style articles (see Article.style) render in a serif face
// instead of the site's default, for a more academic/research-paper look.
const TECHNICAL_FONT_FAMILY = "'Times New Roman', Times, serif";

export function ArticleTable({ table, textColor = theme.colors.themed.navy }: { table: Table; textColor?: string }) {
  return (
    <div>
      {table.heading && (
        <p
          style={{
            margin: 0,
            marginBottom: theme.spacing.sm,
            fontWeight: theme.typography.weight.bold,
            fontSize: theme.typography.size.sm,
            color: textColor,
          }}
        >
          {table.heading}
        </p>
      )}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: `1px solid ${theme.colors.static.accentPanelBg}`,
          fontSize: theme.typography.size.sm,
          color: textColor,
        }}
      >
        <thead>
          <tr>
            {table.headers.map((header, headerIndex) => (
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
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => {
                // Short cell values (e.g. "~112.79 MWh") shouldn't wrap --
                // auto table layout otherwise starves that column of width
                // in favor of longer prose columns like Item/Source, forcing
                // an ugly mid-value line break.
                const cellText = cell.map((node) => node.text).join("");
                return (
                  <td
                    key={cellIndex}
                    style={{
                      padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
                      textAlign: "left",
                      borderBottom: `1px solid ${theme.colors.static.accentPanelBg}`,
                      verticalAlign: "top",
                      whiteSpace: cellText.length <= 20 ? "nowrap" : undefined,
                    }}
                  >
                    <RichText nodes={cell} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
  const technical = article.style === "technical";
  const textColor = technical ? theme.colors.themed.technicalText : theme.colors.themed.navy;
  return (
    <>
      <h2
        style={{
          margin: 0,
          color: textColor,
          // Set directly on every element here rather than once on a shared
          // ancestor -- ArticleHeader's root is a Fragment, and its caller
          // (the article page) renders it as ArticleBody's sibling, not its
          // parent, so there's no common wrapper to inherit from. On top of
          // that, h2 specifically needs its own explicit value regardless:
          // the global `h1, h2, h3 { font-family: 'Clash Display' }` rule
          // (apps/web/app/layout.tsx) isn't !important, so a same-element
          // override wins, but an ancestor's fontFamily wouldn't (h2 has its
          // own, non-inherited rule for that property).
          fontFamily: technical ? TECHNICAL_FONT_FAMILY : undefined,
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
          color: textColor,
          fontFamily: technical ? TECHNICAL_FONT_FAMILY : undefined,
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
            color: textColor,
            fontFamily: technical ? TECHNICAL_FONT_FAMILY : undefined,
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
  const technical = article.style === "technical";
  const textColor = technical ? theme.colors.themed.technicalText : theme.colors.themed.navy;
  return (
    // line-height and (for technical articles) fontFamily set once here --
    // inherited by every paragraph/subtitle/subheading/list/table/graphic-
    // caption/reference below, none of which set their own font-family --
    // rather than repeated per element. line-height specifically: footnote
    // markers render as <sup>, which otherwise inflates just its own line's
    // height inconsistently against the rest of the article.
    <div style={{ lineHeight: 1.5, fontFamily: technical ? TECHNICAL_FONT_FAMILY : undefined }}>
      {article.body.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p
                key={index}
                style={{
                  marginTop: theme.spacing.xl,
                  color: textColor,
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
                  color: textColor,
                  fontSize: theme.typography.size.lg,
                }}
              >
                <RichText nodes={block.content} />
              </p>
            );
          case "subheading":
            return (
              <p
                key={index}
                style={{
                  marginTop: theme.spacing.xl,
                  color: textColor,
                  fontSize: theme.typography.size.md,
                  fontWeight: theme.typography.weight.semibold,
                }}
              >
                <RichText nodes={block.content} />
              </p>
            );
          case "graphic":
            return (
              <div key={index} style={{ marginTop: theme.spacing.xl }}>
                <Graphic graphic={block} textColor={textColor} />
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
                  color: textColor,
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
                      textAlign: "center",
                      textDecoration: "underline",
                    }}
                  >
                    {block.heading}
                  </p>
                )}
                {block.style === "prose" ? (
                  block.items.map((item, itemIndex) => (
                    <p
                      key={itemIndex}
                      style={{
                        margin: 0,
                        marginTop: itemIndex > 0 ? theme.spacing.sm : 0,
                        fontSize: theme.typography.size.sm,
                      }}
                    >
                      <RichText nodes={item} linkColor={theme.colors.static.ink} />
                    </p>
                  ))
                ) : (
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
                )}
              </div>
            );
          case "table":
            return (
              <div key={index} style={{ marginTop: theme.spacing.xl }}>
                <ArticleTable table={block} textColor={textColor} />
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
          <p style={{ margin: 0, color: textColor, fontSize: theme.typography.size.lg }}>References</p>
          <ul
            style={{
              listStyle: "none",
              marginTop: theme.spacing.sm,
              marginBottom: 0,
              padding: 0,
              color: textColor,
              fontSize: theme.typography.size.sm,
            }}
          >
            {article.references.map((reference) => (
              <li
                key={reference.id}
                id={`ref-${reference.id}`}
                // A native `#ref-N` anchor jump aligns this element's top
                // edge with the viewport's top edge -- exactly where the
                // fixed SiteHeader sits, hiding the target underneath it.
                // scroll-margin-top leaves room above it, the same fix as
                // the landing page's chevron scroll (see HEADER_HEIGHT
                // usage in app/page.tsx), but expressed in CSS since this
                // is a plain anchor link, not a JS scroll handler.
                style={{ marginTop: theme.spacing.xs, scrollMarginTop: HEADER_HEIGHT }}
              >
                {reference.id}. {reference.citation && `${reference.citation} `}
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
    <article
      style={{ fontFamily: article.style === "technical" ? TECHNICAL_FONT_FAMILY : undefined }}
    >
      <ArticleHeader article={article} />
      <ArticleBody article={article} />
    </article>
  );
}
