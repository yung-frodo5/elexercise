import { StyleSheet, Text, View } from "react-native";
import { theme } from "@exercise-tracker/design-tokens";
import { progressToNextLevel } from "@exercise-tracker/leveling";

export function LevelProgress({ level, elexir }: { level: number; elexir: number }) {
  const progress = progressToNextLevel(elexir);

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.level}>
          Level {level}
          {progress.tier ? `: ${progress.tier.name}` : ""}
        </Text>
        <Text style={styles.elexir}>{elexir} elexir earned</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress.progressFraction * 100}%` }]} />
      </View>

      {progress.tier && <Text style={styles.remaining}>{progress.tier.equivalent}</Text>}

      <Text style={styles.remaining}>
        {progress.nextTier
          ? `${progress.xpRemaining} elexir to Level ${level + 1}: ${progress.nextTier.name}`
          : "Max level reached!"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: theme.spacing.xs,
  },
  level: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
  },
  elexir: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textMuted,
  },
  track: {
    width: "100%",
    height: 10,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.border,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.primaryGreen,
  },
  remaining: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.size.sm,
    color: theme.colors.textMuted,
  },
});
