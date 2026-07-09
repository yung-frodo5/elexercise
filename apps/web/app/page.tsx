import type { Workout } from "@exercise-tracker/shared-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function getWorkouts(userId: string): Promise<Workout[]> {
  const res = await fetch(`${API_URL}/api/workouts?userId=${userId}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function HomePage() {
  const workouts = await getWorkouts("demo-user");

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Exercise Tracker</h1>
      {workouts.length === 0 ? (
        <p>No workouts yet. Add one via the API to see it here.</p>
      ) : (
        <ul>
          {workouts.map((w) => (
            <li key={w.id}>
              {w.date} — {w.sets.length} set(s)
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
