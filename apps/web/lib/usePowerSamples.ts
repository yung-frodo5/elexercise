"use client";

import { useEffect, useMemo, useState } from "react";
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface PowerSamplePoint {
  tMs: number;
  powerW: number;
}

interface PowerSampleRow {
  session_id: string;
  t_ms: number;
  power_w: number;
}

// Samples are kept as tMs -> powerW so the initial select and the realtime
// subscription (started before that select resolves) can both merge into
// the same map without needing to know which one saw a given row first.
//
// `live` controls whether a Realtime subscription is opened at all — a
// completed session's samples never change, so browsing history has nothing
// to subscribe to and just does the one-time select.
export function usePowerSamples(
  sessionId: string | null,
  { live = true }: { live?: boolean } = {}
): {
  samples: PowerSamplePoint[];
  loading: boolean;
  error: string | null;
} {
  const [samplesById, setSamplesById] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSamplesById(new Map());
    setError(null);

    if (!sessionId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const channel = live
      ? supabase
          .channel(`power-samples-${sessionId}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "power_samples", filter: `session_id=eq.${sessionId}` },
            (payload: RealtimePostgresInsertPayload<PowerSampleRow>) => {
              setSamplesById((prev) => new Map(prev).set(payload.new.t_ms, payload.new.power_w));
            }
          )
          .subscribe()
      : null;

    void supabase
      .from("power_samples")
      .select("t_ms, power_w")
      .eq("session_id", sessionId)
      .order("t_ms")
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setSamplesById((prev) => {
            const next = new Map(prev);
            for (const row of data) next.set(row.t_ms, row.power_w);
            return next;
          });
        }
        setLoading(false);
      });

    return () => {
      if (channel) void supabase.removeChannel(channel);
    };
  }, [sessionId, live]);

  const samples = useMemo(
    () =>
      Array.from(samplesById.entries())
        .sort(([a], [b]) => a - b)
        .map(([tMs, powerW]) => ({ tMs, powerW })),
    [samplesById]
  );

  return { samples, loading, error };
}
