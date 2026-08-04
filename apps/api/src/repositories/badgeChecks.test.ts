import { describe, it, expect } from "vitest";
import { BADGE_CHECKS, currentStreakDays, weekendStreak } from "./badgeChecks.js";
import type { BadgeEvalContext } from "./badgeChecks.js";

const BASE_CONTEXT: BadgeEvalContext = {
  completedSessionCount: 0,
  streakDays: 0,
  consecutiveFullWeekends: 0,
  durationS: 0,
  startHourUtc: 12,
  month: 6,
  day: 15,
  isAnniversary: false,
};

describe("currentStreakDays", () => {
  it("is 1 for a single date matching the reference", () => {
    expect(currentStreakDays(["2026-06-15"], "2026-06-15")).toBe(1);
  });

  it("counts back through consecutive prior days", () => {
    const dates = ["2026-06-15", "2026-06-14", "2026-06-13"];
    expect(currentStreakDays(dates, "2026-06-15")).toBe(3);
  });

  it("stops at the first gap", () => {
    const dates = ["2026-06-15", "2026-06-14", "2026-06-10"];
    expect(currentStreakDays(dates, "2026-06-15")).toBe(2);
  });

  it("ignores duplicate/unrelated later dates", () => {
    // Shouldn't normally happen (reference is always the most recent), but
    // shouldn't break the scan either.
    expect(currentStreakDays(["2026-06-16", "2026-06-15", "2026-06-14"], "2026-06-15")).toBe(2);
  });

  it("is 0 when the reference date itself isn't in the list", () => {
    expect(currentStreakDays(["2026-06-10"], "2026-06-15")).toBe(0);
  });
});

describe("weekendStreak", () => {
  it("counts a completed weekend that just happened", () => {
    // Sat 2026-06-13, Sun 2026-06-14 -- referenceDate is that Sunday.
    expect(weekendStreak(["2026-06-14", "2026-06-13"], "2026-06-14")).toBe(1);
  });

  it("doesn't count a weekend still in progress (reference is the Saturday, no Sunday yet)", () => {
    expect(weekendStreak(["2026-06-13"], "2026-06-13")).toBe(0);
  });

  it("counts multiple consecutive full weekends", () => {
    const dates = ["2026-06-14", "2026-06-13", "2026-06-07", "2026-06-06", "2026-05-31", "2026-05-30"];
    expect(weekendStreak(dates, "2026-06-14")).toBe(3);
  });

  it("stops at the first weekend missing either day", () => {
    // Most recent weekend (Jun 13-14) complete, the one before (Jun 6-7) missing Sunday.
    const dates = ["2026-06-14", "2026-06-13", "2026-06-06"];
    expect(weekendStreak(dates, "2026-06-14")).toBe(1);
  });
});

