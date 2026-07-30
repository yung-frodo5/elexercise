import { Text } from "react-native";
import { theme } from "@exercise-tracker/design-tokens";

/** Magnifying-glass glyph — no native SVG dep (works in existing dev client). */
export function SearchIcon({
  size = 16,
  color = theme.colors.navy,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Text style={{ fontSize: size, color, lineHeight: size + 2 }} accessibilityElementsHidden>
      ⌕
    </Text>
  );
}
