import { describe, it, expect } from "vitest";
import { createFakeGeneratorState, nextFakeSample, type FakeGeneratorState } from "./fakePowerProfile.js";

// Deterministic seeded PRNG (mulberry32) so tests are reproducible instead
// of statistical/flaky, while still exercising a realistic spread of values.
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function collectSamples(activityType: string, seed: number, ticks: number) {
  const random = seededRandom(seed);
  let state: FakeGeneratorState = createFakeGeneratorState(activityType, random);
  const samples: number[] = [];
  const phases: string[] = [];
  for (let i = 0; i < ticks; i++) {
    // Label with the phase that PRODUCED this sample, not the phase the
    // state transitions to afterward — a rise->fall flip can happen on the
    // same tick that reaches peak power.
    if (state.category === "strength") phases.push(state.phase);
    const result = nextFakeSample(state, random);
    samples.push(result.powerW);
    state = result.state;
  }
  return { samples, phases };
}

describe("fakePowerProfile", () => {
  it("keeps every cardio sample within the global 0-800W bound", () => {
    for (const activity of ["Walk", "Run", "Bike", "Other Cardio Thing"]) {
      const { samples } = collectSamples(activity, 1, 500);
      for (const powerW of samples) {
        expect(powerW).toBeGreaterThanOrEqual(0);
        expect(powerW).toBeLessThanOrEqual(800);
      }
    }
  });

  it("keeps every strength sample within the global 0-800W bound", () => {
    for (const activity of ["Row", "Strength"]) {
      const { samples } = collectSamples(activity, 2, 500);
      for (const powerW of samples) {
        expect(powerW).toBeGreaterThanOrEqual(0);
        expect(powerW).toBeLessThanOrEqual(800);
      }
    }
  });

  it("keeps a Walk session strictly lower power than a Run session", () => {
    const walk = collectSamples("Walk", 3, 300).samples;
    const run = collectSamples("Run", 3, 300).samples;
    expect(Math.max(...walk)).toBeLessThan(Math.min(...run));
  });

  it("keeps Bike within its own band", () => {
    const bike = collectSamples("Bike", 4, 300).samples;
    for (const powerW of bike) {
      expect(powerW).toBeGreaterThanOrEqual(110);
      expect(powerW).toBeLessThanOrEqual(320);
    }
  });

  it("categorizes activity type case-insensitively", () => {
    const lower = collectSamples("run", 5, 200).samples;
    const upper = collectSamples("RUN", 5, 200).samples;
    for (const powerW of [...lower, ...upper]) {
      expect(powerW).toBeGreaterThanOrEqual(140);
      expect(powerW).toBeLessThanOrEqual(380);
    }
  });

  it("falls back to a default cardio band for unrecognized/free-text activity types", () => {
    const samples = collectSamples("Yoga", 6, 300).samples;
    for (const powerW of samples) {
      expect(powerW).toBeGreaterThanOrEqual(80);
      expect(powerW).toBeLessThanOrEqual(250);
    }
  });

  it("moves cardio power smoothly rather than jumping between ticks", () => {
    const samples = collectSamples("Run", 7, 200).samples;
    for (let i = 1; i < samples.length; i++) {
      expect(Math.abs(samples[i] - samples[i - 1])).toBeLessThanOrEqual(25);
    }
  });

  it("cycles strength power through rise and fall phases", () => {
    const { phases } = collectSamples("Strength", 8, 100);
    expect(phases).toContain("rise");
    expect(phases).toContain("fall");
    // A rise phase followed eventually by a fall phase confirms the rep
    // cycle actually alternates rather than getting stuck.
    const firstFallIndex = phases.indexOf("fall");
    expect(firstFallIndex).toBeGreaterThan(0);
    expect(phases.slice(firstFallIndex).includes("rise")).toBe(true);
  });

  it("spikes rapidly on rise and decays gradually on fall for a rep", () => {
    const random = seededRandom(9);
    let state = createFakeGeneratorState("Row", random);
    const ticks: { powerW: number; phase: string }[] = [];
    for (let i = 0; i < 30; i++) {
      const phase = state.category === "strength" ? state.phase : "n/a";
      const result = nextFakeSample(state, random);
      ticks.push({ powerW: result.powerW, phase });
      state = result.state;
    }

    const firstFallStart = ticks.findIndex((t) => t.phase === "fall");
    expect(firstFallStart).toBeGreaterThan(0);
    // Peak power at the start of the fall phase should be well above the
    // resting baseline power a few ticks into the fall.
    const peak = ticks[firstFallStart - 1].powerW;
    const laterInFall = ticks.slice(firstFallStart, firstFallStart + 4).at(-1)!.powerW;
    expect(peak).toBeGreaterThan(laterInFall);
  });
});
