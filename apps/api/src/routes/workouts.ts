import { Router } from "express";
import type { WorkoutRepository } from "../repositories/WorkoutRepository.js";
import { WorkoutNotFoundError } from "../repositories/WorkoutRepository.js";

// Routes depend on the interface, injected in — not on any concrete
// repository. This is what makes swapping storage backends a one-line change.
export function createWorkoutRouter(repo: WorkoutRepository): Router {
  const router = Router();

  router.get("/workouts", async (req, res) => {
    const userId = req.query.userId as string | undefined;
    if (!userId) return res.status(400).json({ error: "userId query param is required" });
    const workouts = await repo.getWorkouts(userId);
    res.json(workouts);
  });

  router.get("/workouts/:id", async (req, res) => {
    const workout = await repo.getWorkoutById(req.params.id);
    if (!workout) return res.status(404).json({ error: "Workout not found" });
    res.json(workout);
  });

  router.post("/workouts", async (req, res) => {
    try {
      const workout = await repo.addWorkout(req.body);
      res.status(201).json(workout);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.patch("/workouts/:id", async (req, res) => {
    try {
      const workout = await repo.updateWorkout(req.params.id, req.body);
      res.json(workout);
    } catch (err) {
      if (err instanceof WorkoutNotFoundError) return res.status(404).json({ error: err.message });
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.delete("/workouts/:id", async (req, res) => {
    try {
      await repo.deleteWorkout(req.params.id);
      res.status(204).send();
    } catch (err) {
      if (err instanceof WorkoutNotFoundError) return res.status(404).json({ error: err.message });
      res.status(400).json({ error: (err as Error).message });
    }
  });

  return router;
}
