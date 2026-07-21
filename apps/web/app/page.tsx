"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Workout } from "@exercise-tracker/shared-types";
import { supabase } from "../lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 280 }}>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p style={{ color: "#b00020" }}>{error}</p>}
      <button type="submit">Sign in</button>
    </form>
  );
}

function WorkoutList({ accessToken }: { accessToken: string }) {
  const [workouts, setWorkouts] = useState<Workout[] | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/workouts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : []))
      .then(setWorkouts);
  }, [accessToken]);

  if (workouts === null) return <p>Loading…</p>;
  if (workouts.length === 0) return <p>No workouts yet.</p>;

  return (
    <ul>
      {workouts.map((w) => (
        <li key={w.id}>
          {new Date(w.startedAt).toLocaleString()} — {w.status}
        </li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Exercise Tracker</h1>
      {loading ? <p>Loading…</p> : session ? <WorkoutList accessToken={session.access_token} /> : <LoginForm />}
    </main>
  );
}
