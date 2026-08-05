"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { supabase } from "../../../lib/supabase";
import { useSupabaseSession } from "../../../lib/useSession";
import { useProfile } from "../../../lib/useProfile";
import { useEarnedBadges, type EarnedBadge } from "../../../lib/useEarnedBadges";
import { LevelProgress } from "../../../components/profile/LevelProgress";
import { AvatarCircle } from "../../../components/profile/AvatarCircle";
import { EarnedBadges } from "../../../components/profile/EarnedBadges";
import { UN_COUNTRIES } from "../../../lib/unCountries";

export default function ProfilePage() {
  const { session } = useSupabaseSession();
  const {
    displayName,
    level,
    elexir,
    avatarUrl,
    homeRegion,
    selectedBadgeId,
    badgeEmoji,
    setDisplayName,
    setAvatarUrl,
    setHomeRegion,
    setSelectedBadge,
  } = useProfile(session?.user.id);
  const { badges: earnedBadges, loading: badgesLoading } = useEarnedBadges(session?.user.id);

  const [displayNameInput, setDisplayNameInput] = useState("");
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [homeRegionInput, setHomeRegionInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [badgeError, setBadgeError] = useState<string | null>(null);

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

  async function handleSelectBadge(badge: EarnedBadge | null) {
    if (!session) return;
    setBadgeError(null);
    // RLS's column-scoped grant lets a user update their own
    // selected_badge_id; the enforce_selected_badge_earned trigger
    // (0012_selected_badge_avatar.sql) rejects anything not in this same
    // user's user_badges, so this can't be spoofed to an unearned badge.
    const { error } = await supabase
      .from("profiles")
      .update({ selected_badge_id: badge?.id ?? null })
      .eq("id", session.user.id);
    if (error) {
      setBadgeError(error.message);
      return;
    }
    setSelectedBadge(badge?.id ?? null, badge?.emoji ?? null);
  }

  return (
    <main style={{ padding: theme.spacing.xl, maxWidth: 360, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
        <h1 style={{ margin: 0, color: theme.colors.themed.brandAccent, fontSize: theme.typography.size.lg }}>
          {displayNameInput || "Profile Details"}
        </h1>
        <AvatarCircle src={avatarUrlInput} size={40} badgeEmoji={badgeEmoji} />
      </div>

      {level !== null && elexir !== null && (
        <div style={{ marginTop: theme.spacing.xl }}>
          <LevelProgress level={level} elexir={elexir} />
        </div>
      )}

      <div style={{ marginTop: theme.spacing.xl }}>
        <h2 style={{ margin: 0, color: theme.colors.navy, fontSize: theme.typography.size.md }}>Badges</h2>
        <div style={{ marginTop: theme.spacing.sm }}>
          <EarnedBadges
            badges={earnedBadges}
            loading={badgesLoading}
            selectedBadgeId={selectedBadgeId}
            onSelect={(badge) => void handleSelectBadge(badge)}
          />
        </div>
        {badgeError && (
          <p style={{ marginTop: theme.spacing.xs, color: theme.colors.themed.error, fontSize: theme.typography.size.sm }}>
            {badgeError}
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ marginTop: theme.spacing.xl, display: "flex", flexDirection: "column", gap: theme.spacing.sm }}
      >
        <label style={{ color: theme.colors.navy, fontSize: theme.typography.size.sm }}>Display name</label>
        <input value={displayNameInput} onChange={(e) => setDisplayNameInput(e.target.value)} />

        <label style={{ color: theme.colors.navy, fontSize: theme.typography.size.sm, marginTop: theme.spacing.lg }}>
          Avatar
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
          <AvatarCircle src={avatarUrlInput} size={40} badgeEmoji={badgeEmoji} />
          {/* fontSize here also reaches the native "Choose File" button --
              its ::file-selector-button rule (layout.tsx) inherits from
              this input. */}
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarFileChange}
            style={{ fontSize: theme.typography.size.xxs }}
          />
        </div>

        <label style={{ color: theme.colors.navy, fontSize: theme.typography.size.sm, marginTop: theme.spacing.lg }}>
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

        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: theme.spacing.sm,
            padding: `${theme.spacing.xs}px ${theme.spacing.lg}px`,
            borderRadius: theme.radii.pill,
            border: "none",
            background: theme.colors.primaryGreen,
            color: "#FFFFFF",
            fontWeight: theme.typography.weight.semibold,
            fontFamily: "'Clash Display', sans-serif",
            fontSize: theme.typography.size.sm,
            cursor: "pointer",
          }}
        >
          {saving ? "Saving…" : "Save"}
        </button>

        {status && <p style={{ color: theme.colors.navy }}>{status}</p>}
      </form>
    </main>
  );
}
