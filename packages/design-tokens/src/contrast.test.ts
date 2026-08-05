import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { themedColors, staticColors } from "./colors";

// Hand-curated foreground/background combinations that are actually
// composited together somewhere in apps/web -- not a Cartesian product of
// every token (which would also assert meaningless pairs, like error text
// against a background it's never rendered on). Adding a new call site
// that composites two tokens together should add an entry here too (see
// CONTRIBUTING.md's "Adding or changing tokens" section).
type Mode = "light" | "dark";

interface ThemedPair {
  name: string;
  fg: keyof typeof themedColors;
  bg: keyof typeof themedColors;
  minRatio: 4.5 | 3;
  // Defaults to both. Use this to scope a check to the mode a token was
  // actually introduced to fix -- e.g. controlBorder's light-mode weight is
  // a pre-existing, intentionally-subtle design choice (not a dark-mode
  // regression), so asserting 3:1 there would demand a light-mode visual
  // change nobody asked for. Only add a restriction like this with a
  // comment explaining why the excluded mode is out of scope.
  modes?: Mode[];
}

const THEMED_PAIRS: ThemedPair[] = [
  { name: "body/article text on canvas", fg: "navy", bg: "canvasBg", minRatio: 4.5 },
  { name: "body text on header/content-panel chrome", fg: "navy", bg: "chromeBg", minRatio: 4.5 },
  { name: "article links/footnotes on chrome", fg: "link", bg: "chromeBg", minRatio: 4.5 },
  { name: "error text on canvas", fg: "error", bg: "canvasBg", minRatio: 4.5 },
  // Wordmark/"Log in"/profile-name text renders at 20-26px semibold/bold --
  // large text by WCAG's definition, so 3:1 applies.
  { name: "brand accent (wordmark/login) on chrome, large text", fg: "brandAccent", bg: "chromeBg", minRatio: 3 },
  // Non-text UI component (a button fill against its container), 3:1 threshold.
  { name: "navbar control fill vs header chrome", fg: "controlOnChrome", bg: "chromeBg", minRatio: 3 },
  { name: "home page definition text on canvas", fg: "definitionText", bg: "canvasBg", minRatio: 4.5 },
  // Non-text UI component (a ghost chip's outline against the page it sits
  // on), 3:1 threshold. Dark-mode only: the light-mode weight is an
  // intentionally subtle pre-existing design choice this PR isn't
  // redesigning -- this token exists specifically to fix the dark-mode
  // value, which was ~1.1:1 (functionally invisible) before.
  { name: "ghost control border vs canvas", fg: "controlBorder", bg: "canvasBg", minRatio: 3, modes: ["dark"] },
];

const STATIC_PAIRS = [
  { name: "static ink on static white panel", fg: staticColors.ink, bg: staticColors.panelBg, minRatio: 4.5 },
  { name: "static ink on static accent panel", fg: staticColors.ink, bg: staticColors.accentPanelBg, minRatio: 4.5 },
  {
    name: "static error ink on static white panel",
    fg: staticColors.errorInk,
    bg: staticColors.panelBg,
    minRatio: 4.5,
  },
  {
    name: "static error ink on static accent panel",
    fg: staticColors.errorInk,
    bg: staticColors.accentPanelBg,
    minRatio: 4.5,
  },
  {
    name: "static error ink (dark-panel variant) on static navy panel",
    fg: staticColors.errorInkOnDarkPanel,
    bg: staticColors.darkPanelBg,
    minRatio: 4.5,
  },
] as const;

function themedValue(key: keyof typeof themedColors, mode: Mode): string {
  return themedColors[key][mode];
}

describe("themed color contrast (WCAG AA)", () => {
  const modes: Mode[] = ["light", "dark"];
  for (const mode of modes) {
    describe(mode, () => {
      for (const pair of THEMED_PAIRS) {
        if (pair.modes && !pair.modes.includes(mode)) continue;
        it(`${pair.name} meets ${pair.minRatio}:1`, () => {
          const ratio = contrastRatio(themedValue(pair.fg, mode), themedValue(pair.bg, mode));
          expect(ratio).toBeGreaterThanOrEqual(pair.minRatio);
        });
      }
    });
  }
});

describe("static color contrast (WCAG AA)", () => {
  for (const pair of STATIC_PAIRS) {
    it(`${pair.name} meets ${pair.minRatio}:1`, () => {
      expect(contrastRatio(pair.fg, pair.bg)).toBeGreaterThanOrEqual(pair.minRatio);
    });
  }
});
