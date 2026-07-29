import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "@exercise-tracker/design-tokens";

export function Header({ onPressProfile }: { onPressProfile: () => void }) {
  return (
    <View style={styles.bar}>
      <Text style={styles.title}>elexercise!</Text>
      <TouchableOpacity onPress={onPressProfile} accessibilityLabel="Settings">
        <Text style={styles.icon}>{theme.icons.settings}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.bannerBackground,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.native,
    fontSize: theme.typography.size.lg,
  },
  icon: {
    fontSize: theme.typography.size.lg,
  },
});
