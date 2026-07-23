import type { Workout, WorkoutWithSessions, Session as WorkoutSession } from "@exercise-tracker/shared-types";

// iOS Simulator can reach your Mac's localhost directly.
// A physical device on the same Wi-Fi needs your Mac's LAN IP instead,
// e.g. "http://192.168.1.23:3001" (find it via `ipconfig getifaddr en0`).
export const API_URL = "http://localhost:3001";

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function getCurrentWorkout(accessToken: string): Promise<Workout | null> {
  const res = await fetch(`${API_URL}/api/workouts/current`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error(`Failed to load current workout (${res.status})`);
  return res.json();
}

export async function listWorkouts(accessToken: string): Promise<Workout[]> {
  const res = await fetch(`${API_URL}/api/workouts`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error(`Failed to load workouts (${res.status})`);
  return res.json();
}

export async function getWorkout(accessToken: string, id: string): Promise<WorkoutWithSessions> {
  const res = await fetch(`${API_URL}/api/workouts/${id}`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error(`Failed to load workout (${res.status})`);
  return res.json();
}

export async function startManualSession(
  accessToken: string,
  activityType: string,
): Promise<{ workout: Workout; session: WorkoutSession }> {
  const res = await fetch(`${API_URL}/api/sessions/manual`, {
    method: "POST",
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify({ activityType }),
  });
  if (!res.ok) throw new Error(`Failed to start session (${res.status})`);
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
