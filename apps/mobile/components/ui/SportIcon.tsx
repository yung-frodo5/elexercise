import { StyleSheet, View } from "react-native";
import { activityColorForSport } from "@exercise-tracker/workout-history";

/**
 * Tiny sport swatch — same hashed color as web SportTag / chart series.
 * Plain Views (no emoji) so Menlo / custom fonts never show � / ?.
 */
export function SportIcon({ sport, size = 10 }: { sport: string; size?: number }) {
  const color = activityColorForSport(sport);
  return (
    <View
      accessibilityLabel={sport}
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: Math.max(2, size * 0.35),
          backgroundColor: color,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    flexShrink: 0,
  },
});
