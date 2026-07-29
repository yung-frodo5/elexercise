import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "@exercise-tracker/design-tokens";

export type Tab = "dashboard" | "home" | "profile";

export function Footer({ tab, onSelect }: { tab: Tab; onSelect: (tab: Tab) => void }) {
  return (
    <View style={styles.bar}>
      <TabButton icon={theme.icons.dashboard} label="Exercise dashboard" active={tab === "dashboard"} onPress={() => onSelect("dashboard")} />
      <TabButton icon={theme.icons.home} label="Home" active={tab === "home"} onPress={() => onSelect("home")} />
      <TabButton icon={theme.icons.profile} label="Profile" active={tab === "profile"} onPress={() => onSelect("profile")} />
    </View>
  );
}

function TabButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} accessibilityLabel={label}>
      <Text style={[styles.icon, active && styles.iconActive]}>{icon}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.bannerBackground,
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  icon: {
    fontSize: theme.typography.size.xl,
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
  },
});
