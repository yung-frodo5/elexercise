import type { CSSProperties } from "react";
import { theme } from "@exercise-tracker/design-tokens";

/** Compact uppercase label — table headers, chart titles, section eyebrows. */
export const overlineStyle: CSSProperties = {
  margin: 0,
  fontSize: theme.typography.size.xxs,
  fontWeight: theme.typography.weight.semibold,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  // Navy on white canvas (main design overhaul). Blue table headers override to white.
  color: theme.colors.navy,
  fontFamily: theme.typography.fontFamily.web,
};
