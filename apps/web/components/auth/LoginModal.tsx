"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@exercise-tracker/design-tokens";
import { supabase } from "../../lib/supabase";
import { useSupabaseSession } from "../../lib/useSession";

type Mode = "signIn" | "signUp";

export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { session } = useSupabaseSession();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (open && session) {
      onClose();
      router.push("/track");
    }
  }, [open, session, onClose, router]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (mode === "signIn") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setInfo("Account created. If email confirmation is required, check your inbox.");
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          backgroundColor: theme.colors.background,
          padding: theme.spacing.xl,
          maxWidth: 360,
          width: "90%",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: theme.spacing.sm,
            right: theme.spacing.sm,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: theme.typography.size.md,
            color: theme.colors.textPrimary,
          }}
        >
          {theme.icons.close}
        </button>
        <h1 style={{ margin: 0, color: theme.colors.textPrimary }}>Exercise Tracker</h1>
        <p style={{ color: theme.colors.textMuted }}>
          {mode === "signIn" ? "Sign in to continue" : "Create an account"}
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={{ color: theme.colors.error }}>{error}</p>}
          {info && <p style={{ color: theme.colors.textMuted }}>{info}</p>}
          <button type="submit">{mode === "signIn" ? "Sign in" : "Create account"}</button>
        </form>
        <button
          onClick={() => {
            setMode(mode === "signIn" ? "signUp" : "signIn");
            setError(null);
            setInfo(null);
          }}
        >
          {mode === "signIn" ? "Need an account? Create one" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
