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

export default function ProfileScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
      <Text style={styles.title}>Profile</Text>

      <Text style={styles.label}>Email</Text>
      <Text>{user?.email}</Text>

      <Text style={styles.label}>Home region</Text>
      <Text>{profile.home_region}</Text>

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
    paddingTop: 72,
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
  title: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    marginBottom: theme.spacing.lg,
    color: theme.colors.textPrimary,
  },
  label: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textMuted,
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
