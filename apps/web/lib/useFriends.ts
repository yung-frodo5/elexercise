"use client";

import { useCallback, useEffect, useState } from "react";
import type { Profile } from "@exercise-tracker/shared-types";
import { supabase } from "./supabase";

// Resolved the same way useProfile.ts's fetchProfile does -- see its
// comment on why this needs its own field rather than just exposing
// selected_badge_id and making callers do a second lookup.
export type FriendProfile = Profile & { badgeEmoji: string | null };

export function useFriends(userId: string | undefined): {
  friends: FriendProfile[];
  loading: boolean;
  error: string | null;
  addFriend: (displayName: string) => Promise<{ ok: true } | { ok: false; error: string }>;
} {
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setFriends([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data: links, error: linksError } = await supabase
      .from("friends")
      .select("friend_id")
      .eq("user_id", userId);
    if (linksError) {
      setError(linksError.message);
      setLoading(false);
      return;
    }

    const friendIds = (links ?? []).map((link) => link.friend_id);
    if (friendIds.length === 0) {
      setFriends([]);
      setLoading(false);
      return;
    }

    // badges(emoji) resolves each friend's selected-badge avatar in the
    // same query -- see useProfile.ts's fetchProfile for the same pattern
    // (and the note on why the embedded relation needs an unknown cast).
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*, badges(emoji)")
      .in("id", friendIds);
    if (profilesError) {
      setError(profilesError.message);
      setLoading(false);
      return;
    }
    setFriends(
      ((profiles ?? []) as unknown as (Profile & { badges: { emoji: string } | null })[]).map((row) => ({
        ...row,
        badgeEmoji: row.badges?.emoji ?? null,
      }))
    );
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function addFriend(displayName: string): Promise<{ ok: true } | { ok: false; error: string }> {
    if (!userId) return { ok: false, error: "Not signed in." };
    const trimmed = displayName.trim();
    if (!trimmed) return { ok: false, error: "Enter a display name." };

    // Escape ILIKE wildcards so a name containing % or _ is matched literally.
    const pattern = trimmed.replace(/[%_]/g, "\\$&");
    const { data: match, error: lookupError } = await supabase
      .from("profiles")
      .select("id")
      .ilike("display_name", pattern)
      .maybeSingle();
    if (lookupError) return { ok: false, error: lookupError.message };
    if (!match) return { ok: false, error: `No user named "${trimmed}".` };
    if (match.id === userId) return { ok: false, error: "You can't add yourself." };

    const { error: insertError } = await supabase.from("friends").insert({ user_id: userId, friend_id: match.id });
    if (insertError) {
      // Postgres unique_violation on the (user_id, friend_id) primary key.
      if (insertError.code === "23505") return { ok: false, error: `${trimmed} is already on your list.` };
      return { ok: false, error: insertError.message };
    }

    await reload();
    return { ok: true };
  }

  return { friends, loading, error, addFriend };
}
