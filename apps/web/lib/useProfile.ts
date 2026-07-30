"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// Module-level cache + subscriber list so every component calling useProfile()
// for the same user sees updates immediately (e.g. the header reflecting a
// name change saved from the profile page), without a full context provider.
interface CachedProfile {
  displayName: string | null;
  level: number | null;
  elexir: number | null;
  avatarUrl: string | null;
  homeRegion: string | null;
}

const EMPTY_PROFILE: CachedProfile = {
  displayName: null,
  level: null,
  elexir: null,
  avatarUrl: null,
  homeRegion: null,
};

const cache = new Map<string, CachedProfile>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("display_name, level, elexir, avatar_url, home_region")
    .eq("id", userId)
    .single();
  cache.set(userId, {
    displayName: data?.display_name ?? null,
    level: data?.level ?? null,
    elexir: data?.elexir ?? null,
    avatarUrl: data?.avatar_url ?? null,
    homeRegion: data?.home_region ?? null,
  });
  notify();
}

export function useProfile(userId: string | undefined): {
  displayName: string | null;
  level: number | null;
  elexir: number | null;
  avatarUrl: string | null;
  homeRegion: string | null;
  setDisplayName: (next: string) => void;
  setAvatarUrl: (next: string) => void;
  setHomeRegion: (next: string) => void;
} {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!userId) return;
    if (!cache.has(userId)) void fetchProfile(userId);
    const listener = () => setTick((tick) => tick + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [userId]);

  const cached = userId ? cache.get(userId) : undefined;

  function set(userId: string, patch: Partial<CachedProfile>) {
    const existing = cache.get(userId) ?? EMPTY_PROFILE;
    cache.set(userId, { ...existing, ...patch });
    notify();
  }

  return {
    displayName: cached?.displayName ?? null,
    level: cached?.level ?? null,
    elexir: cached?.elexir ?? null,
    avatarUrl: cached?.avatarUrl ?? null,
    homeRegion: cached?.homeRegion ?? null,
    setDisplayName(next) {
      if (userId) set(userId, { displayName: next });
    },
    setAvatarUrl(next) {
      if (userId) set(userId, { avatarUrl: next });
    },
    setHomeRegion(next) {
      if (userId) set(userId, { homeRegion: next });
    },
  };
}
