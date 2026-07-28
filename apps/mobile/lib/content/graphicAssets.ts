import type { ImageSourcePropType } from "react-native";
import type { GraphicKey } from "@exercise-tracker/content";

// Each app owns its own image files and maps the shared package's logical
// GraphicKey to them here — packages/content never sees the binary. Typing
// this as Record<GraphicKey, ...> means adding a key in the shared package
// without adding a matching entry here fails typecheck.
export const graphicAssets: Record<GraphicKey, ImageSourcePropType> = {
  "landing-hero": require("../../assets/landing/landing-hero.jpg"),
};
