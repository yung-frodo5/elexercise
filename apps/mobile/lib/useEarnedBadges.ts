import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// Mirrors apps/web/lib/useEarnedBadges.ts -- same shape, same embedded-
// relation caveat (badges is really a single object per row, not the array
// supabase-js's default types claim, since badge_id is many-to-one).
export interface EarnedBadge {
  id: string;
  name: string;
  tagline: string | null;
  category: string;
  criteria: string;
  emoji: string;
  earnedAt: string;
}

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
