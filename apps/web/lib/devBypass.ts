import type { WorkoutWithSessions } from "@exercise-tracker/shared-types";
import type { PowerSamplePoint } from "./usePowerSamples";
import { isDevBypassAuth } from "./devAuth";

type LocalBypass = {
  getMockHistoryWorkouts: () => WorkoutWithSessions[];
  getMockWorkoutDetail: (id: string) => WorkoutWithSessions | undefined;
  buildMockPowerSamples: (
    sessionId: string,
    durationSec: number,
    avgPowerW: number
  ) => PowerSamplePoint[];
};

function loadLocal(): LocalBypass | null {
  if (!isDevBypassAuth()) return null;
  try {
    // Optional machine-local file (gitignored). Present on this machine for UI preview.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("./devBypass.local") as LocalBypass;
  } catch {
    return null;
  }
}

export function loadDevHistoryMocks(): WorkoutWithSessions[] | null {
  return loadLocal()?.getMockHistoryWorkouts() ?? null;
}

export function loadDevWorkoutDetail(id: string): WorkoutWithSessions | null {
  return loadLocal()?.getMockWorkoutDetail(id) ?? null;
}

export function loadDevPowerSamples(
  sessionId: string,
  durationSec: number,
  avgPowerW: number
): PowerSamplePoint[] | null {
  return loadLocal()?.buildMockPowerSamples(sessionId, durationSec, avgPowerW) ?? null;
}
