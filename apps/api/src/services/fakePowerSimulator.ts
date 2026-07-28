// Timer orchestration for simulated real-time telemetry. Ticks every 500ms
// for as long as a session stays in_progress, writing believable fake
// PowerSamples via the caller-supplied insertSample callback (kept decoupled
// from any concrete repository). Nothing here is reused by a real telemetry
// ingestion path — see fakePowerProfile.ts for the value-generation logic.

import { createFakeGeneratorState, nextFakeSample, type FakeGeneratorState } from "./fakePowerProfile.js";

const TICK_MS = 500;
// Safety net against a session left open indefinitely (e.g. the user
// forgets to hit "End workout") running its timer forever.
const MAX_DURATION_MS = 2 * 60 * 60 * 1000;

interface RunningFakeGenerator {
  timer: ReturnType<typeof setInterval>;
  tMs: number;
  state: FakeGeneratorState;
}

const running = new Map<string, RunningFakeGenerator>();

export function startFakePowerGeneration(
  sessionId: string,
  activityType: string,
  insertSample: (tMs: number, powerW: number) => Promise<void>
): void {
  if (running.has(sessionId)) return;

  const entry: RunningFakeGenerator = {
    tMs: 0,
    state: createFakeGeneratorState(activityType),
    timer: setInterval(() => tick(sessionId, insertSample), TICK_MS),
  };
  running.set(sessionId, entry);
}

function tick(sessionId: string, insertSample: (tMs: number, powerW: number) => Promise<void>): void {
  const entry = running.get(sessionId);
  if (!entry) return;

  entry.tMs += TICK_MS;
  const { powerW, state } = nextFakeSample(entry.state);
  entry.state = state;

  insertSample(entry.tMs, powerW).catch((err) => {
    console.error(`fakePowerSimulator: failed to insert sample for session ${sessionId}`, err);
  });

  if (entry.tMs >= MAX_DURATION_MS) {
    stopFakePowerGeneration(sessionId);
  }
}

export function stopFakePowerGeneration(sessionId: string): void {
  const entry = running.get(sessionId);
  if (!entry) return;
  clearInterval(entry.timer);
  running.delete(sessionId);
}
