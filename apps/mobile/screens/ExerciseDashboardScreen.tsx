import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import TrackScreen from "./TrackScreen";
import HistoryScreen from "./HistoryScreen";

type SubTab = "track" | "workouts";

const TABS: { id: SubTab; label: string }[] = [
  { id: "track", label: "Track" },
  { id: "workouts", label: "Workouts" },
];

/** Dashboard sub-tabs: Track (existing dark shell) and Workouts (white/navy feed). */
export default function ExerciseDashboardScreen({ accessToken }: { accessToken: string }) {
  const [subTab, setSubTab] = useState<SubTab>("track");
  const onWorkouts = subTab === "workouts";

  return (
    <View style={[styles.container, onWorkouts && styles.containerWorkouts]}>
      <View style={[styles.tabBar, onWorkouts && styles.tabBarWorkouts]}>
        {TABS.map(({ id, label }) => {
          const active = subTab === id;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => setSubTab(id)}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.tabLabel,
                  onWorkouts ? styles.tabLabelOnLight : null,
                  active && (onWorkouts ? styles.tabLabelActiveOnLight : styles.tabLabelActive),
                ]}
              >
                {label}
              </Text>
              <View style={[styles.underline, active && styles.underlineActive]} />
            </TouchableOpacity>
          );
        })}
      </View>
      {subTab === "track" ? (
        <TrackScreen accessToken={accessToken} />
      ) : (
        <HistoryScreen accessToken={accessToken} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  containerWorkouts: {
    backgroundColor: "#FFFFFF",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: withAlpha(theme.colors.textPrimary, 0.15),
  },
  tabBarWorkouts: {
    backgroundColor: "#FFFFFF",
    borderBottomColor: withAlpha(theme.colors.navy, 0.12),
  },
  tab: {
    marginRight: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    alignItems: "center",
  },
  tabLabel: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.semibold,
    color: withAlpha(theme.colors.textPrimary, 0.55),
    paddingBottom: theme.spacing.sm,
  },
  tabLabelOnLight: {
    color: withAlpha(theme.colors.navy, 0.45),
  },
  tabLabelActive: {
    color: theme.colors.textPrimary,
  },
  tabLabelActiveOnLight: {
    color: theme.colors.navy,
  },
  underline: {
    alignSelf: "stretch",
    height: 2,
    borderRadius: 1,
    backgroundColor: "transparent",
  },
  underlineActive: {
    backgroundColor: theme.colors.primaryGreen,
  },
});
