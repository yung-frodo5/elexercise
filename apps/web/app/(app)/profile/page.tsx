"use client";

import { useEffect, useState, type FormEvent } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { supabase } from "../../../lib/supabase";
import { useSupabaseSession } from "../../../lib/useSession";
import { useProfile } from "../../../lib/useProfile";

export default function ProfilePage() {
  const { session } = useSupabaseSession();
  const { displayName, setDisplayName } = useProfile(session?.user.id);

  const [displayNameInput, setDisplayNameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (displayName !== null) setDisplayNameInput(displayName);
  }, [displayName]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    setStatus(null);
    setSaving(true);
    const trimmed = displayNameInput.trim();
    // RLS's profiles_update_own policy ensures a user can only update their own row.
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("id", session.user.id);
    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setDisplayName(trimmed);
      setStatus("Saved");
    }
    setSaving(false);
  }

  return (
    <main style={{ padding: theme.spacing.xl, maxWidth: 360 }}>
      <h1 style={{ color: theme.colors.textPrimary }}>Profile Details</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
        <label style={{ color: theme.colors.textMuted, fontSize: theme.typography.size.xs }}>Display name</label>
        <input value={displayNameInput} onChange={(e) => setDisplayNameInput(e.target.value)} />
        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        {status && <p style={{ color: theme.colors.textMuted }}>{status}</p>}
      </form>

      <p style={{ marginTop: theme.spacing.xl, color: theme.colors.textMuted }}>
        TODO: show additional profile fields (home region, avatar)
      </p>
    </main>
  );
}
