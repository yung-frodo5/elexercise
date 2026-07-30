"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { supabase } from "../../../lib/supabase";
import { useSupabaseSession } from "../../../lib/useSession";
import { useProfile } from "../../../lib/useProfile";
import { LevelProgress } from "../../../components/profile/LevelProgress";
import { AvatarCircle } from "../../../components/profile/AvatarCircle";
import { UN_COUNTRIES } from "../../../lib/unCountries";

export default function ProfilePage() {
  const { session } = useSupabaseSession();
  const { displayName, level, elexir, avatarUrl, homeRegion, setDisplayName, setAvatarUrl, setHomeRegion } =
    useProfile(session?.user.id);

  const [displayNameInput, setDisplayNameInput] = useState("");
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [homeRegionInput, setHomeRegionInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (displayName !== null) setDisplayNameInput(displayName);
  }, [displayName]);

  useEffect(() => {
    if (avatarUrl !== null) setAvatarUrlInput(avatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    if (homeRegion !== null) setHomeRegionInput(homeRegion);
  }, [homeRegion]);

  function handleAvatarFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setAvatarUrlInput(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    setStatus(null);
    setSaving(true);
    const trimmedName = displayNameInput.trim();
    const trimmedAvatarUrl = avatarUrlInput.trim();
    const trimmedHomeRegion = homeRegionInput.trim();
    // RLS's profiles_update_own policy ensures a user can only update their own row.
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmedName, avatar_url: trimmedAvatarUrl || null, home_region: trimmedHomeRegion })
      .eq("id", session.user.id);
    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setDisplayName(trimmedName);
      setAvatarUrl(trimmedAvatarUrl);
      setHomeRegion(trimmedHomeRegion);
      setStatus("Saved");
    }
    setSaving(false);
  }

  return (
    <main style={{ padding: theme.spacing.xl, maxWidth: 360, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
        <h1 style={{ margin: 0, color: "#228B22" }}>{displayNameInput || "Profile Details"}</h1>
        <AvatarCircle src={avatarUrlInput} size={40} />
      </div>

      {level !== null && elexir !== null && (
        <div style={{ marginTop: theme.spacing.xl }}>
          <LevelProgress level={level} elexir={elexir} />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ marginTop: theme.spacing.xl, display: "flex", flexDirection: "column", gap: theme.spacing.sm }}
      >
        <label style={{ color: theme.colors.navy, fontSize: theme.typography.size.xs }}>Display name</label>
        <input value={displayNameInput} onChange={(e) => setDisplayNameInput(e.target.value)} />

        <label style={{ color: theme.colors.navy, fontSize: theme.typography.size.xs, marginTop: theme.spacing.lg }}>
          Avatar
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
          <AvatarCircle src={avatarUrlInput} size={40} />
          <input type="file" accept="image/*" onChange={handleAvatarFileChange} />
        </div>

        <label style={{ color: theme.colors.navy, fontSize: theme.typography.size.xs, marginTop: theme.spacing.lg }}>
          Home Region
        </label>
        <select value={homeRegionInput} onChange={(e) => setHomeRegionInput(e.target.value)}>
          <option value="" disabled>
            Select a country
          </option>
          {UN_COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <button type="submit" disabled={saving} style={{ marginTop: theme.spacing.sm }}>
          {saving ? "Saving…" : "Save"}
        </button>

        {status && <p style={{ color: theme.colors.navy }}>{status}</p>}
      </form>
    </main>
  );
}
