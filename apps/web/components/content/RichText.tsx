import type { RichTextNode } from "@exercise-tracker/content";
import { theme } from "@exercise-tracker/design-tokens";
import { ExternalLink } from "../ui/ExternalLink";

export function RichText({
  nodes,
  // Links/footnotes default to the themed link color, which flips with dark
  // mode -- correct for every call site that renders on the ambient/flipping
  // content-panel background. The one exception is ArticleView's callout
  // block, whose backgroundColor is the static accent panel color in both
  // themes: passing theme.colors.static.ink there keeps the link readable
  // instead of flipping to a color tuned for a dark background that this
  // particular surface never has.
  linkColor = theme.colors.themed.link,
}: {
  nodes: RichTextNode[];
  linkColor?: string;
}) {
  return (
    <>
      {nodes.map((node, index) => {
        const style = {
          fontWeight: node.bold ? theme.typography.weight.bold : undefined,
          fontStyle: node.italic ? ("italic" as const) : undefined,
          color: node.href ? linkColor : undefined,
          textDecoration: node.href || node.underline ? "underline" : undefined,
        };
        return (
          <span key={index}>
            {node.href ? (
              <ExternalLink href={node.href} style={style}>
                {node.text}
              </ExternalLink>
            ) : (
              <span style={style}>{node.text}</span>
            )}
            {node.footnote !== undefined && (
              <sup>
                <a
                  href={`#ref-${node.footnote}`}
                  style={{
                    color: linkColor,
                    fontSize: theme.typography.size.xxs,
                    textDecoration: "none",
                  }}
                >
                  [{node.footnote}]
                </a>
              </sup>
            )}
            {node.break && <br />}
          </span>
        );
      })}
    </>
  );
}
