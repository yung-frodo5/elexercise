import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@exercise-tracker/design-tokens";
import type { EarnedBadge } from "../../lib/useEarnedBadges";

// No hover on touch devices -- long-press shows the name/criteria (via a
// native Alert) as the tooltip equivalent; a normal tap selects/deselects
// the badge as the profile avatar, mirroring the web version's click.
export function EarnedBadges({
  badges,
  loading,
  selectedBadgeId,
  onSelect,
}: {
  badges: EarnedBadge[];
  loading: boolean;
  selectedBadgeId: string | null;
  onSelect: (badge: EarnedBadge | null) => void;
}) {
  if (loading) return <ActivityIndicator />;

  if (badges.length === 0) {
    return <Text style={styles.empty}>No badges earned yet — keep elexercising!</Text>;
  }

  return (
    <View style={styles.grid}>
      {badges.map((badge) => {
        const isSelected = badge.id === selectedBadgeId;
        return (
          <Pressable
            key={badge.id}
            onPress={() => onSelect(isSelected ? null : badge)}
            onLongPress={() => {
              const detail = badge.tagline ? `${badge.tagline}\n\n${badge.criteria}` : badge.criteria;
              Alert.alert(badge.name, detail);
            }}
            style={[styles.badge, isSelected && styles.badgeSelected]}
          >
            <Text style={styles.emoji}>{badge.emoji}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  badgeSelected: {
    borderColor: theme.colors.primaryGreen,
  },
  emoji: {
    fontSize: theme.typography.size.lg,
  },
  empty: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textMuted,
  },
});
