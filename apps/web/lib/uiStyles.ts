import type { CSSProperties } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { newsreader } from "./fonts";

// Used both on real <th> table headers (HistoryTable.tsx) and non-header
// chart titles (MultiPowerChart.tsx's "Power Output" eyebrow). The <th>
// case still ends up Clash Display regardless of this value -- the global
// `th { font-family: ... !important }` rule (layout.tsx) always wins over
// this inline value there. This is the correct default for the other
// (non-<th>) use site.
/** Compact uppercase label — table headers, chart titles, section eyebrows. */
export const overlineStyle: CSSProperties = {
  margin: 0,
  fontSize: theme.typography.size.xxs,
  fontWeight: theme.typography.weight.semibold,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: theme.colors.navy,
  fontFamily: newsreader.style.fontFamily,
};
