import { StyleSheet, TextInput, View, useWindowDimensions } from "react-native";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import { SearchIcon } from "./SearchIcon";

function padX(width: number): number {
  if (width < 360) return theme.spacing.md;
  if (width < 400) return theme.spacing.lg;
  return theme.spacing.xl;
}

/** Full-width rounded search field for the Workouts feed. */
export function FeedSearchBar({
  value,
  onChange,
  placeholder = "Search and filter your workouts",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const { width } = useWindowDimensions();
  const ink = theme.colors.navy;

  return (
    <View style={[styles.wrap, { paddingHorizontal: padX(width) }]}>
      <View style={styles.field}>
        <SearchIcon size={16} color={withAlpha(ink, 0.45)} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={withAlpha(ink, 0.4)}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    backgroundColor: "#FFFFFF",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: withAlpha(theme.colors.navy, 0.06),
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    margin: 0,
    fontSize: theme.typography.size.sm,
    color: theme.colors.navy,
  },
});
