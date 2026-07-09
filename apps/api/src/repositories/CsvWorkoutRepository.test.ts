import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { CsvWorkoutRepository } from "../repositories/CsvWorkoutRepository.js";
import { WorkoutNotFoundError } from "../repositories/WorkoutRepository.js";

let tmpFile: string;
let repo: CsvWorkoutRepository;

beforeEach(async () => {
  tmpFile = path.join(await fs.mkdtemp(path.join(os.tmpdir(), "wo-csv-")), "workouts.csv");
  repo = new CsvWorkoutRepository(tmpFile);
});

afterAll(async () => {
  // best-effort cleanup; tmp dirs are per-test so this is not critical
});

describe("CsvWorkoutRepository", () => {
  it("returns an empty array before any workouts exist", async () => {
    expect(await repo.getWorkouts("user-1")).toEqual([]);
  });

  it("adds and retrieves a workout", async () => {
    const created = await repo.addWorkout({
      userId: "user-1",
      date: "2026-07-09",
      sets: [{ id: "s1", exerciseId: "squat", reps: 5, weightKg: 100 }],
    });

    expect(created.id).toBeTruthy();
    const fetched = await repo.getWorkoutById(created.id);
    expect(fetched?.sets[0].exerciseId).toBe("squat");
  });

  it("filters workouts by userId", async () => {
    await repo.addWorkout({ userId: "user-1", date: "2026-07-01", sets: [] });
    await repo.addWorkout({ userId: "user-2", date: "2026-07-02", sets: [] });
    const user1Workouts = await repo.getWorkouts("user-1");
    expect(user1Workouts).toHaveLength(1);
    expect(user1Workouts[0].userId).toBe("user-1");
  });

  it("updates a workout", async () => {
    const created = await repo.addWorkout({ userId: "user-1", date: "2026-07-01", sets: [] });
    const updated = await repo.updateWorkout(created.id, { notes: "felt strong" });
    expect(updated.notes).toBe("felt strong");
  });

  it("throws WorkoutNotFoundError when updating a missing workout", async () => {
    await expect(repo.updateWorkout("does-not-exist", { notes: "x" })).rejects.toBeInstanceOf(
      WorkoutNotFoundError
    );
  });

  it("deletes a workout", async () => {
    const created = await repo.addWorkout({ userId: "user-1", date: "2026-07-01", sets: [] });
    await repo.deleteWorkout(created.id);
    expect(await repo.getWorkoutById(created.id)).toBeNull();
  });

  it("serializes concurrent writes without corrupting the file", async () => {
    const writes = Array.from({ length: 20 }, (_, i) =>
      repo.addWorkout({ userId: "user-1", date: `2026-07-${(i % 28) + 1}`, sets: [] })
    );
    await Promise.all(writes);
    const all = await repo.getWorkouts("user-1");
    expect(all).toHaveLength(20);
    // all ids must be unique — a corrupted/interleaved write would duplicate or drop rows
    expect(new Set(all.map((w) => w.id)).size).toBe(20);
  });
});
