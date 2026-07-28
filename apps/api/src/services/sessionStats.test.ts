import { describe, it, expect } from "vitest";
import { computeSessionStats } from "./sessionStats.js";

describe("computeSessionStats", () => {
  it("returns null for zero samples", () => {
    expect(computeSessionStats([])).toBeNull();
  });

  it("computes avg/peak but zero energy for a single sample", () => {
    const stats = computeSessionStats([{ tMs: 0, powerW: 200 }]);
    expect(stats).toEqual({ avgPowerW: 200, peakPowerW: 200, totalEnergyJoules: 0 });
  });

  it("integrates constant power correctly", () => {
    // 200W held for 10 seconds (spaced 1s apart) -> 2000 J.
    const samples = Array.from({ length: 11 }, (_, i) => ({ tMs: i * 1000, powerW: 200 }));
    const stats = computeSessionStats(samples);
    expect(stats?.avgPowerW).toBe(200);
    expect(stats?.peakPowerW).toBe(200);
    expect(stats?.totalEnergyJoules).toBeCloseTo(2000, 5);
  });

  it("integrates a linear ramp via trapezoidal rule", () => {
    // 0W -> 100W over 10 seconds, spaced 1s apart. Trapezoidal area = 500 J.
    const samples = Array.from({ length: 11 }, (_, i) => ({ tMs: i * 1000, powerW: i * 10 }));
    const stats = computeSessionStats(samples);
    expect(stats?.peakPowerW).toBe(100);
    expect(stats?.avgPowerW).toBeCloseTo(50, 5);
    expect(stats?.totalEnergyJoules).toBeCloseTo(500, 5);
  });

  it("handles uneven spacing between samples", () => {
    const samples = [
      { tMs: 0, powerW: 100 },
      { tMs: 500, powerW: 100 },
      { tMs: 3000, powerW: 100 }, // a 2.5s gap
    ];
    const stats = computeSessionStats(samples);
    // Constant 100W regardless of spacing -> energy = 100 * total elapsed seconds.
    expect(stats?.totalEnergyJoules).toBeCloseTo(300, 5);
  });

  it("weights avgPowerW by time, not by sample count, when spacing is uneven", () => {
    // Two closely-spaced 0W samples followed by a sparse 300W sample far
    // later. A plain mean of the three values would give 100W, but nearly
    // all of the elapsed time was actually spent near 0W.
    const samples = [
      { tMs: 0, powerW: 0 },
      { tMs: 100, powerW: 0 },
      { tMs: 3000, powerW: 300 },
    ];
    const stats = computeSessionStats(samples);
    // Trapezoidal energy: (0-0.1s at 0W) + (0.1-3s ramping 0->300W, avg 150W over 2.9s) = 435 J.
    expect(stats?.totalEnergyJoules).toBeCloseTo(435, 5);
    // avgPowerW = energy / elapsed time = 435 / 3 = 145 W, not the naive mean of 100 W.
    expect(stats?.avgPowerW).toBeCloseTo(145, 5);
  });
});
