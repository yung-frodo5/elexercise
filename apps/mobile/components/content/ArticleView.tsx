import { StyleSheet, Text, View } from "react-native";
import type { Article } from "@exercise-tracker/content";
import { theme } from "@exercise-tracker/design-tokens";
import { Graphic } from "./Graphic";
import { RichText } from "./RichText";

export function ArticleView({ article }: { article: Article }) {
  return (
    <View>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.byline}>By: {article.authors.map((author) => author.name).join(", ")}</Text>

      {article.body.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return (
              <Text key={index} style={styles.paragraph}>
                <RichText nodes={block.content} />
              </Text>
            );
          case "subtitle":
            return (
              <Text key={index} style={styles.subtitle}>
                <RichText nodes={block.content} />
              </Text>
            );
          case "graphic":
            return (
              <View key={index} style={styles.graphicWrapper}>
                <Graphic graphic={block} />
              </View>
            );
          default: {
            const exhaustive: never = block;
            return exhaustive;
          }
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  byline: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.size.sm,
    color: theme.colors.textMuted,
  },
  paragraph: {
    marginTop: theme.spacing.xl,
    color: theme.colors.textMuted,
  },
  subtitle: {
    marginTop: theme.spacing.xl,
    color: theme.colors.textMuted,
    fontSize: theme.typography.size.lg,
  },
  graphicWrapper: {
    marginTop: theme.spacing.xl,
  },
});
