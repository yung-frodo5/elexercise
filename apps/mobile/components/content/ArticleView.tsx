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
      {article.lastUpdated && <Text style={styles.lastUpdated}>Last updated: {article.lastUpdated}</Text>}

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
          case "subheading":
            return (
              <Text key={index} style={styles.subheading}>
                <RichText nodes={block.content} />
              </Text>
            );
          case "graphic":
            return (
              <View key={index} style={styles.graphicWrapper}>
                <Graphic graphic={block} />
              </View>
            );
          case "list":
            return (
              <View key={index} style={styles.listWrapper}>
                {block.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.listItemRow}>
                    <Text style={styles.listItemText}>{"• "}</Text>
                    <Text style={[styles.listItemText, styles.listItemTextBody]}>
                      <RichText nodes={item} />
                    </Text>
                  </View>
                ))}
              </View>
            );
          case "callout":
            return (
              <View key={index} style={styles.calloutWrapper}>
                {block.heading && <Text style={styles.calloutHeading}>{block.heading}</Text>}
                {block.style === "prose"
                  ? block.items.map((item, itemIndex) => (
                      <Text
                        key={itemIndex}
                        style={[styles.calloutText, itemIndex > 0 && styles.calloutProseSpacing]}
                      >
                        <RichText nodes={item} />
                      </Text>
                    ))
                  : block.items.map((item, itemIndex) => (
                      <View key={itemIndex} style={styles.listItemRow}>
                        <Text style={styles.calloutText}>{"• "}</Text>
                        <Text style={[styles.calloutText, styles.listItemTextBody]}>
                          <RichText nodes={item} />
                        </Text>
                      </View>
                    ))}
              </View>
            );
          case "table":
            return (
              <View key={index} style={styles.tableWrapper}>
                {block.heading && <Text style={styles.calloutHeading}>{block.heading}</Text>}
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  {block.headers.map((header, headerIndex) => (
                    <Text key={headerIndex} style={[styles.tableCell, styles.tableHeaderCell]}>
                      {header}
                    </Text>
                  ))}
                </View>
                {block.rows.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.tableRow}>
                    {row.map((cell, cellIndex) => (
                      <Text key={cellIndex} style={styles.tableCell}>
                        <RichText nodes={cell} />
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            );
          default: {
            const exhaustive: never = block;
            return exhaustive;
          }
        }
      })}

      {article.references && article.references.length > 0 && (
        <View style={styles.referencesWrapper}>
          <Text style={styles.subtitle}>References</Text>
          {article.references.map((reference) => (
            <Text key={reference.id} style={styles.referenceItem}>
              {reference.id}. {reference.citation && `${reference.citation} `}
              <RichText nodes={[{ text: reference.url, href: reference.url }]} />
            </Text>
          ))}
        </View>
      )}
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
  lastUpdated: {
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
  subheading: {
    marginTop: theme.spacing.xl,
    color: theme.colors.textMuted,
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.semibold,
  },
  graphicWrapper: {
    marginTop: theme.spacing.xl,
  },
  listWrapper: {
    marginTop: theme.spacing.xl,
  },
  listItemRow: {
    flexDirection: "row",
    marginTop: theme.spacing.xs,
  },
  listItemText: {
    color: theme.colors.textMuted,
  },
  listItemTextBody: {
    flex: 1,
  },
  calloutWrapper: {
    marginTop: theme.spacing.xl,
    backgroundColor: "#D6E9FF",
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
  },
  calloutHeading: {
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.weight.bold,
    fontSize: theme.typography.size.sm,
    color: theme.colors.navyStatic,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  calloutProseSpacing: {
    marginTop: theme.spacing.sm,
  },
  calloutText: {
    color: theme.colors.navyStatic,
  },
  referencesWrapper: {
    marginTop: theme.spacing.xl,
  },
  referenceItem: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textMuted,
  },
  tableWrapper: {
    marginTop: theme.spacing.xl,
    borderWidth: 1,
    borderColor: "#D6E9FF",
    borderRadius: theme.radii.lg,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#D6E9FF",
  },
  tableHeaderRow: {
    borderTopWidth: 0,
  },
  tableCell: {
    flex: 1,
    padding: theme.spacing.sm,
    fontSize: theme.typography.size.sm,
    color: theme.colors.textMuted,
  },
  tableHeaderCell: {
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
});
