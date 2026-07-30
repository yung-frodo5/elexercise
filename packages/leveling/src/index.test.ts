import { describe, it, expect } from "vitest";
import { xpForLevel, levelForXp, progressToNextLevel } from "./index.js";

describe("xpForLevel", () => {
  it("is 0 for level 1", () => {
    expect(xpForLevel(1)).toBe(0);
  });

  // Real published RuneScape XP-to-level reference values -- confirms the
  // formula itself is right, not just internally self-consistent.
  it.each([
    [2, 83],
    [3, 174],
    [10, 1154],
    [50, 101333],
    [99, 13034431],
  ])("level %i requires %i xp", (level, expectedXp) => {
    expect(xpForLevel(level)).toBe(expectedXp);
  });

  it("clamps below level 1 up to level 1", () => {
    expect(xpForLevel(0)).toBe(xpForLevel(1));
  });
});

describe("levelForXp", () => {
  it("is level 1 for 0 or negative xp", () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(-5)).toBe(1);
  });

  it("is the inverse of xpForLevel at exact thresholds", () => {
    for (const level of [2, 3, 10, 50, 99]) {
      expect(levelForXp(xpForLevel(level))).toBe(level);
    }
  });

  it("does not roll over to the next level until its exact threshold", () => {
    expect(levelForXp(xpForLevel(10) - 1)).toBe(9);
    expect(levelForXp(xpForLevel(10))).toBe(10);
  });
});

describe("progressToNextLevel", () => {
  it("starts a fresh level at 0% progress", () => {
    const progress = progressToNextLevel(xpForLevel(10));
    expect(progress.level).toBe(10);
    expect(progress.xpIntoLevel).toBe(0);
    expect(progress.progressFraction).toBe(0);
    expect(progress.xpRemaining).toBe(xpForLevel(11) - xpForLevel(10));
  });

  it("reaches 100% progress right before the next level's threshold", () => {
    const progress = progressToNextLevel(xpForLevel(11) - 1);
    expect(progress.level).toBe(10);
    expect(progress.xpRemaining).toBe(1);
    expect(progress.progressFraction).toBeCloseTo(1, 2);
  });

  it("is internally consistent: xpIntoLevel + xpRemaining spans exactly one level", () => {
    const progress = progressToNextLevel(xpForLevel(20) + 500);
    const levelSpan = xpForLevel(21) - xpForLevel(20);
    expect(progress.xpIntoLevel + progress.xpRemaining).toBe(levelSpan);
  });
});