describe("BADGE_CHECKS", () => {
  it("First Watt fires only on exactly the first completed session", () => {
    expect(BADGE_CHECKS["First Watt"]({ ...BASE_CONTEXT, completedSessionCount: 1 })).toBe(true);
    expect(BADGE_CHECKS["First Watt"]({ ...BASE_CONTEXT, completedSessionCount: 2 })).toBe(false);
    expect(BADGE_CHECKS["First Watt"]({ ...BASE_CONTEXT, completedSessionCount: 0 })).toBe(false);
  });

  it.each([
    ["Plugged In", 5],
    ["Grid Connected", 15],
    ["Off the Grid", 30],
  ])("%s fires at level %i and above, not below", (name, threshold) => {
    expect(BADGE_CHECKS[name]({ ...BASE_CONTEXT, newLevel: threshold })).toBe(true);
    expect(BADGE_CHECKS[name]({ ...BASE_CONTEXT, newLevel: threshold - 1 })).toBe(false);
    expect(BADGE_CHECKS[name]({ ...BASE_CONTEXT, newLevel: undefined })).toBe(false);
  });

  it("Century Session fires at 1 kWh and above", () => {
    expect(BADGE_CHECKS["Century Session"]({ ...BASE_CONTEXT, totalEnergyJoules: 3_600_000 })).toBe(true);
    expect(BADGE_CHECKS["Century Session"]({ ...BASE_CONTEXT, totalEnergyJoules: 3_599_999 })).toBe(false);
  });

  it("You Put The Our In Hour fires at 60+ minutes", () => {
    expect(BADGE_CHECKS["You Put The Our In Hour"]({ ...BASE_CONTEXT, durationS: 3600 })).toBe(true);
    expect(BADGE_CHECKS["You Put The Our In Hour"]({ ...BASE_CONTEXT, durationS: 3599 })).toBe(false);
  });

  it("Killawatt fires at 1 kW instantaneous and above", () => {
    const name = "Killawatt? Why? What Did It Do To Me?";
    expect(BADGE_CHECKS[name]({ ...BASE_CONTEXT, peakPowerW: 1000 })).toBe(true);
    expect(BADGE_CHECKS[name]({ ...BASE_CONTEXT, peakPowerW: 999 })).toBe(false);
  });

  it("Early Bird Volt / Night Owl Amp are mutually exclusive time windows", () => {
    expect(BADGE_CHECKS["Early Bird Volt"]({ ...BASE_CONTEXT, startHourUtc: 5 })).toBe(true);
    expect(BADGE_CHECKS["Early Bird Volt"]({ ...BASE_CONTEXT, startHourUtc: 6 })).toBe(false);
    expect(BADGE_CHECKS["Night Owl Amp"]({ ...BASE_CONTEXT, startHourUtc: 23 })).toBe(true);
    expect(BADGE_CHECKS["Night Owl Amp"]({ ...BASE_CONTEXT, startHourUtc: 22 })).toBe(false);
  });

  it("New Year, New Watts fires only on Jan 1", () => {
    expect(BADGE_CHECKS["New Year, New Watts"]({ ...BASE_CONTEXT, month: 1, day: 1 })).toBe(true);
    expect(BADGE_CHECKS["New Year, New Watts"]({ ...BASE_CONTEXT, month: 1, day: 2 })).toBe(false);
  });

  it("Leap Second fires only on Feb 29", () => {
    expect(BADGE_CHECKS["Leap Second"]({ ...BASE_CONTEXT, month: 2, day: 29 })).toBe(true);
    expect(BADGE_CHECKS["Leap Second"]({ ...BASE_CONTEXT, month: 2, day: 28 })).toBe(false);
  });

  it("streak badges fire at their exact day thresholds", () => {
    expect(BADGE_CHECKS["Spark Streak"]({ ...BASE_CONTEXT, streakDays: 3 })).toBe(true);
    expect(BADGE_CHECKS["Spark Streak"]({ ...BASE_CONTEXT, streakDays: 2 })).toBe(false);
    expect(BADGE_CHECKS["Steady Current"]({ ...BASE_CONTEXT, streakDays: 7 })).toBe(true);
    expect(BADGE_CHECKS["Unbroken Circuit"]({ ...BASE_CONTEXT, streakDays: 30 })).toBe(true);
    expect(BADGE_CHECKS["Full Charge"]({ ...BASE_CONTEXT, streakDays: 100 })).toBe(true);
  });

  it("Weekend Warrior fires at 4 consecutive full weekends", () => {
    expect(BADGE_CHECKS["Weekend Warrior"]({ ...BASE_CONTEXT, consecutiveFullWeekends: 4 })).toBe(true);
    expect(BADGE_CHECKS["Weekend Warrior"]({ ...BASE_CONTEXT, consecutiveFullWeekends: 3 })).toBe(false);
  });

  it("Anniversary Amp is driven entirely by the precomputed flag", () => {
    expect(BADGE_CHECKS["Anniversary Amp"]({ ...BASE_CONTEXT, isAnniversary: true })).toBe(true);
    expect(BADGE_CHECKS["Anniversary Amp"]({ ...BASE_CONTEXT, isAnniversary: false })).toBe(false);
  });
});
