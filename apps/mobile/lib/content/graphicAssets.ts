import type { ImageSourcePropType } from "react-native";
import type { GraphicKey } from "@exercise-tracker/content";

// Each app owns its own image files and maps the shared package's logical
// GraphicKey to them here — packages/content never sees the binary. Typing
// this as Record<GraphicKey, ...> means adding a key in the shared package
// without adding a matching entry here fails typecheck.
// The "power-generation-*" entries aren't rendered by any mobile screen yet
// (there's no Articles screen on mobile) — they're required here only
// because GraphicKey is a shared union and this Record must cover every key.
export const graphicAssets: Record<GraphicKey, ImageSourcePropType> = {
  // Renders on the actual Landing screen (unlike the power-generation-*
  // entries below) -- part of landingArticle's real body, not just here to
  // satisfy the shared GraphicKey contract.
  "what-is-elexercise-diagram": require("../../assets/landing/what-is-elexercise.png"),
  "power-generation-pixii-machine": require("../../assets/articles/power-generation-pixii-machine.png"),
  "power-generation-bike-comp-home-usage": require("../../assets/articles/power-generation-bike-comp-home-usage.png"),
  "power-generation-bike-comp-no-carbon-price": require("../../assets/articles/power-generation-bike-comp-no-carbon-price.png"),
  "power-generation-bike-comp-ca": require("../../assets/articles/power-generation-bike-comp-ca.png"),
  "power-generation-bike-comp-hi": require("../../assets/articles/power-generation-bike-comp-hi.png"),
  "power-generation-treadmill-comp": require("../../assets/articles/power-generation-treadmill-comp.png"),
};
