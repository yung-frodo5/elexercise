import { useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

type Mode = "signIn" | "signUp";

export default function LoginScreen() {
  const { signInWithPassword, signUpWithPassword, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signIn") {
        await signInWithPassword(email.trim(), password);
      } else {
        await signUpWithPassword(email.trim(), password, displayName.trim() || undefined);
        setInfo("Account created. If email confirmation is required, check your inbox.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function submitGoogle() {
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Elexercise</Text>
      <Text>{mode === "signIn" ? "Sign in to continue" : "Create your account"}</Text>

      {mode === "signUp" && (
        <TextInput
          style={styles.input}
          placeholder="Display name (optional)"
          autoCapitalize="words"
          value={displayName}
          onChangeText={setDisplayName}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text>{error}</Text>}
      {info && <Text>{info}</Text>}
      {busy && <ActivityIndicator />}

      <Button
        title={mode === "signIn" ? "Sign in" : "Create account"}
        onPress={submit}
        disabled={busy}
      />
      <Button title="Continue with Google" onPress={submitGoogle} disabled={busy} />
      <Button
        title={mode === "signIn" ? "Need an account? Create one" : "Have an account? Sign in"}
        onPress={() => {
          setMode(mode === "signIn" ? "signUp" : "signIn");
          setError(null);
          setInfo(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
