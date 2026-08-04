// Pure badge-earning logic, kept separate from SupabaseWorkoutRepository so
// the rules themselves are unit-testable without a database.
//
// Only the badges *currently computable* from data this schema already
// tracks are here. The rest of the catalog (Fully Assembled, Battery
// Bonded, Overdrive, Recruiter, Power Squad, Top of the Grid, Podium
// Finish, Community Watt, Storm Chaser) needs tracking that doesn't exist
// yet (referrals, groups, leaderboard-placement history, grid-outage
// status, a calibration flow, an explicit "max power set" concept) -- not
// handled here, left in the catalog as un-earnable until that's built.

export interface BadgeEvalContext {
  /** Total completed sessions (any source) this user has ever had, including the one just closed. */
  completedSessionCount: number;
  /** Consecutive calendar days (UTC) with >=1 completed session, ending at this session's date. */
  streakDays: number;
  /** Consecutive weekends (Sat+Sun both, UTC) with >=1 completed session, ending at or before this session's date. */
  consecutiveFullWeekends: number;
  /** This session's own stats -- undefined when there were no power samples (e.g. a manual session). */
  totalEnergyJoules?: number;
  peakPowerW?: number;
  durationS: number;
  /** This user's level immediately after this session's elexir award, if any was awarded. */
  newLevel?: number;
  startHourUtc: number;
  month: number; // 1-12
  day: number;
  /** True when this session falls on the user's signup month/day, at least a full year after signup. */
  isAnniversary: boolean;
}

// Keyed by the badge catalog's `name` (see supabase/migrations/0011_seed_badges.sql).
export const BADGE_CHECKS: Record<string, (ctx: BadgeEvalContext) => boolean> = {
  "First Watt": (ctx) => ctx.completedSessionCount === 1,
  "Plugged In": (ctx) => (ctx.newLevel ?? 0) >= 5,
  "Grid Connected": (ctx) => (ctx.newLevel ?? 0) >= 15,
  "Off the Grid": (ctx) => (ctx.newLevel ?? 0) >= 30,
  "Spark Streak": (ctx) => ctx.streakDays >= 3,
  "Steady Current": (ctx) => ctx.streakDays >= 7,
  "Unbroken Circuit": (ctx) => ctx.streakDays >= 30,
  "Full Charge": (ctx) => ctx.streakDays >= 100,
  "Weekend Warrior": (ctx) => ctx.consecutiveFullWeekends >= 4,
  "Century Session": (ctx) => (ctx.totalEnergyJoules ?? 0) >= 3_600_000, // 1 kWh
  "You Put The Our In Hour": (ctx) => ctx.durationS >= 3600, // 60 minutes
  "Killawatt? Why? What Did It Do To Me?": (ctx) => (ctx.peakPowerW ?? 0) >= 1000,
  "Early Bird Volt": (ctx) => ctx.startHourUtc < 6,
  "Night Owl Amp": (ctx) => ctx.startHourUtc >= 23,
  "New Year, New Watts": (ctx) => ctx.month === 1 && ctx.day === 1,
  "Leap Second": (ctx) => ctx.month === 2 && ctx.day === 29,
  "Anniversary Amp": (ctx) => ctx.isAnniversary,
};

// The subset of BADGE_CHECKS whose context fields need the (relatively
// expensive) session-date-history query -- everything else only needs data
// already on hand (this session's own stats, the user's post-award level,
// or their signup date), so callers can skip that query entirely when none
// of a user's still-unearned badges are in this set.
export const HISTORY_DEPENDENT_BADGES = new Set([
  "First Watt",
  "Spark Streak",
  "Steady Current",
  "Unbroken Circuit",
  "Full Charge",
  "Weekend Warrior",
]);

/**
 * Consecutive UTC calendar days (YYYY-MM-DD strings, descending, deduped)
 * with an entry, walking backward from `referenceDate` (also YYYY-MM-DD).
 * `sortedDatesDesc` must include `referenceDate` itself for a non-zero
 * result -- callers pass it in because the session being evaluated was
 * just marked completed, so its own date is always in the set.
 */
export function currentStreakDays(sortedDatesDesc: string[], referenceDate: string): number {
  let streak = 0;
  const cursor = new Date(`${referenceDate}T00:00:00Z`);
  for (const dateStr of sortedDatesDesc) {
    const expected = cursor.toISOString().slice(0, 10);
    if (dateStr === expected) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else if (dateStr < expected) {
      break; // gap -- streak ends here
    }
    // dateStr > expected: a later date than the cursor (shouldn't happen
    // since we start exactly at referenceDate) -- skip and keep scanning.
  }
  return streak;
}

/**
 * Consecutive UTC weekends (Saturday AND Sunday both present in
 * `sortedDatesDesc`) walking backward from the most recent weekend at or
 * before `referenceDate`. A weekend still in progress (referenceDate is a
 * Saturday with no Sunday yet) doesn't count -- the walk starts from the
 * prior Sunday in that case.
 */
export function weekendStreak(sortedDatesDesc: string[], referenceDate: string): number {
  const dateSet = new Set(sortedDatesDesc);
  const cursor = new Date(`${referenceDate}T00:00:00Z`);
  while (cursor.getUTCDay() !== 0) cursor.setUTCDate(cursor.getUTCDate() - 1); // walk back to a Sunday

  let count = 0;
  for (;;) {
    const sunday = cursor.toISOString().slice(0, 10);
    const saturday = new Date(cursor);
    saturday.setUTCDate(saturday.getUTCDate() - 1);
    const saturdayStr = saturday.toISOString().slice(0, 10);
    if (dateSet.has(sunday) && dateSet.has(saturdayStr)) {
      count++;
      cursor.setUTCDate(cursor.getUTCDate() - 7);
    } else {
      break;
    }
  }
  return count;
}
