"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// Module-level cache + subscriber list so every component calling useProfile()
// for the same user sees updates immediately (e.g. the header reflecting a
// name change saved from the profile page), without a full context provider.
const cache = new Map<string, string | null>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

async function fetchDisplayName(userId: string) {
  const { data } = await supabase.from("profiles").select("display_name").eq("id", userId).single();
  cache.set(userId, data?.display_name ?? null);
  notify();
}

export function useProfile(userId: string | undefined): {
  displayName: string | null;
  setDisplayName: (next: string) => void;
} {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!userId) return;
    if (!cache.has(userId)) void fetchDisplayName(userId);
    const listener = () => setTick((tick) => tick + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [userId]);

  return {
    displayName: userId ? cache.get(userId) ?? null : null,
    setDisplayName(next) {
      if (!userId) return;
      cache.set(userId, next);
      notify();
    },
  };
}
