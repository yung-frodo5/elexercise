import { ScrollView, StyleSheet, View } from "react-native";
import { theme } from "@exercise-tracker/design-tokens";
import { landingArticle } from "@exercise-tracker/content";
import { ArticleView } from "../components/content/ArticleView";
import { Graphic } from "../components/content/Graphic";

export default function LandingScreen() {
  const [hero, ...rest] = landingArticle.body;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>{hero.type === "graphic" && <Graphic graphic={hero} />}</View>

      <View style={styles.section}>
        <ArticleView article={{ ...landingArticle, body: rest }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    backgroundColor: theme.colors.primaryGreen,
  },
  section: {
    backgroundColor: "#ffffff",
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
  },
});
