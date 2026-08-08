import { spacing } from "./spacing";
import { typography } from "./typography";

// Sizing presets for read-only pill/tag UI (radii.pill handles the shape).
// Only "small" is defined for now -- existing pills (e.g. SportTag) keep
// their own hardcoded sizing rather than being migrated onto a "default"
// preset here, so this is additive, not a behavior change for them. Reach
// for "small" when a pill needs to sit inline with body text as a
// lower-emphasis label instead of competing visually with primary tags.
export const pill = {
  small: {
    paddingVertical: 1,
    paddingHorizontal: spacing.xs,
    // A couple px above typography.size.xxs (11) -- xxs read as too small
    // for this pill's text once seen next to body copy, but the default
    // scale's next step (sm: 16) is a jump back to full-size pill territory.
    fontSize: typography.size.xxs + 2,
    fontWeight: typography.weight.regular,
  },
} as const;
