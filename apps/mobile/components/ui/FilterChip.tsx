import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";

/** Additive filter pill — same tokens as web; `compact` for toolbar density. */
export function FilterChip({
  label,
  active,
  onPress,
  compact,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.chip,
        compact && styles.chipCompact,
        {
          borderColor: active
            ? withAlpha(theme.colors.primaryGreen, 0.45)
            : withAlpha(theme.colors.border, 0.28),
          backgroundColor: active ? withAlpha(theme.colors.primaryGreen, 0.2) : "transparent",
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          compact && styles.labelCompact,
          {
            color: active ? theme.colors.secondaryGreen : theme.colors.navy,
            fontWeight: active
              ? theme.typography.weight.semibold
              : theme.typography.weight.medium,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 5,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
  },
  chipCompact: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  label: {
    fontSize: theme.typography.size.xs,
    fontFamily: "Menlo",
  },
  labelCompact: {
    fontSize: 10,
  },
});
