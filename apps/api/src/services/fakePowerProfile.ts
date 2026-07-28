// Pure power-value generation for the fake telemetry simulator. No I/O, no
// timers — everything here is a deterministic function of the state it's
// handed plus an injectable RNG, so it can be unit tested without mocking
// time. Everything in this file produces SIMULATED data only; nothing here
// is reused by a real telemetry ingestion path.

type Band = { min: number; max: number };
type Random = () => number;

const GLOBAL_MIN_W = 0;
const GLOBAL_MAX_W = 800;

const CARDIO_BANDS: Record<string, Band> = {
  walk: { min: 40, max: 110 },
  bike: { min: 110, max: 320 },
  run: { min: 140, max: 380 },
};
const DEFAULT_CARDIO_BAND: Band = { min: 80, max: 250 };

interface StrengthProfile {
  restBand: Band;
  peakBand: Band;
  riseTicks: [number, number];
  fallTicks: [number, number];
}

const STRENGTH_PROFILES: Record<string, StrengthProfile> = {
  row: { restBand: { min: 20, max: 50 }, peakBand: { min: 350, max: 650 }, riseTicks: [2, 3], fallTicks: [5, 9] },
  strength: {
    restBand: { min: 10, max: 40 },
    peakBand: { min: 450, max: 750 },
    riseTicks: [2, 3],
    fallTicks: [6, 12],
  },
};

interface CardioFakeState {
  category: "cardio";
  band: Band;
  current: number;
  target: number;
}

interface StrengthFakeState {
  category: "strength";
  restBand: Band;
  peakBand: Band;
  riseTicks: [number, number];
  fallTicks: [number, number];
  current: number;
  phase: "rise" | "fall";
  ticksLeftInPhase: number;
}

export type FakeGeneratorState = CardioFakeState | StrengthFakeState;

function categorizeFakeActivity(activityType: string): "cardio" | "strength" {
  const normalized = activityType.trim().toLowerCase();
  return normalized === "row" || normalized === "strength" ? "strength" : "cardio";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function randomInRange(random: Random, band: Band): number {
  return band.min + random() * (band.max - band.min);
}

function randomTickCount(random: Random, [min, max]: [number, number]): number {
  return min + Math.floor(random() * (max - min + 1));
}

export function createFakeGeneratorState(activityType: string, random: Random = Math.random): FakeGeneratorState {
  const normalized = activityType.trim().toLowerCase();

  if (categorizeFakeActivity(activityType) === "strength") {
    const profile = STRENGTH_PROFILES[normalized] ?? STRENGTH_PROFILES.strength;
    return {
      category: "strength",
      restBand: profile.restBand,
      peakBand: profile.peakBand,
      riseTicks: profile.riseTicks,
      fallTicks: profile.fallTicks,
      current: profile.restBand.min,
      phase: "rise",
      ticksLeftInPhase: randomTickCount(random, profile.riseTicks),
    };
  }

  const band = CARDIO_BANDS[normalized] ?? DEFAULT_CARDIO_BAND;
  const start = band.min + (band.max - band.min) * 0.4;
  return { category: "cardio", band, current: start, target: start };
}

const CARDIO_MAX_STEP_W = 15;
const CARDIO_NOISE_W = 6;
const CARDIO_RETARGET_CHANCE = 0.15;

function nextCardioSample(state: CardioFakeState, random: Random): { powerW: number; state: FakeGeneratorState } {
  const target = random() < CARDIO_RETARGET_CHANCE ? randomInRange(random, state.band) : state.target;
  const step = clamp(target - state.current, -CARDIO_MAX_STEP_W, CARDIO_MAX_STEP_W);
  const noise = (random() - 0.5) * CARDIO_NOISE_W;
  const current = clamp(state.current + step + noise, state.band.min, state.band.max);

  return {
    powerW: Math.round(clamp(current, GLOBAL_MIN_W, GLOBAL_MAX_W)),
    state: { ...state, current, target },
  };
}

const STRENGTH_RISE_NOISE_W = 20;
const STRENGTH_FALL_NOISE_W = 10;

function nextStrengthSample(state: StrengthFakeState, random: Random): { powerW: number; state: FakeGeneratorState } {
  let { current, phase, ticksLeftInPhase } = state;
  const ticksRemaining = Math.max(ticksLeftInPhase, 1);

  if (phase === "rise") {
    const target = randomInRange(random, state.peakBand);
    current = current + (target - current) / ticksRemaining + (random() - 0.5) * STRENGTH_RISE_NOISE_W;
  } else {
    const target = randomInRange(random, state.restBand);
    current = current - (current - target) / ticksRemaining + (random() - 0.5) * STRENGTH_FALL_NOISE_W;
  }

  current = clamp(current, GLOBAL_MIN_W, GLOBAL_MAX_W);
  ticksLeftInPhase -= 1;

  if (ticksLeftInPhase <= 0) {
    phase = phase === "rise" ? "fall" : "rise";
    ticksLeftInPhase = randomTickCount(random, phase === "fall" ? state.fallTicks : state.riseTicks);
  }

  return {
    powerW: Math.round(current),
    state: { ...state, current, phase, ticksLeftInPhase },
  };
}

export function nextFakeSample(state: FakeGeneratorState, random: Random = Math.random): {
  powerW: number;
  state: FakeGeneratorState;
} {
  return state.category === "cardio" ? nextCardioSample(state, random) : nextStrengthSample(state, random);
}
