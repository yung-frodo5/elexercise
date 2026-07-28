import { Router } from "express";
import type { WorkoutRepository } from "../repositories/WorkoutRepository.js";
import { WorkoutNotFoundError } from "../repositories/WorkoutRepository.js";
import { stopFakePowerGeneration } from "../services/fakePowerSimulator.js";

// Routes depend on the interface, injected in — not on any concrete
// repository. Mounted behind requireAuth, so req.userId is always set.
export function createWorkoutRouter(repo: WorkoutRepository): Router {
  const router = Router();

  // Must come before /workouts/:id, or "current" would match as an id.
  router.get("/workouts/current", async (req, res) => {
    const workout = await repo.getCurrentWorkout(req.userId!);
    res.json(workout);
  });

  router.get("/workouts/:id", async (req, res) => {
    const workout = await repo.getWorkoutById(req.userId!, req.params.id);
    if (!workout) return res.status(404).json({ error: "Workout not found" });
    res.json(workout);
  });

  router.get("/workouts", async (req, res) => {
    const workouts = await repo.listWorkouts(req.userId!);
    res.json(workouts);
  });

  router.post("/workouts/:id/end", async (req, res) => {
    try {
      const { closedSessionIds, ...workout } = await repo.endWorkout(req.userId!, req.params.id);
      for (const id of closedSessionIds ?? []) stopFakePowerGeneration(id);
      res.json(workout);
    } catch (err) {
      if (err instanceof WorkoutNotFoundError) return res.status(404).json({ error: err.message });
      res.status(400).json({ error: (err as Error).message });
    }
  });

  return router;
}
