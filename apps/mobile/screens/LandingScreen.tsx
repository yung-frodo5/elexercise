import { ScrollView, StyleSheet, View } from "react-native";
import { theme } from "@exercise-tracker/design-tokens";
import { landingArticle } from "@exercise-tracker/content";
import { ArticleView } from "../components/content/ArticleView";

export default function LandingScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <ArticleView article={landingArticle} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
  },
});
