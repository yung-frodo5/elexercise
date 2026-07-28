import type { RichTextNode } from "@exercise-tracker/content";
import { theme } from "@exercise-tracker/design-tokens";

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
        return node.href ? (
          <a key={index} href={node.href} style={style}>
            {node.text}
          </a>
        ) : (
          <span key={index} style={style}>
            {node.text}
          </span>
        );
      })}
    </>
  );
}
