import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { startFakePowerGeneration, stopFakePowerGeneration } from "./fakePowerSimulator.js";

describe("fakePowerSimulator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("inserts one sample every 500ms while running", async () => {
    const insertSample = vi.fn().mockResolvedValue(undefined);
    startFakePowerGeneration("session-1", "Run", insertSample);

    await vi.advanceTimersByTimeAsync(500);
    expect(insertSample).toHaveBeenCalledTimes(1);
    expect(insertSample).toHaveBeenNthCalledWith(1, 500, expect.any(Number));

    await vi.advanceTimersByTimeAsync(500 * 4);
    expect(insertSample).toHaveBeenCalledTimes(5);
    expect(insertSample).toHaveBeenNthCalledWith(5, 2500, expect.any(Number));

    stopFakePowerGeneration("session-1");
  });

  it("stops inserting once stopped", async () => {
    const insertSample = vi.fn().mockResolvedValue(undefined);
    startFakePowerGeneration("session-2", "Walk", insertSample);

    await vi.advanceTimersByTimeAsync(1000);
    expect(insertSample).toHaveBeenCalledTimes(2);

    stopFakePowerGeneration("session-2");
    await vi.advanceTimersByTimeAsync(5000);
    expect(insertSample).toHaveBeenCalledTimes(2);
  });

  it("stopping a session that was never started is a no-op", () => {
    expect(() => stopFakePowerGeneration("never-started")).not.toThrow();
  });

  it("starting an already-running session does not double the timer", async () => {
    const insertSample = vi.fn().mockResolvedValue(undefined);
    startFakePowerGeneration("session-3", "Bike", insertSample);
    startFakePowerGeneration("session-3", "Bike", insertSample);

    await vi.advanceTimersByTimeAsync(1000);
    expect(insertSample).toHaveBeenCalledTimes(2);

    stopFakePowerGeneration("session-3");
  });

  it("auto-stops after the 2-hour safety cap", async () => {
    const insertSample = vi.fn().mockResolvedValue(undefined);
    startFakePowerGeneration("session-4", "Strength", insertSample);

    const twoHoursMs = 2 * 60 * 60 * 1000;
    await vi.advanceTimersByTimeAsync(twoHoursMs);
    const callsAtCap = insertSample.mock.calls.length;
    expect(callsAtCap).toBe(twoHoursMs / 500);

    await vi.advanceTimersByTimeAsync(5000);
    expect(insertSample).toHaveBeenCalledTimes(callsAtCap);
  });

  it("keeps ticking on subsequent ticks even if one insert rejects", async () => {
    const insertSample = vi
      .fn()
      .mockRejectedValueOnce(new Error("transient failure"))
      .mockResolvedValue(undefined);
    startFakePowerGeneration("session-5", "Row", insertSample);

    await vi.advanceTimersByTimeAsync(1500);
    expect(insertSample).toHaveBeenCalledTimes(3);

    stopFakePowerGeneration("session-5");
  });

  it("tracks independent sessions separately", async () => {
    const insertA = vi.fn().mockResolvedValue(undefined);
    const insertB = vi.fn().mockResolvedValue(undefined);
    startFakePowerGeneration("session-a", "Run", insertA);
    startFakePowerGeneration("session-b", "Walk", insertB);

    await vi.advanceTimersByTimeAsync(500);
    stopFakePowerGeneration("session-a");
    await vi.advanceTimersByTimeAsync(1000);

    expect(insertA).toHaveBeenCalledTimes(1);
    expect(insertB).toHaveBeenCalledTimes(3);

    stopFakePowerGeneration("session-b");
  });
});
