import { StyleSheet, Text, View } from "react-native";
import { theme } from "@exercise-tracker/design-tokens";
import { sportTagColors } from "@exercise-tracker/workout-history";

export function SportTag({ label, compact }: { label: string; compact?: boolean }) {
  const { fg, bg } = sportTagColors(label);
  return (
    <View style={[styles.tag, compact && styles.tagCompact, { backgroundColor: bg }]}>
      <Text style={[styles.label, compact && styles.labelCompact, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radii.pill,
    alignSelf: "flex-start",
  },
  tagCompact: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  label: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.semibold,
    // System font — Menlo can miss glyphs; tags are short Latin labels.
  },
  labelCompact: {
    fontSize: 10,
  },
});
