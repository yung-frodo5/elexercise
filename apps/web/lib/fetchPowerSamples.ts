import { supabase } from "./supabase";
import type { PowerSamplePoint } from "./usePowerSamples";

/** Client cache for completed-session samples (history expand / re-open). */
const cache = new Map<string, PowerSamplePoint[]>();
const CACHE_LIMIT = 64;

function remember(sessionId: string, samples: PowerSamplePoint[]) {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(sessionId, samples);
}

/** One-shot fetch of a session's power samples (no realtime). */
export async function fetchPowerSamples(sessionId: string): Promise<PowerSamplePoint[]> {
  const hit = cache.get(sessionId);
  if (hit) return hit;

  const { data, error } = await supabase
    .from("power_samples")
    .select("t_ms, power_w")
    .eq("session_id", sessionId)
    .order("t_ms");
  if (error) throw new Error(error.message);

  const samples = (data ?? []).map((row) => ({ tMs: row.t_ms, powerW: row.power_w }));
  remember(sessionId, samples);
  return samples;
}
