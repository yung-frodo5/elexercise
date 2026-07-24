import type { Workout, WorkoutWithSessions, Session as WorkoutSession } from "@exercise-tracker/shared-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function getCurrentWorkout(accessToken: string): Promise<Workout | null> {
  const res = await fetch(`${API_URL}/api/workouts/current`, {
    headers: authHeaders(accessToken),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load current workout (${res.status})`);
  return res.json();
}

export async function listWorkouts(accessToken: string): Promise<Workout[]> {
  const res = await fetch(`${API_URL}/api/workouts`, {
    headers: authHeaders(accessToken),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load workouts (${res.status})`);
  return res.json();
}

export async function getWorkout(accessToken: string, id: string): Promise<WorkoutWithSessions> {
  const res = await fetch(`${API_URL}/api/workouts/${id}`, {
    headers: authHeaders(accessToken),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load workout (${res.status})`);
  return res.json();
}

export async function startManualSession(
  accessToken: string,
  activityType: string
): Promise<{ workout: Workout; session: WorkoutSession }> {
  const res = await fetch(`${API_URL}/api/sessions/manual`, {
    method: "POST",
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify({ activityType }),
  });
  if (!res.ok) throw new Error(`Failed to start session (${res.status})`);
  return res.json();
}

// scanToken is what identifies a machine (matches machines.scan_token —
// what a real QR/NFC scan would read). Manual entry stands in for that
// until real scanning is built.
export async function startMachineSession(
  accessToken: string,
  scanToken: string
): Promise<{ workout: Workout; session: WorkoutSession }> {
  const res = await fetch(`${API_URL}/api/sessions`, {
    method: "POST",
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify({ scanToken }),
  });
  if (!res.ok) throw new Error(`Failed to connect to machine (${res.status})`);
  return res.json();
}

export async function endSession(accessToken: string, id: string): Promise<WorkoutSession> {
  const res = await fetch(`${API_URL}/api/sessions/${id}/end`, {
    method: "POST",
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error(`Failed to end session (${res.status})`);
  return res.json();
}

export async function endWorkout(accessToken: string, id: string): Promise<Workout> {
  const res = await fetch(`${API_URL}/api/workouts/${id}/end`, {
    method: "POST",
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error(`Failed to end workout (${res.status})`);
  return res.json();
}
