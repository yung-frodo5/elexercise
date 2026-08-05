import { describe, expect, it } from "vitest";
import { withAlpha } from "./withAlpha";

describe("withAlpha", () => {
  it("converts a #rrggbb hex to an rgba() string with the given alpha", () => {
    expect(withAlpha("#0033A0", 0.3)).toBe("rgba(0, 51, 160, 0.3)");
  });

  it("throws on a CSS var() string instead of silently returning it unmodified", () => {
    expect(() => withAlpha("var(--elex-navy, #0033A0)", 0.3)).toThrow(/var\(\)/);
  });
});
