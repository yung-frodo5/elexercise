// 30 named tiers, keyed to lifetime elexir (1 elexir = 1 Wh generated).
// Thresholds are the product's actual kWh milestones (converted to Wh to
// match the `elexir` column), each with a relatable real-world equivalent
// and a tier name -- replaces the earlier placeholder RuneScape-style XP
// curve now that the product has real level content.
//
// Level 0 is a deliberate baseline, not an off-by-one: a brand-new user
// (0 elexir) is level 0/unranked until they cross the first tier's
// threshold and become level 1 "Spark". So TIERS[i] is level i+1, and
// levels run 0-30 (31 values), not 1-30.
export interface Tier {
  level: number; // 1-30 (level 0 has no tier -- see tierForLevel)
  thresholdWh: number;
  name: string;
  equivalent: string;
}

export const TIERS: readonly Tier[] = [
  { level: 1, thresholdWh: 100, name: "Spark", equivalent: "Charges a phone ~8x" },
  { level: 2, thresholdWh: 300, name: "Flicker", equivalent: "Runs an LED bulb ~30 hrs" },
  { level: 3, thresholdWh: 600, name: "Glow", equivalent: "Charges a laptop ~10x" },
  { level: 4, thresholdWh: 1_200, name: "Current", equivalent: "Runs a laptop for 2 workdays" },
  { level: 5, thresholdWh: 2_000, name: "Static", equivalent: "Powers an LED bulb ~200 hrs" },
  { level: 6, thresholdWh: 3_500, name: "Charge", equivalent: "Brews coffee daily for ~1 month" },
  { level: 7, thresholdWh: 6_000, name: "Surge", equivalent: "Runs a mini-fridge for 2 days" },
  { level: 8, thresholdWh: 10_000, name: "Circuit", equivalent: "Runs a fridge for ~1 day" },
  { level: 9, thresholdWh: 16_000, name: "Voltage", equivalent: "Runs a box fan for 2 weeks" },
  { level: 10, thresholdWh: 24_000, name: "Amp", equivalent: "Runs a fridge for 2 days" },
  { level: 11, thresholdWh: 36_000, name: "Watt Warrior", equivalent: "Powers a laptop for 6 weeks" },
  { level: 12, thresholdWh: 54_000, name: "Kilowatt Kid", equivalent: "Runs a window AC for 2 days" },
  { level: 13, thresholdWh: 80_000, name: "Dynamo", equivalent: "Powers a laptop for 2 months" },
  { level: 14, thresholdWh: 120_000, name: "Generator", equivalent: "~4 days of household power" },
  { level: 15, thresholdWh: 180_000, name: "Powerhouse", equivalent: "Charges an EV ~540 miles" },
  { level: 16, thresholdWh: 260_000, name: "Grid Runner", equivalent: "~1 week of household power" },
  { level: 17, thresholdWh: 380_000, name: "Megawatt Mind", equivalent: "Runs a window AC for 2 weeks" },
  { level: 18, thresholdWh: 550_000, name: "Overdrive", equivalent: "~2 weeks of household power" },
  { level: 19, thresholdWh: 800_000, name: "Turbine", equivalent: "Charges an EV ~2400 miles" },
  { level: 20, thresholdWh: 1_150_000, name: "Reactor", equivalent: "~1 month of household power" },
  { level: 21, thresholdWh: 1_650_000, name: "Fusion", equivalent: "Runs central AC for 2 summer weeks" },
  { level: 22, thresholdWh: 2_400_000, name: "Titan", equivalent: "~2 months of household power" },
  { level: 23, thresholdWh: 3_500_000, name: "Colossus", equivalent: "Powers an apartment for 4 months" },
  { level: 24, thresholdWh: 5_000_000, name: "Powergrid", equivalent: "~5 months of household power" },
  { level: 25, thresholdWh: 7_200_000, name: "Renewable Rebel", equivalent: "Powers an apartment for half a year" },
  { level: 26, thresholdWh: 10_400_000, name: "Off-Grid Legend", equivalent: "~1 year of household power" },
  { level: 27, thresholdWh: 15_000_000, name: "Net-Zero Master", equivalent: "~1.5 years of household power" },
  {
    level: 28,
    thresholdWh: 22_000_000,
    name: "Solar Rival",
    equivalent: "Slightly over 2 years of household power",
  },
  { level: 29, thresholdWh: 32_000_000, name: "Energy Icon", equivalent: "Powers 3 homes for a year" },
  { level: 30, thresholdWh: 50_000_000, name: "Net-Zero Legend", equivalent: "Powers multiple homes for years" },
];

const MAX_LEVEL = TIERS.length;

/** The tier for a given level, or undefined at level 0 (unranked). */
export function tierForLevel(level: number): Tier | undefined {
  const clamped = Math.max(0, Math.min(Math.floor(level), MAX_LEVEL));
  return clamped === 0 ? undefined : TIERS[clamped - 1];
}

// Named xpForLevel (not tierThresholdWh) to match progressToNextLevel's
// existing "xp" vocabulary below -- "xp" here just means elexir/Wh.
export function xpForLevel(level: number): number {
  const clamped = Math.max(0, Math.min(Math.floor(level), MAX_LEVEL));
  return clamped === 0 ? 0 : TIERS[clamped - 1].thresholdWh;
}

export function levelForXp(xp: number): number {
  if (xp <= 0) return 0;
  let level = 0;
  for (const tier of TIERS) {
    if (tier.thresholdWh > xp) break;
    level = tier.level;
  }
  return level;
}

export interface LevelProgress {
  level: number;
  /** The current tier's details, or undefined at level 0 (unranked). */
  tier: Tier | undefined;
  /** The next tier to reach, or undefined at max level (30). */
  nextTier: Tier | undefined;
  xpIntoLevel: number;
  xpRemaining: number;
  progressFraction: number; // 0-1
}

// Everything a progress bar/level display needs, from just the xp a caller
// already has -- no formula (or tier lookup) duplicated at every call site.
export function progressToNextLevel(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const currentThreshold = xpForLevel(level);

  if (level >= MAX_LEVEL) {
    return {
      level,
      tier: tierForLevel(level),
      nextTier: undefined,
      xpIntoLevel: xp - currentThreshold,
      xpRemaining: 0,
      progressFraction: 1,
    };
  }

  const nextThreshold = xpForLevel(level + 1);
  const xpIntoLevel = xp - currentThreshold;
  const levelSpan = nextThreshold - currentThreshold;

  return {
    level,
    tier: tierForLevel(level),
    nextTier: tierForLevel(level + 1),
    xpIntoLevel,
    xpRemaining: nextThreshold - xp,
    progressFraction: Math.min(xpIntoLevel / levelSpan, 1),
  };
}
