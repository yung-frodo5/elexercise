import { Image, StyleSheet } from "react-native";
import type { Graphic as GraphicBlock } from "@exercise-tracker/content";
import { graphicAssets } from "../../lib/content/graphicAssets";

export function Graphic({ graphic }: { graphic: GraphicBlock }) {
  return (
    <Image
      source={graphicAssets[graphic.key]}
      accessibilityLabel={graphic.alt}
      style={styles.image}
      resizeMode="contain"
    />
  );
}

// Fixed banner height + resizeMode="contain", rather than preserving the
// source image's own aspect ratio at 100% width — an aspect-locked
// full-width image can dominate the screen depending on device width.
// Tall enough that the portrait-cropped source (405x540) renders close to
// its native size on typical phone widths instead of being squeezed down.
const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 480,
  },
});
