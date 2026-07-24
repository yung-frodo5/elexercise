"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useSupabaseSession } from "../lib/useSession";

type Mode = "signIn" | "signUp";

export default function LandingPage() {
  const { session, loading } = useSupabaseSession();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (session) router.replace("/dashboard");
  }, [session, router]);

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

  if (loading || session) {
    return (
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 360 }}>
      <h1>Exercise Tracker</h1>
      <p>{mode === "signIn" ? "Sign in to continue" : "Create an account"}</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: "#b00020" }}>{error}</p>}
        {info && <p>{info}</p>}
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
    </main>
  );
}
