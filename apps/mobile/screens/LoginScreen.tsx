import { useState } from "react";
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

type Mode = "signIn" | "signUp";

export default function LoginScreen({ message }: { message?: string }) {
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
    <View style={styles.outer}>
      {message && (
        <View style={styles.messageBanner}>
          <Text style={styles.message}>{message}</Text>
        </View>
      )}
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
        color={theme.colors.primaryGreen}
      />
      <Button
        title="Continue with Google"
        onPress={submitGoogle}
        disabled={busy}
        color={theme.colors.primaryGreen}
      />
      <Button
        title={mode === "signIn" ? "Need an account? Create one" : "Have an account? Sign in"}
        onPress={() => {
          setMode(mode === "signIn" ? "signUp" : "signIn");
          setError(null);
          setInfo(null);
        }}
      />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  messageBanner: {
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  message: {
    textAlign: "center",
    color: theme.colors.textMuted,
    fontSize: theme.typography.size.sm,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.md,
    fontSize: theme.typography.size.md,
  },
});
