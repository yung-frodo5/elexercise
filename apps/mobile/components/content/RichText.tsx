import { Linking, Text } from "react-native";
import type { RichTextNode } from "@exercise-tracker/content";
import { theme } from "@exercise-tracker/design-tokens";

export function RichText({ nodes }: { nodes: RichTextNode[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        const { href } = node;
        return (
          <Text
            key={index}
            style={[
              node.bold && { fontWeight: theme.typography.weight.bold },
              node.italic && { fontStyle: "italic" as const },
              (href || node.underline) && { textDecorationLine: "underline" as const },
              href && { color: theme.colors.secondaryGreen },
            ]}
            onPress={href ? () => void Linking.openURL(href) : undefined}
          >
            {node.text}
          </Text>
        );
      })}
    </>
  );
}
