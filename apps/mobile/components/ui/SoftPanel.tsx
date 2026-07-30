import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";

/** Soft bordered surface — same tokens as web SoftPanel (white + navy shadow). */
export function SoftPanel({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: withAlpha(theme.colors.border, 0.28),
    borderRadius: theme.radii.lg,
    shadowColor: theme.colors.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
});
