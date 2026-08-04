import { describe, it, expect } from "vitest";
import { xpForLevel, levelForXp, progressToNextLevel, tierForLevel, TIERS } from "./index.js";

describe("TIERS", () => {
  it("has 30 tiers, levels 1-30, strictly increasing thresholds", () => {
    expect(TIERS).toHaveLength(30);
    TIERS.forEach((tier, i) => expect(tier.level).toBe(i + 1));
    for (let i = 1; i < TIERS.length; i++) {
      expect(TIERS[i].thresholdWh).toBeGreaterThan(TIERS[i - 1].thresholdWh);
    }
  });
});

describe("tierForLevel", () => {
  it("is undefined at level 0 (unranked)", () => {
    expect(tierForLevel(0)).toBeUndefined();
  });

  it("returns the matching tier for levels 1-30", () => {
    expect(tierForLevel(1)).toEqual({ level: 1, thresholdWh: 100, name: "Spark", equivalent: "Charges a phone ~8x" });
    expect(tierForLevel(30)?.name).toBe("Net-Zero Legend");
  });

  it("clamps out-of-range levels", () => {
    expect(tierForLevel(-5)).toBeUndefined();
    expect(tierForLevel(31)?.level).toBe(30);
    expect(tierForLevel(999)?.level).toBe(30);
  });
});

describe("xpForLevel", () => {
  it("is 0 at level 0", () => {
    expect(xpForLevel(0)).toBe(0);
  });

  it("matches each tier's threshold", () => {
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(2)).toBe(300);
    expect(xpForLevel(30)).toBe(50_000_000);
  });

  it("clamps below level 0 up to level 0", () => {
    expect(xpForLevel(-5)).toBe(xpForLevel(0));
  });
});

describe("levelForXp", () => {
  it("is level 0 for negative or sub-threshold xp", () => {
    expect(levelForXp(-5)).toBe(0);
    expect(levelForXp(0)).toBe(0);
    expect(levelForXp(99)).toBe(0);
  });

  it("is the inverse of xpForLevel at exact thresholds", () => {
    for (const level of [1, 2, 10, 20, 30]) {
      expect(levelForXp(xpForLevel(level))).toBe(level);
    }
  });

  it("does not roll over to the next level until its exact threshold", () => {
    expect(levelForXp(xpForLevel(10) - 1)).toBe(9);
    expect(levelForXp(xpForLevel(10))).toBe(10);
  });

  it("caps at level 30 for arbitrarily large xp", () => {
    expect(levelForXp(1_000_000_000)).toBe(30);
  });
});

describe("progressToNextLevel", () => {
  it("is unranked (no tier) below the first threshold", () => {
    const progress = progressToNextLevel(50);
    expect(progress.level).toBe(0);
    expect(progress.tier).toBeUndefined();
    expect(progress.nextTier?.name).toBe("Spark");
  });

  it("starts a fresh level at 0% progress", () => {
    const progress = progressToNextLevel(xpForLevel(10));
    expect(progress.level).toBe(10);
    expect(progress.tier?.name).toBe("Amp");
    expect(progress.nextTier?.name).toBe("Watt Warrior");
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

  it("is maxed out at level 30 with no next tier", () => {
    const progress = progressToNextLevel(xpForLevel(30) + 12_345_678);
    expect(progress.level).toBe(30);
    expect(progress.tier?.name).toBe("Net-Zero Legend");
    expect(progress.nextTier).toBeUndefined();
    expect(progress.xpRemaining).toBe(0);
    expect(progress.progressFraction).toBe(1);
  });
});
