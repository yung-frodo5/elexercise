import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "@exercise-tracker/design-tokens";
import TrackScreen from "./TrackScreen";
import HistoryScreen from "./HistoryScreen";

type SubTab = "track" | "history";

export default function ExerciseDashboardScreen({ accessToken }: { accessToken: string }) {
  const [subTab, setSubTab] = useState<SubTab>("track");

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <ToggleButton label="Track" active={subTab === "track"} onPress={() => setSubTab("track")} />
        <ToggleButton label="History" active={subTab === "history"} onPress={() => setSubTab("history")} />
      </View>
      {subTab === "track" ? <TrackScreen accessToken={accessToken} /> : <HistoryScreen accessToken={accessToken} />}
    </View>
  );
}

function ToggleButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.toggleButton, active && styles.toggleButtonActive]} onPress={onPress}>
      <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  toggleButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primaryGreen,
    borderColor: theme.colors.primaryGreen,
  },
  toggleLabel: {
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weight.medium,
  },
  toggleLabelActive: {
    color: "#ffffff",
  },
});
