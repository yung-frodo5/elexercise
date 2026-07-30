// The classic RuneScape XP curve: xp(level) = floor((1/4) * sum_{n=1}^{level-1} floor(n + 300*2^(n/7))).
// Shared by apps/api (decides what level to persist when elexir is
// awarded) and both frontends (render a progress bar from a profile row
// they already have) -- one formula, not copy-pasted three times.

const MAX_LEVEL = 200;

function computeXpForLevel(level: number): number {
  let total = 0;
  for (let n = 1; n < level; n++) {
    total += Math.floor(n + 300 * Math.pow(2, n / 7));
  }
  return Math.floor(total / 4);
}

// Precomputed up to level 200 -- comfortably beyond anything reachable in
// practice (level 99 alone needs ~13M xp, ~87,000 machine-generated
// workouts at ~150 Wh each), so no unbounded loop risk from a runaway
// elexir value, and levelForXp stays a cheap bounded scan.
const XP_THRESHOLDS: number[] = Array.from({ length: MAX_LEVEL + 1 }, (_, level) => computeXpForLevel(level));

export function xpForLevel(level: number): number {
  const clamped = Math.max(1, Math.min(Math.floor(level), MAX_LEVEL));
  return XP_THRESHOLDS[clamped];
}

export function levelForXp(xp: number): number {
  if (xp <= 0) return 1;
  let level = 1;
  for (let candidate = 2; candidate <= MAX_LEVEL; candidate++) {
    if (XP_THRESHOLDS[candidate] > xp) break;
    level = candidate;
  }
  return level;
}

export interface LevelProgress {
  level: number;
  xpIntoLevel: number;
  xpRemaining: number;
  progressFraction: number; // 0-1
}

// Everything a progress bar needs, from just the xp a caller already has --
// no formula duplicated at every call site.
export function progressToNextLevel(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const currentThreshold = xpForLevel(level);

  if (level >= MAX_LEVEL) {
    return { level, xpIntoLevel: xp - currentThreshold, xpRemaining: 0, progressFraction: 1 };
  }

  const nextThreshold = xpForLevel(level + 1);
  const xpIntoLevel = xp - currentThreshold;
  const levelSpan = nextThreshold - currentThreshold;

  return {
    level,
    xpIntoLevel,
    xpRemaining: nextThreshold - xp,
    progressFraction: Math.min(xpIntoLevel / levelSpan, 1),
  };
}
