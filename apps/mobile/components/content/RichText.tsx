import { Fragment } from "react";
import { Linking, Text } from "react-native";
import type { RichTextNode } from "@exercise-tracker/content";
import { theme } from "@exercise-tracker/design-tokens";

// Footnote markers render as plain, non-interactive superscript-style text on
// mobile — there's no Articles screen here yet to scroll to a References
// list, so unlike web's marker this isn't a link. Handled here anyway (not
// left as a silent gap) so the shared RichTextNode.footnote flag renders
// consistently on both platforms, per this repo's content-model convention.
export function RichText({ nodes }: { nodes: RichTextNode[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        const { href } = node;
        return (
          <Fragment key={index}>
            <Text
              style={[
                node.bold && { fontWeight: theme.typography.weight.bold },
                node.italic && { fontStyle: "italic" as const },
                (href || node.underline) && { textDecorationLine: "underline" as const },
                href && { color: theme.colors.secondaryGreen },
              ]}
              onPress={href ? () => void Linking.openURL(href) : undefined}
            >
              {node.text}
              {node.footnote !== undefined && (
                <Text style={{ fontSize: theme.typography.size.xxs }}>{` [${node.footnote}]`}</Text>
              )}
            </Text>
            {node.break && "\n"}
          </Fragment>
        );
      })}
    </>
  );
}
