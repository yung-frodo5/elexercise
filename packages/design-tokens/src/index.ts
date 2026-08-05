export { colors, themedColors, staticColors } from "./colors";
export { spacing } from "./spacing";
export { typography } from "./typography";
export { icons } from "./icons";
export { radii } from "./radii";
export { withAlpha } from "./withAlpha";
export { webThemedColors, generateThemeCss } from "./webTheme";

import { colors, staticColors } from "./colors";
import { webThemedColors } from "./webTheme";
import { spacing } from "./spacing";
import { typography } from "./typography";
import { icons } from "./icons";
import { radii } from "./radii";

export const theme = {
  colors: {
    ...colors,
    // Web-only, additive tiers -- see colors.ts's themedColors/staticColors
    // comments. apps/mobile keeps using the flat keys above unchanged.
    themed: webThemedColors,
    static: staticColors,
  },
  spacing,
  typography,
  icons,
  radii,
};
