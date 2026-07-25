import { ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "@exercise-tracker/design-tokens";

export default function LandingScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroText}>TODO: update hero image</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What is elexercise?</Text>
        <Text style={styles.sectionBody}>TODO: add content for landing page</Text>
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
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    alignItems: "center",
  },
  heroText: {
    color: theme.colors.textPrimary,
  },
  section: {
    backgroundColor: "#ffffff",
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  sectionBody: {
    marginTop: theme.spacing.xl,
    textAlign: "center",
    color: theme.colors.textMuted,
  },
});
