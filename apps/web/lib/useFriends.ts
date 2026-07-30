"use client";

import { useCallback, useEffect, useState } from "react";
import type { Profile } from "@exercise-tracker/shared-types";
import { supabase } from "./supabase";

export function useFriends(userId: string | undefined): {
  friends: Profile[];
  loading: boolean;
  error: string | null;
  addFriend: (displayName: string) => Promise<{ ok: true } | { ok: false; error: string }>;
} {
  const [friends, setFriends] = useState<Profile[]>([]);
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

    const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("id", friendIds);
    if (profilesError) {
      setError(profilesError.message);
      setLoading(false);
      return;
    }
    setFriends((profiles ?? []) as Profile[]);
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
