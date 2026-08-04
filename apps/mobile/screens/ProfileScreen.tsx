import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { theme } from "@exercise-tracker/design-tokens";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { LevelProgress } from "../components/profile/LevelProgress";
import { EarnedBadges } from "../components/profile/EarnedBadges";
import { useEarnedBadges, type EarnedBadge } from "../lib/useEarnedBadges";

export default function ProfileScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { badges: earnedBadges, loading: badgesLoading } = useEarnedBadges(user?.id);
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [badgeError, setBadgeError] = useState<string | null>(null);

  const selectedBadge = earnedBadges.find((b) => b.id === profile?.selected_badge_id) ?? null;

  async function selectBadge(badge: EarnedBadge | null) {
    if (!user) return;
    setBadgeError(null);
    // Same column-scoped grant + enforce_selected_badge_earned trigger as
    // web -- see supabase/migrations/0012_selected_badge_avatar.sql.
    const { error } = await supabase
      .from("profiles")
      .update({ selected_badge_id: badge?.id ?? null })
      .eq("id", user.id);
    if (error) {
      setBadgeError(error.message);
      return;
    }
    await refreshProfile();
  }

  useEffect(() => {
    if (profile) setDisplayName(profile.display_name);
  }, [profile?.display_name]);

  async function save() {
    if (!user) return;
    setStatus(null);
    setSaving(true);
    // RLS ensures a user can only update their own row.
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("id", user.id);
    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      await refreshProfile();
      setStatus("Saved");
    }
    setSaving(false);
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text>Loading profile…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Profile</Text>
        {selectedBadge && (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{selectedBadge.emoji}</Text>
          </View>
        )}
      </View>

      <Text style={styles.label}>Email</Text>
      <Text>{user?.email}</Text>

      <Text style={styles.label}>Home region</Text>
      <Text>{profile.home_region}</Text>

      <View style={styles.levelSection}>
        <LevelProgress level={profile.level} elexir={profile.elexir} />
      </View>

      <Text style={styles.label}>Badges</Text>
      <EarnedBadges
        badges={earnedBadges}
        loading={badgesLoading}
        selectedBadgeId={profile.selected_badge_id}
        onSelect={(badge) => void selectBadge(badge)}
      />
      {badgeError && <Text style={{ color: theme.colors.error }}>{badgeError}</Text>}

      <Text style={styles.label}>Display name</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="words"
      />

      {saving && <ActivityIndicator />}
      <Button title="Save" onPress={save} disabled={saving} color={theme.colors.primaryGreen} />
      {status && <Text>{status}</Text>}

      <Button title="Sign out" onPress={() => void signOut()} color={theme.colors.primaryGreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: theme.typography.size.md,
  },
  title: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  label: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  levelSection: {
    marginTop: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.md,
    fontSize: theme.typography.size.md,
  },
});
