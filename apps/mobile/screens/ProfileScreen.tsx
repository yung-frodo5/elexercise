import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
      <Button title="Save" onPress={save} disabled={saving} />
      {status && <Text>{status}</Text>}

      <Button title="Sign out" onPress={() => void signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 72,
    paddingHorizontal: 24,
    gap: 8,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#888",
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
