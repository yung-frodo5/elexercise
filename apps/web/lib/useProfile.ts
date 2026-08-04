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
  selectedBadgeId: string | null;
  // Resolved via the selected_badge_id -> badges FK embed at fetch time --
  // null when no badge is selected (avatarUrl applies as normal), so every
  // avatar-rendering call site can just check this one field instead of
  // separately joining against the badges catalog itself.
  badgeEmoji: string | null;
}

const EMPTY_PROFILE: CachedProfile = {
  displayName: null,
  level: null,
  elexir: null,
  avatarUrl: null,
  homeRegion: null,
  selectedBadgeId: null,
  badgeEmoji: null,
};

const cache = new Map<string, CachedProfile>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("display_name, level, elexir, avatar_url, home_region, selected_badge_id, badges(emoji)")
    .eq("id", userId)
    .single();
  // supabase-js types the embedded `badges` relation as an array regardless
  // of the FK's actual to-one cardinality (same caveat noted in
  // SupabaseWorkoutRepository.ts) -- it's really a single object or null at
  // runtime, so cast through unknown rather than trust the array type.
  const badge = (data as unknown as { badges: { emoji: string } | null } | null)?.badges ?? null;
  cache.set(userId, {
    displayName: data?.display_name ?? null,
    level: data?.level ?? null,
    elexir: data?.elexir ?? null,
    avatarUrl: data?.avatar_url ?? null,
    homeRegion: data?.home_region ?? null,
    selectedBadgeId: data?.selected_badge_id ?? null,
    badgeEmoji: badge?.emoji ?? null,
  });
  notify();
}

export function useProfile(userId: string | undefined): {
  displayName: string | null;
  level: number | null;
  elexir: number | null;
  avatarUrl: string | null;
  homeRegion: string | null;
  selectedBadgeId: string | null;
  badgeEmoji: string | null;
  setDisplayName: (next: string) => void;
  setAvatarUrl: (next: string) => void;
  setHomeRegion: (next: string) => void;
  setSelectedBadge: (badgeId: string | null, emoji: string | null) => void;
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
    selectedBadgeId: cached?.selectedBadgeId ?? null,
    badgeEmoji: cached?.badgeEmoji ?? null,
    setDisplayName(next) {
      if (userId) set(userId, { displayName: next });
    },
    setAvatarUrl(next) {
      if (userId) set(userId, { avatarUrl: next });
    },
    setHomeRegion(next) {
      if (userId) set(userId, { homeRegion: next });
    },
    setSelectedBadge(badgeId, emoji) {
      if (userId) set(userId, { selectedBadgeId: badgeId, badgeEmoji: emoji });
    },
  };
}
