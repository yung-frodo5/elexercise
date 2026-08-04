"use client";

import { useEffect, useState } from "react";
import type { BadgeCategory } from "@exercise-tracker/shared-types";
import { supabase } from "./supabase";

export interface EarnedBadge {
  id: string;
  name: string;
  tagline: string | null;
  category: BadgeCategory;
  criteria: string;
  emoji: string;
  earnedAt: string;
}

/** This user's earned badges, full catalog details joined in (name/emoji/criteria/etc.), most recently earned first. */
export function useEarnedBadges(userId: string | undefined): { badges: EarnedBadge[]; loading: boolean } {
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setBadges([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    void supabase
      .from("user_badges")
      .select("earned_at, badges(id, name, tagline, category, criteria, emoji)")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false })
      .then(({ data }) => {
        // Same embedded-relation caveat as useProfile.ts/useFriends.ts --
        // badges is really a single object here (badge_id is many-to-one),
        // not the array supabase-js's default types claim.
        const rows = (data ?? []) as unknown as {
          earned_at: string;
          badges: Omit<EarnedBadge, "earnedAt"> | null;
        }[];
        setBadges(
          rows
            .filter((row) => row.badges !== null)
            .map((row) => ({ ...row.badges!, earnedAt: row.earned_at }))
        );
        setLoading(false);
      });
  }, [userId]);

  return { badges, loading };
}
