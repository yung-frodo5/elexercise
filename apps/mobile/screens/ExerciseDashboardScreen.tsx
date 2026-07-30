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

export default function ExerciseDashboardScreen({ accessToken }: { accessToken: string }) {
  const [subTab, setSubTab] = useState<SubTab>("track");
  const light = subTab === "workouts";
  const ink = light ? theme.colors.navy : theme.colors.textPrimary;

  return (
    <View style={[styles.container, light && styles.lightBg]}>
      <View
        style={[
          styles.tabBar,
          light && styles.lightBg,
          { borderBottomColor: withAlpha(ink, light ? 0.12 : 0.15) },
        ]}
      >
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
                  { color: withAlpha(ink, active ? 1 : light ? 0.45 : 0.55) },
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
  lightBg: {
    backgroundColor: "#FFFFFF",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    marginRight: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    alignItems: "center",
  },
  tabLabel: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.semibold,
    paddingBottom: theme.spacing.sm,
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
