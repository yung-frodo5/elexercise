import type { RichTextNode } from "@exercise-tracker/content";
import { theme } from "@exercise-tracker/design-tokens";
import { ExternalLink } from "../ui/ExternalLink";

export function RichText({ nodes }: { nodes: RichTextNode[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        const style = {
          fontWeight: node.bold ? theme.typography.weight.bold : undefined,
          fontStyle: node.italic ? ("italic" as const) : undefined,
          color: node.href ? theme.colors.secondaryGreen : undefined,
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
                    color: theme.colors.secondaryGreen,
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
