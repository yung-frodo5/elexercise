"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { supabase } from "../../lib/supabase";
import { useSupabaseSession } from "../../lib/useSession";

type Mode = "signIn" | "signUp";

// Same green-pill style as Add/Connect/Add friend/Save elsewhere.
const pillButtonStyle: CSSProperties = {
  padding: `${theme.spacing.xs}px ${theme.spacing.lg}px`,
  borderRadius: theme.radii.pill,
  border: "none",
  background: theme.colors.primaryGreen,
  color: "#FFFFFF",
  fontWeight: theme.typography.weight.semibold,
  fontFamily: "'Clash Display', sans-serif",
  fontSize: theme.typography.size.sm,
  cursor: "pointer",
};

export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { session } = useSupabaseSession();

  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (open && session) {
      onClose();
    }
  }, [open, session, onClose]);

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
          backgroundColor: theme.colors.static.darkPanelBg,
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
            color: "#FFFFFF",
          }}
        >
          {theme.icons.close}
        </button>
        <p style={{ color: "#FFFFFF", marginTop: 0, fontSize: theme.typography.size.sm }}>
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
          {error && (
            // static.errorInkOnDarkPanel, not the plain error hex -- this modal's
            // card is always the static navy darkPanelBg, and the plain error
            // red is too dark to read there (a pre-existing failure, not caused
            // by dark mode).
            <p style={{ color: theme.colors.static.errorInkOnDarkPanel, fontSize: theme.typography.size.sm }}>
              {error}
            </p>
          )}
          {info && <p style={{ color: "#FFFFFF", fontSize: theme.typography.size.sm }}>{info}</p>}
          {mode === "signUp" && (
            <p style={{ color: "#FFFFFF", fontSize: theme.typography.size.sm, margin: 0 }}>
              Note: verification email may be routed to your spam folder.
            </p>
          )}
          <button type="submit" style={pillButtonStyle}>
            {mode === "signIn" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          onClick={() => {
            setMode(mode === "signIn" ? "signUp" : "signIn");
            setError(null);
            setInfo(null);
          }}
          style={{ ...pillButtonStyle, background: theme.colors.error, marginTop: theme.spacing.sm, width: "100%" }}
        >
          {mode === "signIn" ? "Need an account? Create one" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
